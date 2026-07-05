'use client'

import { Container } from '@/app/shared/components/container'
import { useHomeScreenHook } from './home.hook'

export function Home() {
  const { handleFileChange, handleFormSubmit, handleTrackClear, inputRef, selectedFile } =
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
    </Container>
  )
}
