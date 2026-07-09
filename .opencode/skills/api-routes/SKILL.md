---
name: api-routes
description: Use when creating or changing Next.js API route handlers, route.ts files, API response types, or client API request wrappers in MusMetaEdit.
---

# Skill: API routes

Use this skill when creating or changing Next.js API route handlers or client API request wrappers.

## Goal

Keep API routes explicit, readable, and aligned with the project structure.

## Location

API route handlers live in:

```txt
app/(api)/api/<feature>/<action>/route.ts
```

The `(api)` route group does not affect the URL path.

Example:

```txt
app/(api)/api/metadata/read/route.ts
```

maps to:

```txt
POST /api/metadata/read
```

## Route handler responsibilities

A route handler should:

- accept the request,
- parse request data,
- validate files and fields,
- call focused server-side utilities,
- return a clear response.

A route handler should not become a large place for all metadata, cover, or file-processing logic.

## Types

Shared API response body types belong in:

```txt
app/shared/api/types/
```

Rules:

- Shared response body types must not depend on `NextResponse`.
- Route handlers may use `NextResponse<...>` locally.
- Do not change public response shapes unless the task explicitly requires it.

## Client API functions

Client-side endpoint calls belong in:

```txt
app/shared/api/requests/
```

Rules:

- Keep endpoint functions explicit.
- Do not create a generic overloaded API client for one or two endpoints.
- UI code should call request functions, not `fetch` directly, when the endpoint already has a request wrapper.

## Error handling

Return clear API errors for:

- missing files,
- unsupported audio formats,
- unsupported cover formats,
- files exceeding size limits,
- invalid metadata JSON,
- metadata read/write failures.

Do not leak internal stack traces to the client.

## File constraints

Current limits:

- audio file: 20 MB
- cover file: 5 MB
- batch audio files: 20 files
- total batch upload: 200 MB

Current supported formats:

- audio: MP3 only
- audio MIME types: `audio/mpeg`, `audio/mp3`
- cover: JPEG, PNG, WebP

Do not add new audio formats unless explicitly requested.

## Before finishing

Check:

- The route lives under `app/(api)/api/`.
- The URL path is correct.
- Validation is explicit.
- Server-only utilities stay server-only.
- Shared response types do not import `NextResponse`.
- Client request wrappers are updated when needed.
