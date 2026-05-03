import { parseBlob } from 'music-metadata'
import { TrackCover } from '@/app/shared/interface'

const normalizeMimeType = (format?: string): TrackCover['mimeType'] | undefined => {
  switch (format?.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'image/jpeg'
    case 'image/png':
      return 'image/png'
    case 'image/webp':
      return 'image/webp'
    default:
      return undefined
  }
}

export const readAudioCover = async (file: File): Promise<TrackCover | undefined> => {
  const parsed = await parseBlob(file)
  const picture = parsed.common.picture?.[0]

  if (!picture) {
    return undefined
  }

  const base64 = Buffer.from(picture.data).toString('base64')
  const mimeType = normalizeMimeType(picture.format)
  const formatForDataUrl = picture.format || mimeType || 'image/jpeg'

  return {
    previewUrl: `data:${formatForDataUrl};base64,${base64}`,
    mimeType,
    description: picture.description,
  }
}
