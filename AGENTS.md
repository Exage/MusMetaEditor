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
  (api)/api/
    health/route.ts               # GET /api/health
    tracks/metadata/read/route.ts # POST upload file, returns metadata + cover
    tracks/metadata/write/route.ts# POST upload file + metadata JSON, returns modified audio
  screens/
    some-screen/
      index.ts
      some-screen.component.tsx   # component name: SomeScreen
      some-screen.hook.ts
      components/                 # optional
      lib/                        # optional
  shared/
    constants/                    # file-limits, audio-formats (MP3 only), api-routes
    interface/                    # TrackMetadata, TrackCover, ApiResponse types
    utils/                        # audio-file, metadata read/write, cover, form parsing
```

## Key constraints

- **Only MP3 supported**. FLAC in `audio-formats.ts` is commented out. Adding a format requires updating `SUPPORTED_AUDIO_FORMATS`, adding mime-type handling in utils, and adding `music-metadata` parser support.
- File limits: 20 MB audio, 5 MB cover. Cover must be JPEG/PNG/WebP.
- `@/` path alias maps to project root (not `src/`).
- No `.ts`/`.tsx` extensions on imports — `moduleResolution: "bundler"` handles it.
- API routes use the `(api)` route group — does not affect URL path.
- File and folder names use `kebab-case` across the whole project, not `camelCase`.

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
      page.tsx          # import { Help } from '@/app/screens/help'; export default ...
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
