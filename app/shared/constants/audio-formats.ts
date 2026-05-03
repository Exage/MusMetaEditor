type AudioFormatDefinition = {
  mimeTypes: readonly string[]
  extensions: readonly string[]
}

export const SUPPORTED_AUDIO_FORMATS = {
  mp3: {
    mimeTypes: ['audio/mpeg', 'audio/mp3'],
    extensions: ['mp3'],
  },
  // flac: {
  //   mimeTypes: ['audio/flac', 'audio/x-flac'],
  //   extensions: ['flac'],
  // },
} as const satisfies Record<string, AudioFormatDefinition>

export type SupportedAudioFormat = keyof typeof SUPPORTED_AUDIO_FORMATS
