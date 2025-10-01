import {
  UNSPLASH_SOURCE,
  UnsplashMissingKeyError,
  UnsplashRequestError,
  searchUnsplashImage,
  triggerUnsplashDownload,
} from '@/services/unsplash'
import type { Word } from '@/typings'
import type { IMediaAssetRecord } from '@/utils/db/record'
import { deleteMediaAsset, getCachedMediaAsset, pruneExpiredMediaAssets, saveMediaAsset } from '@/utils/mediaAssets'
import nlp from 'compromise'
import { useCallback, useEffect, useMemo, useState } from 'react'

const MAX_UNSPLASH_ATTEMPTS = 3

export type WordIllustrationStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export type WordIllustrationData = {
  source: typeof UNSPLASH_SOURCE
  url: string
  thumbUrl: string
  color?: string | null
  alt?: string | null
  description?: string | null
  photographer: {
    name: string
    username?: string | null
    url: string
  }
  downloadLocation: string
  query: string
  cached: boolean
}

export type WordIllustrationErrorCode = 'missing-key' | 'request-failed' | 'unknown'

export type WordIllustrationError = {
  code: WordIllustrationErrorCode
  message: string
}

export type UseWordIllustrationOptions = {
  enabled?: boolean
}

export type UseWordIllustrationResult = {
  status: WordIllustrationStatus
  data: WordIllustrationData | null
  error: WordIllustrationError | null
  refresh: () => void
}

export function useWordIllustration(word: Word | undefined, options: UseWordIllustrationOptions = {}): UseWordIllustrationResult {
  const enabled = options.enabled ?? true
  const normalizedWord = useMemo(() => word?.name.trim().toLowerCase() ?? '', [word?.name])
  const searchQueries = useMemo(() => (word ? buildSearchQueries(word) : []), [word])

  const [status, setStatus] = useState<WordIllustrationStatus>('idle')
  const [data, setData] = useState<WordIllustrationData | null>(null)
  const [error, setError] = useState<WordIllustrationError | null>(null)
  const [bypassCache, setBypassCache] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (!enabled || !normalizedWord) {
      setStatus('idle')
      setData(null)
      setError(null)
      return () => {
        isMounted = false
      }
    }

    if (!searchQueries.length) {
      setStatus('empty')
      setData(null)
      setError(null)
      return () => {
        isMounted = false
      }
    }

    const abortController = new AbortController()
    const shouldBypassCache = bypassCache

    const run = async () => {
      setStatus('loading')
      setData(null)
      setError(null)

      await pruneExpiredMediaAssets()

      if (!shouldBypassCache) {
        const cached = await getCachedMediaAsset(normalizedWord, UNSPLASH_SOURCE)
        if (!isMounted) return
        if (cached) {
          setStatus('success')
          setData(mapRecordToData(cached, true))
          setError(null)
          return
        }
      } else {
        await deleteMediaAsset(normalizedWord, UNSPLASH_SOURCE)
      }

      for (let i = 0; i < Math.min(searchQueries.length, MAX_UNSPLASH_ATTEMPTS); i += 1) {
        const query = searchQueries[i]
        try {
          const image = await searchUnsplashImage(query, { signal: abortController.signal, orientation: 'landscape' })
          if (!isMounted) return
          if (image) {
            const record = await saveMediaAsset({
              word: normalizedWord,
              query: image.query,
              source: UNSPLASH_SOURCE,
              imageUrl: image.imageUrl,
              thumbUrl: image.thumbUrl,
              color: image.color ?? null,
              altDescription: image.altDescription ?? null,
              photographerName: image.photographerName,
              photographerUsername: image.photographerUsername,
              photographerUrl: image.photographerUrl,
              downloadLocation: image.downloadLocation,
              description: image.description ?? null,
            })
            if (!isMounted) return
            // 触发 Unsplash 下载统计
            try {
              await triggerUnsplashDownload(image.downloadLocation)
            } catch (error) {
              console.warn('[Unsplash] Failed to trigger download', error)
            }
            setStatus('success')
            setData(mapRecordToData(record, false))
            setError(null)
            return
          }
        } catch (requestError) {
          if (!isMounted) return
          if (requestError instanceof DOMException && requestError.name === 'AbortError') {
            return
          }

          if (requestError instanceof UnsplashMissingKeyError) {
            setStatus('error')
            setError({ code: 'missing-key', message: requestError.message })
            setData(null)
            return
          }

          if (requestError instanceof UnsplashRequestError) {
            setStatus('error')
            setError({ code: 'request-failed', message: requestError.message })
            setData(null)
            return
          }

          setStatus('error')
          setError({ code: 'unknown', message: (requestError as Error).message })
          setData(null)
          return
        }
      }

      if (!isMounted) return

      setStatus('empty')
      setData(null)
      setError(null)
    }

    run().finally(() => {
      if (shouldBypassCache && isMounted) {
        setBypassCache(false)
      }
    })

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [bypassCache, enabled, normalizedWord, searchQueries])

  const refresh = useCallback(() => {
    setBypassCache(true)
  }, [])

  return { status, data, error, refresh }
}

