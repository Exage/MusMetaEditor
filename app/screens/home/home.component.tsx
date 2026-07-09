'use client'

import Image from 'next/image'
import { Container } from '@/app/shared/components/container'
import { useHomeScreenHook } from './home.hook'

export function HomeScreen() {
  const { handleFileChange, handleFormSubmit, handleTrackClear, inputRef, result, selectedFile } =
    useHomeScreenHook()

  return (
    <Container>
      <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          accept=".mp3,audio/mpeg"
          name="file"
          type="file"
          onChange={handleFileChange}
        />

        <div className="flex gap-3">
          <button
            className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedFile}
            type="submit"
          >
            Read track data
          </button>

          <button
            className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedFile}
            type="button"
            onClick={handleTrackClear}
          >
            Clear track
          </button>
        </div>
      </form>

      {result?.cover?.previewUrl && (
        <div className="mt-6">
          <Image
            alt={result.cover.description ?? 'Track cover'}
            className="rounded-lg"
            height={256}
            src={result.cover.previewUrl}
            unoptimized
            width={256}
          />
        </div>
      )}
    </Container>
  )
}
