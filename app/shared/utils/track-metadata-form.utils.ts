import { TrackMetadata } from '@/app/shared/interface'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

export const parseTrackMetadataFromFormData = (
  value: FormDataEntryValue | null
): Partial<TrackMetadata> | null => {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(value)

    if (!isObject(parsed)) {
      return null
    }

    return {
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      artist: typeof parsed.artist === 'string' ? parsed.artist : undefined,
      album: typeof parsed.album === 'string' ? parsed.album : undefined,
      albumArtist: typeof parsed.albumArtist === 'string' ? parsed.albumArtist : undefined,
      genre: typeof parsed.genre === 'string' ? parsed.genre : undefined,
      year: toNumber(parsed.year),
      trackNumber: toNumber(parsed.trackNumber),
      totalTracks: toNumber(parsed.totalTracks),
      discNumber: toNumber(parsed.discNumber),
      totalDiscs: toNumber(parsed.totalDiscs),
      comment: typeof parsed.comment === 'string' ? parsed.comment : undefined,
      composer: typeof parsed.composer === 'string' ? parsed.composer : undefined,
      copyright: typeof parsed.copyright === 'string' ? parsed.copyright : undefined,
      bpm: toNumber(parsed.bpm),
      language: typeof parsed.language === 'string' ? parsed.language : undefined,
    }
  } catch {
    return null
  }
}
