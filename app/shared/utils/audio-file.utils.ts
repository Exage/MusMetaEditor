import { SUPPORTED_AUDIO_FORMATS } from '@/app/shared/constants'

export const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.')

  if (dotIndex === -1 || dotIndex === fileName.length - 1) {
    return ''
  }

  return fileName.slice(dotIndex + 1).toLowerCase()
}

export const getSupportedAudioExtensions = (): string[] =>
  Object.values(SUPPORTED_AUDIO_FORMATS).flatMap(({ extensions }) => extensions)

export const isSupportedAudioFile = (file: File): boolean => {
  const extension = getFileExtension(file.name)
  const values: ReadonlyArray<{
    mimeTypes: readonly string[]
    extensions: readonly string[]
  }> = Object.values(SUPPORTED_AUDIO_FORMATS)

  return values.some(
    ({ mimeTypes, extensions }) =>
      mimeTypes.includes(file.type) || (extension !== '' && extensions.includes(extension))
  )
}
