import 'server-only'

import type { IWriteTrackMetadataItem, TTrackCoverMode } from '@/app/shared/api/types'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseTrackMetadataItems = (
  value: FormDataEntryValue | null
): IWriteTrackMetadataItem[] | null => {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      return null
    }

    for (const [index, item] of parsed.entries()) {
      if (!isObject(item)) {
        throw new Error(`Item at index ${index} is not an object`)
      }

      if (typeof item.index !== 'number') {
        throw new Error(`Item at index ${index} is missing a numeric index`)
      }

      if (!isObject(item.metadata)) {
        throw new Error(`Item at index ${index} is missing metadata`)
      }
    }

    return parsed as IWriteTrackMetadataItem[]
  } catch {
    return null
  }
}

export const parseCoverMode = (value: FormDataEntryValue | null): TTrackCoverMode => {
  if (typeof value !== 'string') {
    return 'keep-per-track'
  }

  if (value === 'replace-all' || value === 'remove-all') {
    return value
  }

  return 'keep-per-track'
}
