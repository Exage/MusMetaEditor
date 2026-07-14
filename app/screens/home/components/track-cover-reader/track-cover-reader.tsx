import Image from 'next/image'
import type { TrackCover } from '@/app/shared/interface'

interface TrackCoverReaderProps {
  cover?: TrackCover
}

export function TrackCoverReader({ cover }: TrackCoverReaderProps) {
  return (
    <div className="size-[140px] shrink-0 overflow-hidden border border-gray-500 rounded-2xl flex items-center justify-center">
      {cover?.previewUrl ? (
        <Image
          loader={({ src }) => src}
          unoptimized
          src={cover.previewUrl}
          alt="Track cover preview"
          width={140}
          height={140}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-sm text-gray-400 px-4 text-center">No cover</span>
      )}
    </div>
  )
}
