---
name: client-server-boundary
description: Use when working with server-only code, client imports, shared utility barrels, API routes, Node-only modules, Buffer, node-id3, or browser bundle safety.
---

# Skill: Client/server boundary

Use this skill when moving code into shared utilities, adding imports, working with API routes, or using Node-only modules.

## Goal

Keep server-only code out of client bundles and avoid accidental imports from Client Components.

## Server-only code

Server-only code includes anything using:

- `fs`
- `path`
- `Buffer`
- `node-id3`
- server secrets
- server runtime assumptions
- direct file-system access
- metadata writing that depends on Node-only packages

Server-only utility files must start with:

```ts
import 'server-only'
```

## Shared utility barrel rule

`app/shared/utils/index.ts` is not automatically safe.

Only export browser-safe or universal utilities from:

```txt
app/shared/utils/index.ts
```

Do not export server-only utilities from the shared barrel.

Server-only utilities must be imported directly from their file path.

Good:

```ts
import { writeTrackMetadata } from '@/app/shared/utils/metadata-write/write-track-metadata'
```

Bad:

```ts
import { writeTrackMetadata } from '@/app/shared/utils'
```

## Before moving code to shared utilities

Ask:

- Can this code run in the browser?
- Does it import Node-only modules?
- Does it use `Buffer`, file-system APIs, secrets, or server runtime assumptions?
- Will a Client Component be able to import it by accident?

If the answer is uncertain, keep the code close to the API route or import it directly from its server-only file.

## API route rule

API routes may call server-only utilities.

Client-side code must call API endpoints through functions in:

```txt
app/shared/api/requests/
```

Client-side code must not directly import server-only metadata, cover, or file-processing utilities.

## Before finishing

Check:

- Server-only files include `import 'server-only'`.
- Server-only utilities are not exported from `app/shared/utils/index.ts`.
- Client Components do not import Node-only code.
- Shared barrels expose only browser-safe or universal code.
