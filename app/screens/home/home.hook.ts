import { useEffect, useRef, useState } from 'react'
import { readTrackMetadata, writeTrackMetadata } from '@/app/shared/api/requests'
import type { TrackMetadataFormValues } from '@/app/shared/interface'
import { areTrackFormValuesEqual } from './lib/track-form-values'

export function useHomeScreenHook() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<TrackMetadataFormValues | null>(null)
  const [draft, setDraft] = useState<TrackMetadataFormValues | null>(null)
  const [hasChanges, setHasChanges] = useState<boolean>(false)
  const [isReading, setIsReading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.currentTarget.files?.[0] ?? null

    setSelectedFile(nextFile)
    setResult(null)
    setDraft(null)
    setHasChanges(false)
    setError(null)
  }

  const handleTrackRead = async () => {
    if (!selectedFile) {
      return
    }

    setIsReading(true)
    setError(null)
    setResult(null)
    setDraft(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const metadata = await readTrackMetadata(formData)

      setResult(metadata)
      setDraft(metadata)
      setHasChanges(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read metadata'

      setError(message)
    } finally {
      setIsReading(false)
    }
  }

  const handleTrackClear = () => {
    setSelectedFile(null)
    setResult(null)
    setDraft(null)
    setHasChanges(false)
    setError(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDraftMetadataChange = <Field extends keyof TrackMetadataFormValues['metadata']>(
    field: Field,
    value: TrackMetadataFormValues['metadata'][Field]
  ) => {
    if (!draft) {
      return
    }

    const nextDraft = {
      ...draft,
      metadata: {
        ...draft.metadata,
        [field]: value,
      },
    }

    setDraft(nextDraft)
    setHasChanges(!areTrackFormValuesEqual(result, nextDraft))
  }

  useEffect(() => {
    return () => {
      if (draft?.cover?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(draft.cover.previewUrl)
      }
    }
  }, [draft?.cover?.previewUrl])

  const handleDraftCoverAdd = (file: File) => {
    if (!draft) {
      return
    }

    if (draft.cover?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(draft.cover.previewUrl)
    }

    const previewUrl = URL.createObjectURL(file)

    const nextDraft = {
      ...draft,
      cover: {
        file,
        previewUrl,
        mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      },
    }

    setDraft(nextDraft)
    setHasChanges(!areTrackFormValuesEqual(result, nextDraft))
  }

  const handleDraftCoverRemove = () => {
    if (!draft) {
      return
    }

    if (draft.cover?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(draft.cover.previewUrl)
    }

    const nextDraft = { ...draft, cover: undefined }

    setDraft(nextDraft)
    setHasChanges(!areTrackFormValuesEqual(result, nextDraft))
  }

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]

    if (file) {
      handleDraftCoverAdd(file)
    }

    event.currentTarget.value = ''
  }

  const handleTrackSave = async () => {
    if (!selectedFile || !draft) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const formData = new FormData()

      formData.append('file', selectedFile)
      formData.append('metadata', JSON.stringify(draft.metadata))

      if (draft.cover?.file) {
        formData.append('cover', draft.cover.file)

        if (draft.cover.description) {
          formData.append('coverDescription', draft.cover.description)
        }
      } else if (result?.cover && !draft.cover) {
        formData.append('removeCover', 'true')
      }

      const downloadedFile = await writeTrackMetadata(formData)

      const url = URL.createObjectURL(downloadedFile.blob)
      const link = document.createElement('a')

      link.href = url
      link.download = downloadedFile.fileName || selectedFile.name
      link.click()

      URL.revokeObjectURL(url)

      const nextFile = new File(
        [downloadedFile.blob],
        downloadedFile.fileName || selectedFile.name,
        {
          type: downloadedFile.contentType || selectedFile.type,
        }
      )

      setSelectedFile(nextFile)
      setResult(draft)
      setHasChanges(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save metadata'

      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDraftCancel = () => {
    setDraft(result)
    setHasChanges(false)
  }

  return {
    coverInputRef,
    draft,
    error,
    handleCoverFileChange,
    handleDraftCancel,
    handleDraftCoverAdd,
    handleDraftCoverRemove,
    handleDraftMetadataChange,
    handleFileChange,
    handleTrackClear,
    handleTrackRead,
    handleTrackSave,
    hasChanges,
    inputRef,
    isReading,
    isSaving,
    result,
    selectedFile,
  }
}
