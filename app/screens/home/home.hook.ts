import { useEffect, useMemo, useRef, useState } from 'react'
import {
  readTracksMetadata,
  writeTracksMetadata,
} from '@/app/shared/api/requests/tracks-metadata.requests'
import type { TrackMetadataFormValues } from '@/app/shared/interface'
import type { TTrackCoverMode } from '@/app/shared/api/types'
import { MAX_AUDIO_FILE_SIZE, MAX_AUDIO_FILES, MAX_AUDIO_TOTAL_SIZE } from '@/app/shared/constants'

const ACCEPTED_AUDIO_MIME_TYPES = new Set(['audio/mpeg', 'audio/mp3'])

export type TrackItem = {
  id: string
  file: File
  fileName: string
  fileSize: number
  metadata: TrackMetadataFormValues['metadata'] | null
  initialMetadata: TrackMetadataFormValues['metadata'] | null
  cover: TrackMetadataFormValues['cover'] | null
  error: string | null
  errorSource: 'read' | 'write' | null
  isMetadataOpen: boolean
  status: 'selected' | 'reading' | 'read' | 'error'
}

let trackIdCounter = 0

const createTrackFromFile = (file: File, status: TrackItem['status'] = 'selected'): TrackItem => {
  trackIdCounter += 1

  return {
    id: `track_${Date.now()}_${trackIdCounter}`,
    file,
    fileName: file.name,
    fileSize: file.size,
    metadata: null,
    initialMetadata: null,
    cover: null,
    error: null,
    errorSource: null,
    isMetadataOpen: false,
    status,
  }
}

const getTrackFileValidationError = (
  file: File,
  nextTotalSizeAfterAdd: number,
  candidateIndex: number
) => {
  if (!ACCEPTED_AUDIO_MIME_TYPES.has(file.type) && !file.name.toLowerCase().endsWith('.mp3')) {
    return `"${file.name}" is not a supported audio format`
  }

  if (file.size > MAX_AUDIO_FILE_SIZE) {
    return `"${file.name}" is too large`
  }

  if (nextTotalSizeAfterAdd > MAX_AUDIO_TOTAL_SIZE) {
    return `"${file.name}" would exceed the batch size limit`
  }

  if (candidateIndex + 1 > MAX_AUDIO_FILES) {
    return 'Track limit exceeded'
  }

  return null
}

export type TAlbumMetadataMode = 'per-track' | 'all-tracks'

