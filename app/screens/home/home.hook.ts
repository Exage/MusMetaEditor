import { useRef, useState } from 'react'
import { readTrackMetadata } from '@/app/shared/api/requests'
import type { TrackMetadataFormValues } from '@/app/shared/interface'

export function useHomeScreenHook() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<TrackMetadataFormValues | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.currentTarget.files?.[0] ?? null

    setSelectedFile(nextFile)
  }

  const handleFormSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const metadata = await readTrackMetadata(formData)

    setResult(metadata)
  }

  const handleTrackClear = () => {
    setSelectedFile(null)
    setResult(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return {
    handleFileChange,
    handleFormSubmit,
    handleTrackClear,
    inputRef,
    result,
    selectedFile,
  }
}
