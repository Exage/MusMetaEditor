import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, TrackMetadataFormValues } from '@/app/shared/interface'
import {
  getSupportedAudioExtensions,
  isSupportedAudioFile,
  readAudioCover,
  readAudioMetadata,
} from '@/app/shared/utils'
import { MAX_AUDIO_FILE_SIZE } from '@/app/shared/constants'

export async function POST(request: NextRequest): Promise<ApiResponse<TrackMetadataFormValues>> {
  const formData = await request.formData()

  const audioFile = formData.get('file')

  if (!(audioFile instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        error: 'File is required',
      },
      { status: 400 }
    )
  }

  if (!isSupportedAudioFile(audioFile)) {
    const extensions = getSupportedAudioExtensions()
      .map((extension) => `.${extension}`)
      .join(', ')

    return NextResponse.json(
      {
        success: false,
        error: `Unsupported file format. Supported formats: ${extensions}`,
      },
      { status: 400 }
    )
  }

  if (audioFile.size > MAX_AUDIO_FILE_SIZE) {
    return NextResponse.json(
      {
        success: false,
        error: `File is too large`,
      },
      { status: 400 }
    )
  }

  try {
    const metadata = await readAudioMetadata(audioFile)
    const cover = await readAudioCover(audioFile)

    return NextResponse.json(
      {
        success: true,
        data: {
          metadata,
          cover,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read audio metadata',
      },
      { status: 400 }
    )
  }
}
