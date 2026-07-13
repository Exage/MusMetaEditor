# MusMetaEdit API Examples

## Single-track endpoints

### Read metadata from one file

```bash
curl -X POST http://localhost:3000/api/metadata/read \
  -F "file=@track.mp3"
```

```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "albumArtist": "Various Artists",
      "genre": "Rock",
      "year": 2024,
      "trackNumber": 1,
      "totalTracks": 10,
      "discNumber": 1,
      "totalDiscs": 1,
      "comment": "Some comment",
      "composer": "Composer",
      "copyright": "2024 Label",
      "bpm": 120,
      "language": "eng"
    },
    "cover": {
      "previewUrl": "data:image/jpeg;base64,...",
      "mimeType": "image/jpeg",
      "description": "Cover art"
    }
  }
}
```

### Write metadata to one file

```bash
curl -X POST http://localhost:3000/api/metadata/write \
  -F "file=@track.mp3" \
  -F 'metadata={"title":"New Title","artist":"New Artist","album":"Album","trackNumber":1,"year":2024}' \
  -o edited-track.mp3
```

The file is returned as an attachment — use `-o` to save it.

#### With a new cover

```bash
curl -X POST http://localhost:3000/api/metadata/write \
  -F "file=@track.mp3" \
  -F 'metadata={"title":"New Title"}' \
  -F "cover=@cover.jpg" \
  -F "coverDescription=New cover" \
  -o edited-track.mp3
```

#### Removing the cover

```bash
curl -X POST http://localhost:3000/api/metadata/write \
  -F "file=@track.mp3" \
  -F 'metadata={"title":"New Title"}' \
  -F "removeCover=1" \
  -o edited-track.mp3
```

---

## Batch endpoints (multiple tracks / album)

### Read multiple files

```bash
curl -X POST http://localhost:3000/api/metadata/batch/read \
  -F "files=@01-track.mp3" \
  -F "files=@02-track.mp3" \
  -F "files=@03-track.mp3"
```

Successful tracks go to `tracks`, problematic ones to `errors`:

```json
{
  "success": true,
  "data": {
    "tracks": [
      {
        "index": 0,
        "fileName": "01-track.mp3",
        "fileSize": 5123456,
        "metadata": { "title": "Track 1", "artist": "Artist", "trackNumber": 1 },
        "cover": { "previewUrl": "data:...", "mimeType": "image/jpeg" }
      },
      {
        "index": 1,
        "fileName": "02-track.mp3",
        "fileSize": 4234567,
        "metadata": { "title": "Track 2", "artist": "Artist", "trackNumber": 2 },
        "cover": null
      }
    ],
    "errors": [
      {
        "index": 2,
        "fileName": "03.wav",
        "error": "Unsupported file format. Supported formats: .mp3"
      }
    ]
  }
}
```

### Write an album (all tracks in a ZIP)

All fields except `files` and `tracks` are optional.

```bash
curl -X POST http://localhost:3000/api/metadata/batch/write \
  -F "files=@01.mp3" \
  -F "files=@02.mp3" \
  -F 'tracks=[{"index":0,"metadata":{"title":"Intro","artist":"Band","album":"Album","trackNumber":1,"year":2024}},{"index":1,"metadata":{"title":"First Song","artist":"Band","album":"Album","trackNumber":2,"year":2024}}]' \
  -o album.zip
```

#### `tracks` field format

A JSON string containing an array of objects. Each object:

```json
{
  "index": 0,
  "metadata": {
    "title": "...",
    "artist": "...",
    "album": "...",
    "albumArtist": "...",
    "genre": "...",
    "year": 2024,
    "trackNumber": 1,
    "totalTracks": 12,
    "discNumber": 1,
    "totalDiscs": 1,
    "comment": "...",
    "composer": "...",
    "copyright": "...",
    "bpm": 120,
    "language": "eng"
  }
}
```

Items are matched to files by `index`, not array order.

#### With a shared cover for the whole album

```bash
curl -X POST http://localhost:3000/api/metadata/batch/write \
  -F "files=@01.mp3" \
  -F "files=@02.mp3" \
  -F 'tracks=[{"index":0,"metadata":{"title":"Intro"}},{"index":1,"metadata":{"title":"Song"}}]' \
  -F "cover=@cover.jpg" \
  -F "coverMode=replace-all" \
  -o album.zip
```

#### Removing covers from all tracks

```bash
curl -X POST http://localhost:3000/api/metadata/batch/write \
  -F "files=@01.mp3" \
  -F "files=@02.mp3" \
  -F 'tracks=[{"index":0,"metadata":{"title":"Intro"}},{"index":1,"metadata":{"title":"Song"}}]' \
  -F "coverMode=remove-all" \
  -o album.zip
```

Don't send a cover file with `remove-all` — the endpoint returns 400 if you do.

#### Without coverMode (defaults to keep-per-track)

Each track keeps its current cover. `cover` is ignored:

```bash
curl -X POST http://localhost:3000/api/metadata/batch/write \
  -F "files=@01.mp3" \
  -F "files=@02.mp3" \
  -F 'tracks=[{"index":0,"metadata":{"title":"Intro"}},{"index":1,"metadata":{"title":"Song"}}]' \
  -o album.zip
```

---

## Limitations

| Parameter               | Limit           |
| ----------------------- | --------------- |
| Max files per batch     | 20              |
| Max size per audio file | 20 MB           |
| Max total batch size    | 200 MB          |
| Max cover size          | 5 MB            |
| Supported audio formats | `.mp3`          |
| Supported cover formats | JPEG, PNG, WebP |

## Client API (TypeScript)

```ts
import {
  readTrackMetadata,
  writeTrackMetadata,
  readTracksMetadataBatch,
  writeTracksMetadataBatch,
} from '@/app/shared/api/requests'
import type { IReadTracksMetadataBatchResponseData } from '@/app/shared/api/types'

// Single read
const single = await readTrackMetadata(formData)
// single: TrackMetadataFormValues

// Single write
const file = await writeTrackMetadata(formData)
// file: IDownloadedFile { blob, fileName, contentType }

// Batch read
const batch = await readTracksMetadataBatch(formData)
// batch: IReadTracksMetadataBatchResponseData
// batch.tracks — succeeded, batch.errors — failed

// Batch write
const zip = await writeTracksMetadataBatch(formData)
// zip: IDownloadedFile { blob, fileName: "album.zip", contentType: "application/zip" }
```