export function useHomeScreenHook() {
  const [tracks, setTracks] = useState<TrackItem[]>([])
  const [coverMode, setCoverMode] = useState<TTrackCoverMode>('keep-per-track')
  const [batchCover, setBatchCover] = useState<TrackMetadataFormValues['cover'] | null>(null)
  const [albumMetadataMode, setAlbumMetadataMode] = useState<TAlbumMetadataMode>('per-track')
  const [batchAlbumTitle, setBatchAlbumTitle] = useState('')
  const [batchAlbumArtist, setBatchAlbumArtist] = useState('')
  const [batchYear, setBatchYear] = useState('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [batchError, setBatchError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const batchCoverInputRef = useRef<HTMLInputElement>(null)

  const readTracks = useMemo(() => tracks.filter((track) => track.status === 'read'), [tracks])
  const canSave =
    readTracks.length > 0 && (coverMode !== 'replace-all' || Boolean(batchCover?.file))

  const readTracksBatch = async (tracksToRead: TrackItem[]) => {
    if (tracksToRead.length === 0) {
      return
    }

    try {
      const formData = new FormData()
      const trackIdsByRequestIndex = tracksToRead.map((track) => track.id)

      for (const track of tracksToRead) {
        formData.append('files', track.file)
      }

      const response = await readTracksMetadata(formData)

      setTracks((prev) =>
        prev.map((track) => {
          const requestIndex = trackIdsByRequestIndex.indexOf(track.id)

          if (requestIndex === -1) {
            return track
          }

          const successItem = response.tracks.find((item) => item.index === requestIndex)
          const errorItem = response.errors.find((item) => item.index === requestIndex)

          if (successItem) {
            return {
              ...track,
              metadata: successItem.metadata,
              initialMetadata: successItem.metadata,
              cover: successItem.cover,
              error: null,
              errorSource: null,
              status: 'read' as const,
            }
          }

          if (errorItem) {
            return {
              ...track,
              error: errorItem.error,
              errorSource: 'read' as const,
              status: 'error' as const,
            }
          }

          return track
        })
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read metadata'

      setBatchError(message)

      setTracks((prev) =>
        prev.map((track) =>
          tracksToRead.some((toRead) => toRead.id === track.id)
            ? {
                ...track,
                error: message,
                errorSource: 'read' as const,
                status: 'error' as const,
              }
            : track
        )
      )
    }
  }

  const handleAddTracks = (files: File[]) => {
    const currentTotalSize = tracks.reduce((size, track) => size + track.file.size, 0)
    let pendingTotalSize = currentTotalSize
    let candidateIndex = tracks.length
    const errors: string[] = []
    const acceptedTracks: TrackItem[] = []

    for (const file of files) {
      const nextTotalSizeAfterAdd = pendingTotalSize + file.size
      const validationError = getTrackFileValidationError(
        file,
        nextTotalSizeAfterAdd,
        candidateIndex
      )

      if (validationError) {
        errors.push(validationError)

        continue
      }

      acceptedTracks.push(createTrackFromFile(file, 'reading'))
      pendingTotalSize = nextTotalSizeAfterAdd
      candidateIndex += 1
    }

    if (errors.length > 0) {
      const uniqueErrors = Array.from(new Set(errors))

      setBatchError(uniqueErrors.join('; '))
    } else {
      setBatchError(null)
    }

    if (acceptedTracks.length > 0) {
      if (tracks.length + acceptedTracks.length === 1) {
        setCoverMode('replace-all')
      }

      setTracks((prev) => [...prev, ...acceptedTracks])
      void readTracksBatch(acceptedTracks)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.currentTarget.files ?? [])

    handleAddTracks(incomingFiles)
    event.currentTarget.value = ''
  }

  const handleTrackClear = (trackId: string) => {
    if (tracks.filter((track) => track.id !== trackId).length === 1) {
      setCoverMode('replace-all')
    }

    setTracks((prev) => prev.filter((track) => track.id !== trackId))
  }

  const handleTracksSave = async () => {
    if (!canSave || isSaving) {
      return
    }

    setIsSaving(true)
    setBatchError(null)

    try {
      const formData = new FormData()
      const readTrackIds = readTracks.map((track) => track.id)

      for (const track of readTracks) {
        formData.append('files', track.file)
      }

      const assembleMetadata = (
        metadata: TrackMetadataFormValues['metadata']
      ): TrackMetadataFormValues['metadata'] => {
        if (readTracks.length === 1) {
          return {
            ...metadata,
            album: metadata.title,
            albumArtist: metadata.artist,
          }
        }

        if (albumMetadataMode !== 'all-tracks') {
          return metadata
        }

        const parsedBatchYear = batchYear.trim() !== '' ? Number(batchYear) : undefined
        const batchYearValue =
          parsedBatchYear !== undefined && Number.isFinite(parsedBatchYear)
            ? parsedBatchYear
            : undefined

        return {
          ...metadata,
          album: batchAlbumTitle,
          albumArtist: batchAlbumArtist,
          ...(batchYearValue !== undefined ? { year: batchYearValue } : {}),
        }
      }

      formData.append(
        'tracks',
        JSON.stringify(
          readTracks.map((track, index) => ({
            index,
            metadata: assembleMetadata(track.metadata),
          }))
        )
      )

      formData.append('coverMode', coverMode)

      if (albumMetadataMode === 'all-tracks' && batchAlbumTitle.trim()) {
        formData.append('archiveName', batchAlbumTitle.trim())
      } else {
        const firstAlbum = readTracks.find((track) => track.metadata?.album)?.metadata?.album

        if (firstAlbum?.trim()) {
          formData.append('archiveName', firstAlbum.trim())
        }
      }

      if (coverMode === 'replace-all' && batchCover?.file) {
        formData.append('cover', batchCover.file)

        if (batchCover.description) {
          formData.append('coverDescription', batchCover.description)
        }
      }

      const downloadedFile = await writeTracksMetadata(formData)

      const url = URL.createObjectURL(downloadedFile.blob)
      const link = document.createElement('a')

      link.href = url
      link.download = downloadedFile.fileName ?? 'album.zip'
      link.click()

      URL.revokeObjectURL(url)

      setTracks((prev) =>
        prev.map((track) => {
          if (!readTrackIds.includes(track.id)) {
            return track
          }

          const savedMetadata = assembleMetadata(track.metadata)

          return {
            ...track,
            metadata: albumMetadataMode === 'all-tracks' ? savedMetadata : track.metadata,
            initialMetadata: savedMetadata,
            cover:
              coverMode === 'replace-all'
                ? batchCover
                : coverMode === 'remove-all'
                  ? null
                  : track.cover,
            error: null,
            errorSource: null,
          }
        })
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save metadata'

      setBatchError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTrackEditToggle = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              isMetadataOpen: !track.isMetadataOpen,
            }
          : track
      )
    )
  }

  const handleTrackMetadataChange = (
    trackId: string,
    field: keyof TrackMetadataFormValues['metadata'],
    value: TrackMetadataFormValues['metadata'][keyof TrackMetadataFormValues['metadata']]
  ) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId || !track.metadata) {
          return track
        }

        return {
          ...track,
          metadata: {
            ...track.metadata,
            [field]: value,
          },
        }
      })
    )
  }

  const handleTrackMetadataCancel = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId || !track.initialMetadata) {
          return track
        }

        return {
          ...track,
          metadata: track.initialMetadata,
        }
      })
    )
  }

  const handleTrackReorder = (trackId: string, nextPosition: number) => {
    setTracks((prev) => {
      const currentIndex = prev.findIndex((track) => track.id === trackId)

      if (currentIndex === -1) {
        return prev
      }

      const clampedPosition = Math.max(1, Math.min(prev.length, nextPosition))
      const nextIndex = clampedPosition - 1

      if (nextIndex === currentIndex) {
        return prev
      }

      const nextTracks = [...prev]
      const [movedTrack] = nextTracks.splice(currentIndex, 1)

      nextTracks.splice(nextIndex, 0, movedTrack)

      return nextTracks
    })
  }

  const handleCoverModeChange = (nextMode: TTrackCoverMode) => {
    setCoverMode(nextMode)
  }

  const handleBatchCoverAdd = (file: File) => {
    if (batchCover?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(batchCover.previewUrl)
    }

    const previewUrl = URL.createObjectURL(file)

    setBatchCover({
      file,
      previewUrl,
      mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
    })
  }

  const handleBatchCoverRemove = () => {
    if (batchCover?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(batchCover.previewUrl)
    }

    setBatchCover(null)
  }

  const handleBatchCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]

    if (file) {
      handleBatchCoverAdd(file)
    }

    event.currentTarget.value = ''
  }

  useEffect(() => {
    return () => {
      if (batchCover?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(batchCover.previewUrl)
      }
    }
  }, [batchCover?.previewUrl])

  return {
    albumMetadataMode,
    batchAlbumArtist,
    batchAlbumTitle,
    batchCover,
    batchCoverInputRef,
    batchError,
    batchYear,
    canSave,
    coverMode,
    inputRef,
    isSaving,
    tracks,
    handleBatchCoverFileChange,
    handleBatchCoverRemove,
    handleCoverModeChange,
    handleFileChange,
    handleTrackClear,
    handleTrackEditToggle,
    handleTrackMetadataCancel,
    handleTrackMetadataChange,
    handleTrackReorder,
    handleTracksSave,
    setAlbumMetadataMode,
    setBatchAlbumArtist,
    setBatchAlbumTitle,
    setBatchYear,
  }
}
