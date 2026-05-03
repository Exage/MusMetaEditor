import { NextRequest, NextResponse } from 'next/server'
import {
  getSupportedAudioExtensions,
  isSupportedAudioFile,
  parseTrackMetadataFromFormData,
  writeAudioMetadata,
} from '@/app/shared/utils'
import {
  MAX_AUDIO_FILE_SIZE,
  MAX_COVER_FILE_SIZE,
  SUPPORTED_COVER_MIME_TYPES,
} from '@/app/shared/constants'

const isSupportedCoverMimeType = (mimeType: string): boolean =>
  (SUPPORTED_COVER_MIME_TYPES as readonly string[]).includes(mimeType)

export async function POST(request: NextRequest): Promise<NextResponse> {
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
        error: 'Audio file is too large',
      },
      { status: 400 }
    )
  }

  const metadata = parseTrackMetadataFromFormData(formData.get('metadata'))

  if (!metadata) {
    return NextResponse.json(
      {
        success: false,
        error: 'Metadata is required and must be valid JSON',
      },
      { status: 400 }
    )
  }

  const coverCandidate = formData.get('cover')
  const coverDescription = formData.get('coverDescription')
  const removeCoverValue = formData.get('removeCover')
  const shouldRemoveCover =
    typeof removeCoverValue === 'string' &&
    ['1', 'true', 'yes', 'on'].includes(removeCoverValue.trim().toLowerCase())
  const cover =
    coverCandidate instanceof File && coverCandidate.size > 0
      ? {
          file: coverCandidate,
          description: typeof coverDescription === 'string' ? coverDescription : undefined,
        }
      : undefined

  if (cover && cover.file.size > MAX_COVER_FILE_SIZE) {
    return NextResponse.json(
      {
        success: false,
        error: 'Cover image is too large',
      },
      { status: 400 }
    )
  }

  if (cover && !isSupportedCoverMimeType(cover.file.type)) {
    return NextResponse.json(
      {
        success: false,
        error: `Unsupported cover format. Supported formats: ${SUPPORTED_COVER_MIME_TYPES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  try {
    const outputBuffer = await writeAudioMetadata(audioFile, metadata, cover, {
      removeCover: shouldRemoveCover && !cover,
    })
    const downloadName = audioFile.name
    const body = new Uint8Array(outputBuffer)
    const contentType = audioFile.type || 'application/octet-stream'

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to write audio metadata',
      },
      { status: 400 }
    )
  }
}
