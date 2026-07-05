import { useRef, useState } from 'react'
import { readTrackMetadata } from '@/app/shared/lib/api'

export function useHomeScreenHook() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

    console.log(metadata)
  }

  const handleTrackClear = () => {
    setSelectedFile(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return {
    handleFileChange,
    handleFormSubmit,
    handleTrackClear,
    inputRef,
    selectedFile,
  }
}
