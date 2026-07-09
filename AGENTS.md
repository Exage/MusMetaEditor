<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# MusMetaEdit — audio metadata editor

Next.js 16 App Router + React 19.2, Tailwind CSS v4 (`@tailwindcss/postcss`), TypeScript strict.

## Commands

```
npm run dev         # dev server on :3000
npm run build       # production build
npm run lint        # ESLint (flat config) — run before committing
npm run format      # Prettier (no semis, single quotes, trailing commas es5, print 100)
npm run format:check
```

Prefer `lint` then `format:check` before committing. No test framework exists — do not attempt to run tests.

## Project layout

```
app/
  layout.tsx                      # root layout
  (web)/
    page.tsx                      # homepage route
    some-route/
      page.tsx                    # /some-route route
      [slug]/
        page.tsx                  # /some-route/<slug> route
  (api)/api/                      # API routes; see the `api-routes` skill for endpoint details
  screens/
    some-screen/
      index.ts
      some-screen.component.tsx   # component name: SomeScreen
      some-screen.hook.ts
      components/                 # optional
      lib/                        # optional
  shared/
    api/
      requests/                  # direct endpoint calls, no generic overloaded client
      types/                     # API request/response contracts
      lib/                       # internal API parsing/error/file helpers
    constants/                    # file-limits, audio-formats (MP3 only), api-routes
    interface/                    # domain interfaces such as TrackMetadata and TrackCover
    utils/                        # audio-file, metadata read/write, cover, form parsing
```

## Key constraints

- **Only MP3 supported**. FLAC in `audio-formats.ts` is commented out. Adding a format requires updating `SUPPORTED_AUDIO_FORMATS`, adding mime-type handling in utils, and adding `music-metadata` parser support.
- File limits: 20 MB audio, 5 MB cover. Cover must be JPEG/PNG/WebP.
- `@/` path alias maps to project root (not `src/`).
- No `.ts`/`.tsx` extensions on imports — `moduleResolution: "bundler"` handles it.
- API routes use the `(api)` route group — does not affect URL path.
- File and folder names use `kebab-case` across the whole project, not `camelCase`.

## Skills

Project-specific OpenCode skills live under `.opencode/skills/<name>/SKILL.md`.

Use these skills when relevant:

- `code-organization` — for code structure, refactoring, function extraction, naming, comments, and avoiding unnecessary abstraction.
- `project-structure` — when deciding where files should live.
- `client-server-boundary` — when working with server-only code, shared utilities, barrels, or client imports.
- `api-routes` — when creating or changing API route handlers and client API request wrappers.
- `screens` — when creating or changing browser routes, screens, hooks, and screen-local components.
- `audio-metadata` — when reading, writing, validating, or transforming MP3 metadata and covers.

If several skills match the task, use all relevant skills before editing code.
Do not ignore skills when the task touches their area.

## Shared API structure

Client-side API access lives under `app/shared/api/`.

```
app/shared/api/
  requests/  # exported endpoint functions such as readTrackMetadata
  types/     # request body, response body, and shared API response types
  lib/       # internal helpers for response parsing, errors, and file downloads
```

Rules:

- Keep endpoint functions in `requests/` explicit: each function should call `fetch` directly with its route, method, and body.
- Do not reintroduce a broad generic API client for request construction unless multiple endpoints prove the duplication is real.
- Shared API response body types belong in `types/` and must not depend on `NextResponse`.
- Route handlers may type their return values with `NextResponse<...>` locally, using shared response body types from `app/shared/api/types`.
- Put only small reusable implementation helpers in `lib/`, such as parsing JSON API responses, extracting error messages, or parsing downloaded file metadata.
- UI code should import endpoint functions from `requests/`, not from low-level helpers.

## Pages / screens structure

Each browser route lives in `app/(web)/<route>/page.tsx`. The page file must be minimal — it only imports and re-exports a screen component from `app/screens/`.

### File naming convention inside a screen folder

```
app/screens/<name>/
  index.ts              # barrel export of the screen component
  <name>.component.tsx  # main screen component (exported as named function)
  <name>.hook.ts        # custom hooks (state, callbacks, side effects)
  components/           # optional: smaller UI components used only by this screen
  lib/                  # optional: pure utility functions
  other files           # optional: types, constants, helpers when the screen grows
```

### Example for `/help`

```
app/
  (web)/
    help/
      page.tsx          # import { HelpScreen } from '@/app/screens/help'; export default ...
  screens/
    help/
      index.ts
      help.component.tsx
      help.hook.ts
      components/
        help-header.tsx
        help-sections-list.tsx
        faq-list.tsx
      lib/
        help.utils.ts
```

Rules:

- `page.tsx` never contains JSX beyond `<ScreenComponent />`.
- Screen component names use the `Screen` suffix, for example `HomeScreen` or `HelpScreen`.
- Hooks without JSX live in `.ts`, not `.tsx`.
- Screen hooks use the `Hook` suffix in the function name, for example `useHomeScreenHook` or `useHelpScreenHook`.
- Keep the default screen structure minimal: start with `<name>.component.tsx` and `<name>.hook.ts`.
- Put small local types directly in the component or hook when that keeps the file clearer.
- `components/`, `lib/`, and any extra files are optional — create them only when the screen grows.
- If you add code comments, write them in English only.
- `app/shared/utils/index.ts` is a shared barrel, but it is not automatically safe for Client Components.
- Only add universal or browser-safe utilities to `app/shared/utils/index.ts`.
- Do not add server-only utilities to the barrel. Server-only includes anything using Node-only modules or APIs such as `fs`, `path`, `node-id3`, `Buffer`, secrets, or server runtime assumptions.
- Mark server-only utility files with `import 'server-only'`.
- Server-only utilities must be imported directly from their file path, not through the barrel.
- Before adding a new export to `app/shared/utils/index.ts`, check whether that module can safely end up in a client bundle. If not, keep it out of the barrel.
