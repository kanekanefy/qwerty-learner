import { useWordIllustration } from '@/hooks/useWordIllustration'
import type { Word } from '@/typings'
import { cn } from '@/utils/ui'
import { useMemo } from 'react'

const PLACEHOLDER_COLORS = ['#f3f4f6', '#e0f2fe', '#fce7f3', '#ede9fe', '#fef3c7']

function getPlaceholderColor(word: string) {
  if (!word) return PLACEHOLDER_COLORS[0]
  const code = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PLACEHOLDER_COLORS[code % PLACEHOLDER_COLORS.length]
}

type WordIllustrationProps = {
  word: Word
  className?: string
}

export function WordIllustration({ word, className }: WordIllustrationProps) {
  const hasBuiltInImage = Boolean(word.imageUrl)
  const { status, data, error, refresh } = useWordIllustration(word, { enabled: !hasBuiltInImage })

  const attribution = useMemo(() => {
    if (!data) return null
    const username = data.photographer.username ?? ''
    const photoAuthorUrl = `${data.photographer.url}?utm_source=qwerty-learner&utm_medium=referral`
    const unsplashUrl = 'https://unsplash.com/?utm_source=qwerty-learner&utm_medium=referral'
    return { username, photoAuthorUrl, unsplashUrl }
  }, [data])

  const shouldShowRefresh = !hasBuiltInImage && (status === 'success' || status === 'empty' || status === 'error')
  const placeholderColor = useMemo(() => getPlaceholderColor(word.name), [word.name])

  return (
    <figure className={cn('flex w-full flex-col items-center gap-2', className)}>
      <div className="relative w-full max-w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <div className="aspect-[4/3] w-full">
          {hasBuiltInImage && word.imageUrl ? (
            <img src={word.imageUrl} alt={word.name} className="h-full w-full object-cover" loading="lazy" />
          ) : status === 'loading' ? (
            <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-700" />
          ) : status === 'success' && data ? (
            <img
              src={data.url}
              srcSet={`${data.thumbUrl} 480w, ${data.url} 960w`}
              sizes="(max-width: 768px) 50vw, 220px"
              alt={data.alt ?? word.name}
              className="h-full w-full object-cover"
              style={data.color ? { backgroundColor: data.color } : undefined}
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-center"
              style={{ backgroundColor: placeholderColor }}
            >
              <span className="text-3xl font-semibold uppercase text-slate-400">{word.name[0]}</span>
              <span className="px-3 text-xs text-slate-500">暂无合适的图片</span>
            </div>
          )}
        </div>
      </div>

      {data && attribution && !error && (
        <figcaption className="text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400">
          图片来自{' '}
          <a
            href={attribution.photoAuthorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-200"
          >
            {data.photographer.name}
          </a>{' '}
          于{' '}
          <a
            href={attribution.unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-200"
          >
            Unsplash
          </a>
          {data.cached ? '（缓存）' : ''}
        </figcaption>
      )}

      {error && error.code === 'missing-key' && <p className="text-center text-xs text-rose-500">未检测到 Unsplash Access Key</p>}

      {error && error.code !== 'missing-key' && <p className="text-center text-xs text-rose-500">图片加载失败：{error.message}</p>}

      {status === 'empty' && !error && <p className="text-center text-xs text-slate-500 dark:text-slate-400">尚未找到合适的图像</p>}

      {shouldShowRefresh && (
        <button
          type="button"
          onClick={refresh}
          className="mt-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
        >
          换一张
        </button>
      )}
    </figure>
  )
}
