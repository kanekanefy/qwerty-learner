import { db } from './db'
import type { IMediaAssetRecord, MediaAssetSource } from './db/record'

export const MEDIA_ASSET_TTL_MS = 1000 * 60 * 60 * 24 * 30

export async function pruneExpiredMediaAssets(now = Date.now()) {
  try {
    await db.mediaAssets.where('expiresAt').below(now).delete()
  } catch (error) {
    console.error('[MediaAssets] Failed to prune expired entries', error)
  }
}

export async function getCachedMediaAsset(word: string, source: MediaAssetSource) {
  const normalizedWord = word.trim().toLowerCase()
  if (!normalizedWord) return null

  try {
    const record = await db.mediaAssets.where('[word+source]').equals([normalizedWord, source]).first()
    if (!record) {
      return null
    }

    if (record.expiresAt <= Date.now()) {
      if (record.id) {
        await db.mediaAssets.delete(record.id)
      }
      return null
    }

    return record
  } catch (error) {
    console.error('[MediaAssets] Failed to read cache', error)
    return null
  }
}

export async function saveMediaAsset(
  payload: Omit<IMediaAssetRecord, 'id' | 'fetchedAt' | 'expiresAt'>,
  ttlMs: number = MEDIA_ASSET_TTL_MS,
) {
  const fetchedAt = Date.now()
  const expiresAt = fetchedAt + ttlMs

  const normalizedWord = payload.word.trim().toLowerCase()
  const record: IMediaAssetRecord = {
    ...payload,
    word: normalizedWord,
    fetchedAt,
    expiresAt,
  }

  try {
    const existing = await db.mediaAssets.where('[word+source]').equals([normalizedWord, payload.source]).first()
    const id = existing?.id
    if (id) {
      record.id = id
    }
    await db.mediaAssets.put(record)
    return record
  } catch (error) {
    console.error('[MediaAssets] Failed to save cache entry', error)
    return record
  }
}

export async function deleteMediaAsset(word: string, source: MediaAssetSource) {
  const normalizedWord = word.trim().toLowerCase()
  if (!normalizedWord) return

  try {
    await db.mediaAssets.where('[word+source]').equals([normalizedWord, source]).delete()
  } catch (error) {
    console.error('[MediaAssets] Failed to delete cache entry', error)
  }
}
