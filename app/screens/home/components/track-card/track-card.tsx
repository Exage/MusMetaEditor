import type { TrackMetadataFormValues } from '@/app/shared/interface'
import type { TTrackCoverMode } from '@/app/shared/api/types'
import { Button } from '@/app/shared/components/button'
import { SelectedFile } from '../selected-file'
import { TrackCoverReader } from '../track-cover-reader'
import { TrackMetadataForm } from '../track-metadata-form'
import { areTrackFormValuesEqual } from '../../lib/track-form-values'
import type { TrackItem } from '../../home.hook'

type TAlbumMetadataMode = 'per-track' | 'all-tracks'

interface TrackCardProps {
  track: TrackItem
  index: number
  coverMode: TTrackCoverMode
  albumMetadataMode: TAlbumMetadataMode
  onClear: (trackId: string) => void
  onEditToggle: (trackId: string) => void
  onMetadataCancel: (trackId: string) => void
  onMetadataChange: (
    trackId: string,
    field: keyof TrackMetadataFormValues['metadata'],
    value: TrackMetadataFormValues['metadata'][keyof TrackMetadataFormValues['metadata']]
  ) => void
  onReorder: (trackId: string, nextPosition: number) => void
  trackCount: number
}

export function TrackCard({
  track,
  index,
  coverMode,
  albumMetadataMode,
  onClear,
  onEditToggle,
  onMetadataCancel,
  onMetadataChange,
  onReorder,
  trackCount,
}: TrackCardProps) {
  const hasMetadata = Boolean(track.metadata)
  const isReading = track.status === 'reading'
  const canEdit = hasMetadata && track.status !== 'reading'
  const isChanged =
    track.status === 'read' &&
    track.metadata &&
    track.initialMetadata &&
    !areTrackFormValuesEqual({ metadata: track.initialMetadata }, { metadata: track.metadata })

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-gray-500 p-4">
      <SelectedFile
        file={track.file}
        error={track.error}
        status={track.status}
        canRemove={!isReading}
        action={
          isChanged && (
            <Button variant="warning" onClick={() => onMetadataCancel(track.id)}>
              Revert Changes
            </Button>
          )
        }
        onClear={() => onClear(track.id)}
      />

      {coverMode === 'keep-per-track' && <TrackCoverReader cover={track.cover ?? undefined} />}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button variant="accent" disabled={!canEdit} onClick={() => onEditToggle(track.id)}>
            {track.isMetadataOpen ? 'Close Metadata' : 'Edit Metadata'}
          </Button>

          {trackCount > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <label htmlFor={`track_position_${track.id}`}>Position</label>
              <select
                id={`track_position_${track.id}`}
                value={index + 1}
                disabled={isReading}
                onChange={(event) => {
                  const nextPosition = Number(event.currentTarget.value)

                  if (Number.isFinite(nextPosition)) {
                    onReorder(track.id, nextPosition)
                  }
                }}
                className="w-20 rounded-xl border border-gray-500 bg-transparent px-3 py-2 outline-none"
              >
                {Array.from({ length: trackCount }, (_, optionIndex) => (
                  <option key={optionIndex + 1} value={optionIndex + 1}>
                    {optionIndex + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {track.isMetadataOpen && track.metadata && (
          <TrackMetadataForm
            draft={{ metadata: track.metadata }}
            onMetadataChange={(field, value) => onMetadataChange(track.id, field, value)}
            disabledFields={
              albumMetadataMode === 'all-tracks' ? ['album', 'albumArtist', 'year'] : []
            }
            hiddenFields={trackCount === 1 ? ['album', 'albumArtist'] : []}
          />
        )}
      </div>
    </div>
  )
}
