---
name: project-structure
description: Use when deciding where MusMetaEdit files should live, moving code between folders, or preserving app, screens, shared, and API structure.
---

# Skill: Project structure

Use this skill when deciding where new code should live or when moving existing code between folders.

## Goal

Place files according to the MusMetaEdit project structure and avoid accidental architecture drift.

## Project layout

```txt
app/
  (web)/                 # browser routes
  (api)/api/             # API routes
  screens/               # screen-level UI
  shared/
    api/                 # client API requests, types, and API helpers
    constants/           # shared constants
    interface/           # domain interfaces
    utils/               # shared utilities
```

## Browser routes

Browser pages live in:

```txt
app/(web)/<route>/page.tsx
```

Rules:

- `page.tsx` must stay minimal.
- `page.tsx` should only import and render the matching screen component.
- Do not put screen JSX, state, effects, or business logic directly into `page.tsx`.

Example:

```tsx
import { HelpScreen } from '@/app/screens/help'

export default function HelpPage() {
  return <HelpScreen />
}
```

## Screens

Screen code lives in:

```txt
app/screens/<screen-name>/
```

Default screen structure:

```txt
app/screens/<screen-name>/
  index.ts
  <screen-name>.component.tsx
  <screen-name>.hook.ts
```

Use:

- `<screen-name>.component.tsx` for JSX and screen layout.
- `<screen-name>.hook.ts` for state, callbacks, side effects, and screen logic.
- `components/` only for UI parts used by this screen.
- `lib/` only for pure helpers used by this screen.

Screen component names must use the `Screen` suffix, for example `HomeScreen` or `HelpScreen`.

Do not create `components/`, `lib/`, `types.ts`, or `constants.ts` by default. Create them only when the screen actually grows.

## API routes

API route handlers live in:

```txt
app/(api)/api/<feature>/<action>/route.ts
```

Route handlers should:

- parse request data,
- validate inputs,
- call focused server-side utilities,
- return clear API responses.

Do not put large metadata-processing, cover-processing, or file-processing logic directly inside the route handler when it makes the route hard to read.

## Shared API

Client-side endpoint calls live in:

```txt
app/shared/api/requests/
```

API request and response types live in:

```txt
app/shared/api/types/
```

Small internal API helpers live in:

```txt
app/shared/api/lib/
```

Rules:

- Keep endpoint functions explicit.
- Each endpoint function should call `fetch` directly with its route, method, and body.
- Do not introduce a broad generic API client unless several endpoints prove that the duplication is real.
- UI code should import endpoint functions from `requests/`, not from low-level helpers.
- Shared API response body types must not depend on `NextResponse`.

## Shared utilities

Shared utilities live in:

```txt
app/shared/utils/
```

Only put code here when it is truly reusable across features.

Do not add feature-specific helpers to `app/shared/utils/` just because they are pure functions.

## Imports

- Use the `@/` alias for project imports.
- `@/` maps to the project root, not to `src/`.
- Do not include `.ts` or `.tsx` extensions in imports.
- Follow existing import style in nearby files.

## Before finishing

Check:

- New files are in the correct folder.
- `page.tsx` files are minimal.
- Screen folders were not overbuilt too early.
- Shared folders contain only actually shared code.
- API types and route handlers are separated correctly.
