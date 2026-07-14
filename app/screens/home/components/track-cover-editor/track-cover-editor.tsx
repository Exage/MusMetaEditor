import Image from 'next/image'
import type { TrackCover } from '@/app/shared/interface'
import { Button } from '@/app/shared/components/button'

interface TrackCoverEditorProps {
  cover?: TrackCover
  disabled?: boolean
  onAddClick: () => void
  onRemove: () => void
}

export function TrackCoverEditor({ cover, disabled, onAddClick, onRemove }: TrackCoverEditorProps) {
  return (
    <div className="flex flex-col gap-3 shrink-0">
      <div className="size-[140px] shrink-0 overflow-hidden border border-gray-500 rounded-2xl flex items-center justify-center">
        {cover?.previewUrl ? (
          <Image
            loader={({ src }) => src}
            unoptimized
            src={cover.previewUrl}
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
        <Button variant="accent" disabled={disabled} onClick={onAddClick}>
          Add
        </Button>
        <Button variant="danger" disabled={disabled || !cover} onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  )
}
