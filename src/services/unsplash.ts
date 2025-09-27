const UNSPLASH_ENDPOINT = 'https://api.unsplash.com/search/photos'

export const UNSPLASH_SOURCE = 'unsplash'

export class UnsplashMissingKeyError extends Error {
  constructor() {
    super('Unsplash access key is not configured.')
    this.name = 'UnsplashMissingKeyError'
  }
}

export class UnsplashRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'UnsplashRequestError'
    this.status = status
  }
}

export type UnsplashImage = {
  id: string
  description: string | null
  altDescription: string | null
  color?: string | null
  imageUrl: string
  thumbUrl: string
  width: number
  height: number
  photographerName: string
  photographerUsername: string | null
  photographerUrl: string
  query: string
}

export type UnsplashSearchOptions = {
  signal?: AbortSignal
  orientation?: 'landscape' | 'portrait' | 'squarish'
  contentFilter?: 'low' | 'high'
}

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

export async function searchUnsplashImage(query: string, options: UnsplashSearchOptions = {}): Promise<UnsplashImage | null> {
  const trimmedQuery = query.trim()
  if (!ACCESS_KEY) {
    throw new UnsplashMissingKeyError()
  }

  if (!trimmedQuery) {
    return null
  }

  const { signal, orientation = 'landscape', contentFilter = 'high' } = options

  const params = new URLSearchParams({
    query: trimmedQuery,
    per_page: '1',
    orientation,
    content_filter: contentFilter,
  })

  const response = await fetch(`${UNSPLASH_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
    signal,
  })

  if (!response.ok) {
    const message = `Unsplash request failed with status ${response.status}`
    throw new UnsplashRequestError(response.status, message)
  }

  const payload = (await response.json()) as {
    results: Array<{
      id: string
      description: string | null
      alt_description: string | null
      color?: string | null
      urls: { raw: string; full: string; regular: string; small: string; thumb: string }
      width: number
      height: number
      user: {
        name: string
        username: string
        links: { html: string }
      }
    }>
  }

  if (!payload.results?.length) {
    return null
  }

  const photo = payload.results[0]

  return {
    id: photo.id,
    description: photo.description,
    altDescription: photo.alt_description,
    color: photo.color,
    imageUrl: photo.urls.regular,
    thumbUrl: photo.urls.small ?? photo.urls.thumb,
    width: photo.width,
    height: photo.height,
    photographerName: photo.user.name,
    photographerUsername: photo.user.username ?? null,
    photographerUrl: photo.user.links.html,
    query: trimmedQuery,
  }
}
