'use client'

import Image from 'next/image'
import { Button } from '@/app/shared/components/button'
import { Container } from '@/app/shared/components/container'
import { TrackMetadataForm } from './components/track-metadata-form'
import { useHomeScreenHook } from './home.hook'

export function HomeScreen() {
  const {
    coverInputRef,
    draft,
    error,
    handleDraftCancel,
    handleCoverFileChange,
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
  } = useHomeScreenHook()

  return (
    <Container>
      <div className="py-10">
        <div className="flex flex-col gap-4">
          {!selectedFile && (
            <div className="flex justify-center py-10 rounded-3xl bg-fuchsia-500/5">
              <label
                htmlFor="music_uploader"
                className="inline-block uppercase px-10 py-2 bg-fuchsia-300/5 rounded-full text-fuchsia-400 text-2xl hover:bg-fuchsia-300/15 cursor-pointer transition-colors"
              >
                upload your track
              </label>
            </div>
          )}

          {selectedFile && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h3>🎵 {selectedFile.name}</h3>
                  <p>{selectedFile.size} bytes</p>
                </div>
                <Button variant="danger" disabled={isReading} onClick={handleTrackClear}>
                  Clear track
                </Button>
              </div>
              {error && <p className="text-rose-400 text-sm">{error}</p>}
            </>
          )}
          {selectedFile && !result && (
            <Button variant="primary" disabled={isReading} onClick={handleTrackRead}>
              {isReading ? 'Reading...' : 'Read Data'}
            </Button>
          )}
          {selectedFile && result && draft && (
            <>
              <div className="flex flex-col gap-3 shrink-0">
                <div className="size-[140px] shrink-0 overflow-hidden border border-gray-500 rounded-2xl flex items-center justify-center">
                  {draft.cover?.previewUrl ? (
                    <Image
                      loader={({ src }) => src}
                      unoptimized
                      src={draft.cover.previewUrl}
                      alt="Track cover"
                      width={140}
                      height={140}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400 px-4 text-center">No cover</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="accent" onClick={() => coverInputRef.current?.click()}>
                    Add
                  </Button>
                  <Button variant="danger" disabled={!draft.cover} onClick={handleDraftCoverRemove}>
                    Remove
                  </Button>
                </div>
              </div>
              <TrackMetadataForm draft={draft} onMetadataChange={handleDraftMetadataChange} />
              <div className="flex gap-4 justify-end">
                <Button
                  variant="primary"
                  disabled={!hasChanges || isSaving}
                  onClick={handleTrackSave}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="danger" disabled={!hasChanges} onClick={handleDraftCancel}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <input
        id="music_uploader"
        ref={inputRef}
        accept=".mp3,audio/mpeg"
        name="file"
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={coverInputRef}
        accept="image/jpeg,image/png,image/webp"
        type="file"
        onChange={handleCoverFileChange}
        className="hidden"
      />
    </Container>
  )
}