function buildSearchQueries(word: Word): string[] {
  const base = word.name.trim().toLowerCase()
  if (!base) return []

  const doc = nlp(base)
  const isVerb = doc.verbs().out('array').length > 0
  const isAdjective = doc.adjectives().out('array').length > 0
  const isNoun = !isVerb && doc.nouns().out('array').length > 0

  const queries = new Set<string>()

  const defaultContexts = ['realistic photo', 'detailed shot']
  defaultContexts.forEach((context) => queries.add(`${base} ${context}`))

  if (isNoun) {
    const plural = toPlural(base)
    queries.add(`photo of ${base}`)
    queries.add(`${base} close up`)
    queries.add(`${plural} in real life`)
  }

  if (isVerb) {
    const gerund = toGerund(base)
    queries.add(`person ${gerund}`)
    queries.add(`people ${gerund}`)
    queries.add(`${gerund} action`)
    queries.add(`${gerund} in real life`)
  }

  if (isAdjective) {
    queries.add(`${base} scene`)
    queries.add(`${base} background`)
    queries.add(`${base} person`)
  }

  const translationContexts = extractTranslationContexts(word.trans ?? [])
  translationContexts.forEach((context) => {
    queries.add(`${base} ${context}`)
    queries.add(context)
  })

  queries.add(`${base} educational illustration`)

  return Array.from(queries).filter(Boolean).slice(0, 8)
}

function toGerund(word: string): string {
  const conjugations = nlp(word).verbs().conjugate()
  if (conjugations?.[0]?.Gerund) {
    return conjugations[0].Gerund as string
  }

  if (word.endsWith('ie')) {
    return `${word.slice(0, -2)}ying`
  }
  if (word.endsWith('e') && word.length > 2) {
    return `${word.slice(0, -1)}ing`
  }
  if (word.endsWith('c')) {
    return `${word}king`
  }
  return `${word}ing`
}

function toPlural(word: string): string {
  const plural = nlp(word).nouns().toPlural().out('text')
  if (plural && plural.trim().length > 0) {
    return plural
  }
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) {
    return `${word.slice(0, -1)}ies`
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('sh') || word.endsWith('ch')) {
    return `${word}es`
  }
  return `${word}s`
}

function extractTranslationContexts(translations: string[]): string[] {
  if (!translations.length) return []
  const text = translations.join('')

  const rules: Array<{ pattern: RegExp; contexts: string[] }> = [
    { pattern: /取消|撤销|作废/, contexts: ['cancellation notice', 'person cancelling meeting'] },
    { pattern: /爆炸|炸药|燃烧/, contexts: ['controlled explosion', 'fireworks explosion'] },
    { pattern: /政府|统治|治理|政治/, contexts: ['government meeting', 'parliament session'] },
    { pattern: /分析|解析|分解/, contexts: ['data analysis', 'scientist analysing data'] },
    { pattern: /众多|群众|很多人|人群/, contexts: ['crowd of people', 'busy city crowd'] },
    { pattern: /污染|雾霾|污水/, contexts: ['city pollution', 'industrial pollution'] },
    { pattern: /工资|薪|报酬/, contexts: ['office payroll', 'business finance office'] },
    { pattern: /遥远|偏僻|孤立/, contexts: ['remote landscape', 'isolated cabin'] },
    { pattern: /劝阻|阻止|制止/, contexts: ['teacher discouraging student', 'stop sign action'] },
    { pattern: /类似|相似|相像/, contexts: ['look alike people', 'matching objects'] },
    { pattern: /工具|机器|设备/, contexts: ['industrial equipment', 'workshop tools'] },
  ]

  const matchedContexts = new Set<string>()
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      rule.contexts.forEach((context) => matchedContexts.add(context))
    }
  }

  return Array.from(matchedContexts)
}

function mapRecordToData(record: IMediaAssetRecord, cached: boolean): WordIllustrationData {
  return {
    source: record.source,
    url: record.imageUrl,
    thumbUrl: record.thumbUrl,
    color: record.color,
    alt: record.altDescription,
    description: record.description,
    photographer: {
      name: record.photographerName,
      username: record.photographerUsername,
      url: record.photographerUrl,
    },
    downloadLocation: record.downloadLocation,
    query: record.query,
    cached,
  }
}
