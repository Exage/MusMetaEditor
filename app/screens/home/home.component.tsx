'use client'

import { Button } from '@/app/shared/components/button'
import { Container } from '@/app/shared/components/container'
import { TrackCard } from './components/track-card'
import { TrackCoverEditor } from './components/track-cover-editor'
import { UploadTrack } from './components/upload-track'
import { useHomeScreenHook } from './home.hook'

export function HomeScreen() {
  const {
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

                  {tracks.length > 1 && (
                    <>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Album metadata</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="albumMetadataMode"
                            checked={albumMetadataMode === 'per-track'}
                            onChange={() => setAlbumMetadataMode('per-track')}
                          />
                          Per track
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="albumMetadataMode"
                            checked={albumMetadataMode === 'all-tracks'}
                            onChange={() => setAlbumMetadataMode('all-tracks')}
                          />
                          Same for all tracks
                        </label>
                      </div>

                      {albumMetadataMode === 'all-tracks' && (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-gray-400">
                            Set Album Title, Album Artist and Year for all tracks
                          </p>
                          <div className="grid grid-cols-2 border border-gray-500 rounded-2xl">
                            <div className="border-r border-r-gray-500 border-b border-b-gray-500 p-2">
                              <h3>Album Title</h3>
                            </div>
                            <div className="border-b border-b-gray-500">
                              <input
                                type="text"
                                value={batchAlbumTitle}
                                onChange={(event) => setBatchAlbumTitle(event.currentTarget.value)}
                                className="w-full p-2 outline-none"
                              />
                            </div>
                            <div className="border-r border-r-gray-500 border-b border-b-gray-500 p-2">
                              <h3>Album Artist</h3>
                            </div>
                            <div className="border-b border-b-gray-500">
                              <input
                                type="text"
                                value={batchAlbumArtist}
                                onChange={(event) => setBatchAlbumArtist(event.currentTarget.value)}
                                className="w-full p-2 outline-none"
                              />
                            </div>
                            <div className="border-r border-r-gray-500 p-2">
                              <h3>Year</h3>
                            </div>
                            <div>
                              <input
                                type="text"
                                value={batchYear}
                                onChange={(event) => setBatchYear(event.currentTarget.value)}
                                className="w-full p-2 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
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
                      albumMetadataMode={albumMetadataMode}
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
