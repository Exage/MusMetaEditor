'use client'

import { Button } from '@/app/shared/components/button'
import { Container } from '@/app/shared/components/container'
import { TrackCard } from './components/track-card'
import { TrackCoverEditor } from './components/track-cover-editor'
import { UploadTrack } from './components/upload-track'
import { useHomeScreenHook } from './home.hook'

export function HomeScreen() {
  const {
    batchCover,
    batchCoverInputRef,
    batchError,
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
  } = useHomeScreenHook()

  return (
    <Container>
      <div className="py-10">
        <div className="flex flex-col gap-6">
          {tracks.length === 0 && (
            <UploadTrack inputId="music_uploader" label="upload your tracks" />
          )}

          {tracks.length > 0 && (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-3xl border border-gray-500 p-4">
                  {tracks.length > 1 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">Cover mode</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="coverMode"
                          checked={coverMode === 'keep-per-track'}
                          onChange={() => handleCoverModeChange('keep-per-track')}
                        />
                        Keep per track
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="coverMode"
                          checked={coverMode === 'replace-all'}
                          onChange={() => handleCoverModeChange('replace-all')}
                        />
                        Replace all
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="coverMode"
                          checked={coverMode === 'remove-all'}
                          onChange={() => handleCoverModeChange('remove-all')}
                        />
                        Remove all
                      </label>
                    </div>
                  )}

                  {coverMode === 'replace-all' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-gray-400">Replace cover for all tracks</p>
                      <TrackCoverEditor
                        cover={batchCover ?? undefined}
                        onAddClick={() => batchCoverInputRef.current?.click()}
                        onRemove={handleBatchCoverRemove}
                      />
                    </div>
                  )}
                </div>

                {batchError && <p className="text-sm text-rose-400">{batchError}</p>}

                <div className="flex flex-col gap-4">
                  {tracks.map((track, index) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      index={index}
                      coverMode={coverMode}
                      trackCount={tracks.length}
                      onClear={handleTrackClear}
                      onEditToggle={handleTrackEditToggle}
                      onMetadataCancel={handleTrackMetadataCancel}
                      onMetadataChange={handleTrackMetadataChange}
                      onReorder={handleTrackReorder}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <UploadTrack
                    inputId="music_uploader"
                    label="add more tracks"
                    className="flex justify-center py-6 rounded-3xl bg-fuchsia-500/5"
                  />

                  <div className="flex gap-4 justify-end">
                    <Button
                      variant="primary"
                      disabled={!canSave || isSaving}
                      onClick={handleTracksSave}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
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
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={batchCoverInputRef}
        accept="image/jpeg,image/png,image/webp"
        type="file"
        onChange={handleBatchCoverFileChange}
        className="hidden"
      />
    </Container>
  )
}
