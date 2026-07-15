import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import type { IWriteTrackMetadataItem } from '@/app/shared/api/types'
import { getSupportedAudioExtensions, isSupportedAudioFile } from '@/app/shared/utils'
import { writeAudioMetadata } from '@/app/shared/utils/track-metadata-write.utils'
import {
  parseTrackMetadataItems,
  parseCoverMode,
} from '@/app/shared/utils/track-metadata-batch-form.utils'
import {
  MAX_AUDIO_FILE_SIZE,
  MAX_COVER_FILE_SIZE,
  MAX_AUDIO_FILES,
  MAX_AUDIO_TOTAL_SIZE,
  SUPPORTED_COVER_MIME_TYPES,
} from '@/app/shared/constants'

const isSupportedCoverMimeType = (mimeType: string): boolean =>
  (SUPPORTED_COVER_MIME_TYPES as readonly string[]).includes(mimeType)

const toZipArchiveFileName = (name: string): string => {
  const safe = name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()

  return safe.length > 0 ? safe : 'album'
}

const toZipSafeFileName = (names: string[]): string[] => {
  const result: string[] = []
  const seen = new Map<string, number>()

  for (const name of names) {
    const safeName = name.replace(/[\\/:*?"<>|]/g, '_')

    const count = seen.get(safeName)

    if (count === undefined) {
      seen.set(safeName, 0)
      result.push(safeName)
    } else {
      seen.set(safeName, count + 1)
      const dotIndex = safeName.lastIndexOf('.')

      if (dotIndex === -1 || dotIndex === 0) {
        result.push(`${safeName} (${count + 1})`)
      } else {
        const base = safeName.slice(0, dotIndex)
        const ext = safeName.slice(dotIndex)
        result.push(`${base} (${count + 1})${ext}`)
      }
    }
  }

  return result
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  const files: File[] = []
  let totalSize = 0

  for (const entry of entries) {
    if (!(entry instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'All entries must be files',
        },
        { status: 400 }
      )
    }

    if (!isSupportedAudioFile(entry)) {
      const extensions = getSupportedAudioExtensions()
        .map((extension) => `.${extension}`)
        .join(', ')

      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file format for "${entry.name}". Supported formats: ${extensions}`,
        },
        { status: 400 }
      )
    }

    if (entry.size > MAX_AUDIO_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `"${entry.name}" is too large`,
        },
        { status: 400 }
      )
    }

    totalSize += entry.size
    files.push(entry)
  }

  if (totalSize > MAX_AUDIO_TOTAL_SIZE) {
    return NextResponse.json(
      {
        success: false,
        error: 'Total file size exceeds maximum allowed',
      },
      { status: 400 }
    )
  }

  const tracks = parseTrackMetadataItems(formData.get('tracks'))

  if (!tracks) {
    return NextResponse.json(
      {
        success: false,
        error: 'Tracks metadata is required and must be valid JSON array',
      },
      { status: 400 }
    )
  }

  if (tracks.length !== files.length) {
    return NextResponse.json(
      {
        success: false,
        error: `Number of tracks (${tracks.length}) must match number of files (${files.length})`,
      },
      { status: 400 }
    )
  }

  const tracksByIndex = new Map<number, IWriteTrackMetadataItem>()

  for (const track of tracks) {
    tracksByIndex.set(track.index, track)
  }

  const coverMode = parseCoverMode(formData.get('coverMode'))
  const coverCandidate = formData.get('cover')
  const coverDescription = formData.get('coverDescription')
  const rawArchiveName = formData.get('archiveName')
  const archiveName = typeof rawArchiveName === 'string' ? rawArchiveName.trim() : ''

  if (coverMode === 'replace-all') {
    if (!(coverCandidate instanceof File) || coverCandidate.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cover image is required in replace-all mode',
        },
        { status: 400 }
      )
    }

    if (coverCandidate.size > MAX_COVER_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cover image is too large',
        },
        { status: 400 }
      )
    }

    if (!isSupportedCoverMimeType(coverCandidate.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported cover format. Supported formats: ${SUPPORTED_COVER_MIME_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }
  }

  if (coverMode === 'remove-all' && coverCandidate instanceof File && coverCandidate.size > 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Cover file must not be provided in remove-all mode',
      },
      { status: 400 }
    )
  }

  try {
    const outputBuffers: Buffer[] = []

    for (const [index, file] of files.entries()) {
      const item = tracksByIndex.get(index)

      if (!item) {
        throw new Error(`Metadata not found for file at index ${index}`)
      }

      let coverInput:
        | {
            file: File
            description?: string
          }
        | undefined

      if (coverMode === 'replace-all' && coverCandidate instanceof File) {
        coverInput = {
          file: coverCandidate,
          description: typeof coverDescription === 'string' ? coverDescription : undefined,
        }
      }

      const outputBuffer = await writeAudioMetadata(file, item.metadata, coverInput, {
        removeCover: coverMode === 'remove-all' && !coverInput,
      })

      outputBuffers.push(outputBuffer)
    }

    const zip = new JSZip()
    const originalNames = files.map((file) => file.name)
    const safeNames = toZipSafeFileName(originalNames)

    for (const [index, buffer] of outputBuffers.entries()) {
      zip.file(safeNames[index], new Uint8Array(buffer))
    }

    const zipOutput = await zip.generateAsync({ type: 'blob' })
    const zipFileName = `${toZipArchiveFileName(archiveName)}.zip`
    const encodedFileName = encodeURIComponent(zipFileName)

    return new NextResponse(zipOutput, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"; filename*=UTF-8''${encodedFileName}`,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to write audio metadata for one or more tracks',
      },
      { status: 400 }
    )
  }
}
