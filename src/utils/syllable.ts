import nlp from 'compromise'
import speech from 'compromise-speech'

let pluginApplied = false

function ensurePlugin() {
  if (!pluginApplied) {
    const plugin = (speech as { default?: Parameters<typeof nlp.plugin>[0] }).default ?? speech
    nlp.plugin(plugin as Parameters<typeof nlp.plugin>[0])
    pluginApplied = true
  }
}

const cache = new Map<string, string[]>()

const overrides: Record<string, string[]> = {}

const NON_ALPHABETIC = /[^a-zA-Z']/g

export function normalizeHeadword(raw: string): string {
  return raw?.trim().toLowerCase?.().replace(NON_ALPHABETIC, '') ?? ''
}

function splitFallback(word: string): string[] {
  if (!word) return []
  const matches = word.match(/[aeiouy]+[^aeiouy]*/gi)
  if (matches && matches.length > 0) {
    const combined = matches.join('')
    if (combined.length === word.length) {
      return matches
    }
  }
  return [word]
}

export function getSyllables(word: string): string[] {
  const normalized = normalizeHeadword(word)
  if (!normalized) {
    return []
  }
  if (cache.has(normalized)) {
    return cache.get(normalized) ?? []
  }

  ensurePlugin()
  if (overrides[normalized]) {
    cache.set(normalized, overrides[normalized])
    return overrides[normalized]
  }
  const doc = nlp(normalized)
  doc.compute('syllables')
  const terms = doc.docs?.[0]?.[0]
  const syllables = Array.isArray(terms?.syllables) ? terms.syllables : undefined

  const result = syllables && syllables.length > 0 ? syllables : splitFallback(normalized)
  cache.set(normalized, result)
  return result
}

export function clearSyllableCache() {
  cache.clear()
}
