import { parseBlob } from 'music-metadata'
import { TrackMetadata } from '@/app/shared/interface'

const getFirst = (value?: string[]): string | undefined => value?.[0]

const getFirstCommentText = (
  value?: Array<{
    text?: string
  }>
): string | undefined => value?.find((comment) => comment.text?.trim())?.text

export const readAudioMetadata = async (file: File): Promise<TrackMetadata> => {
  const parsed = await parseBlob(file)
  const { common } = parsed

  return {
    title: common.title ?? '',
    artist: common.artist ?? '',
    album: common.album,
    albumArtist: common.albumartist,
    genre: getFirst(common.genre),
    year: common.year,
    trackNumber: common.track.no ?? undefined,
    totalTracks: common.track.of ?? undefined,
    discNumber: common.disk.no ?? undefined,
    totalDiscs: common.disk.of ?? undefined,
    comment: getFirstCommentText(common.comment),
    composer: getFirst(common.composer),
    copyright: common.copyright,
    bpm: common.bpm,
    language: common.language,
  }
}
