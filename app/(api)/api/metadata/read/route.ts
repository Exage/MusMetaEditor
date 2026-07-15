import { NextRequest, NextResponse } from 'next/server'
import type { IApiResponse, IReadTracksMetadataResponseData } from '@/app/shared/api/types'
import { getSupportedAudioExtensions, isSupportedAudioFile } from '@/app/shared/utils'
import { readAudioMetadata } from '@/app/shared/utils/track-metadata.utils'
import { readAudioCover } from '@/app/shared/utils/track-cover.utils'
import { MAX_AUDIO_FILE_SIZE, MAX_AUDIO_FILES } from '@/app/shared/constants'

export async function POST(
  request: NextRequest
): Promise<NextResponse<IApiResponse<IReadTracksMetadataResponseData>>> {
  const formData = await request.formData()
  const entries = formData.getAll('files')

  if (entries.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'At least one file is required',
      },
      { status: 400 }
    )
  }

  if (entries.length > MAX_AUDIO_FILES) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many files. Maximum: ${MAX_AUDIO_FILES}`,
      },
      { status: 400 }
    )
  }

  const tracks: IReadTracksMetadataResponseData['tracks'] = []
  const errors: IReadTracksMetadataResponseData['errors'] = []

  for (const [index, entry] of entries.entries()) {
    if (!(entry instanceof File)) {
      errors.push({ index, error: 'Entry is not a file' })

      continue
    }

    if (!isSupportedAudioFile(entry)) {
      const extensions = getSupportedAudioExtensions()
        .map((extension) => `.${extension}`)
        .join(', ')

      errors.push({
        index,
        fileName: entry.name,
        error: `Unsupported file format. Supported formats: ${extensions}`,
      })

      continue
    }

    if (entry.size > MAX_AUDIO_FILE_SIZE) {
      errors.push({
        index,
        fileName: entry.name,
        error: 'Audio file is too large',
      })

      continue
    }

    try {
      const metadata = await readAudioMetadata(entry)
      const cover = await readAudioCover(entry)

      tracks.push({
        index,
        fileName: entry.name,
        fileSize: entry.size,
        metadata,
        cover,
      })
    } catch (error) {
      console.error(error)

      errors.push({
        index,
        fileName: entry.name,
        error: 'Failed to read audio metadata',
      })
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        tracks,
        errors,
      },
    },
    { status: 200 }
  )
}
