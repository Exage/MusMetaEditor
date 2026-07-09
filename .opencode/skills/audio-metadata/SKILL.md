---
name: audio-metadata
description: Use when reading, writing, validating, or transforming MP3 metadata, ID3 tags, audio files, covers, file limits, or music-metadata/node-id3 code.
---

# Skill: Audio metadata

Use this skill when reading, writing, validating, or transforming audio metadata.

## Goal

Handle MP3 metadata safely without pretending that other audio formats are supported.

## Current scope

MusMetaEdit currently supports MP3 only.

Supported audio MIME types:

- `audio/mpeg`
- `audio/mp3`

Do not add FLAC, M4A, WAV, or other formats unless the task explicitly asks for it.

## Libraries

Use:

- `music-metadata` for reading metadata,
- `node-id3` for writing ID3 metadata,
- `sharp` for cover image processing and normalization.

## Metadata rules

Metadata fields should be treated as optional unless the UI or API contract requires otherwise.

Common fields:

- title
- artist
- album
- year
- genre
- track number
- cover

Do not invent missing metadata.

## Cover rules

Supported cover formats:

- JPEG
- PNG
- WebP

Cover file limit:

- 5 MB

When writing cover metadata, preserve or set correct MIME information when possible.

## File limits

Audio file limit:

- 20 MB

Batch limits:

- 20 audio files
- 200 MB total batch upload

## Server-only rule

Metadata writing and Node-dependent metadata utilities are server-only.

Files using `node-id3`, `Buffer`, or Node-only APIs must include:

```ts
import 'server-only'
```

Do not export server-only metadata utilities from `app/shared/utils/index.ts`.

## API behavior

Return clear errors for:

- missing audio file,
- unsupported audio format,
- invalid metadata payload,
- unsupported cover format,
- oversized audio file,
- oversized cover file,
- metadata read/write failure.

Do not return raw internal stack traces to the client.

## Before finishing

Check:

- MP3 remains the only supported audio format unless explicitly changed.
- File size limits are respected.
- Cover formats are validated.
- Server-only code is not exposed to client bundles.
- Metadata response/request types remain compatible with existing API contracts.
