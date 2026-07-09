import 'server-only'

import sharp from 'sharp'

const MAX_EMBEDDED_COVER_DIMENSION = 500
const EMBEDDED_COVER_QUALITY = 82

export type NormalizedEmbeddedCover = {
  mime: 'image/jpeg'
  description: ''
  imageBuffer: Buffer
}

export const normalizeCoverForMp3Embedding = async (
  imageBuffer: Buffer
): Promise<NormalizedEmbeddedCover> => {
  try {
    const normalizedBuffer = await sharp(imageBuffer)
      .rotate()
      .resize({
        width: MAX_EMBEDDED_COVER_DIMENSION,
        height: MAX_EMBEDDED_COVER_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({
        background: {
          r: 255,
          g: 255,
          b: 255,
        },
      })
      .toColorspace('srgb')
      .jpeg({
        quality: EMBEDDED_COVER_QUALITY,
        progressive: false,
      })
      .toBuffer()

    return {
      mime: 'image/jpeg',
      description: '',
      imageBuffer: normalizedBuffer,
    }
  } catch {
    throw new Error('Failed to normalize cover image')
  }
}
