---
name: screens
description: Use when creating or changing MusMetaEdit browser routes, page.tsx files, screen components, screen hooks, or screen-local components.
---

# Skill: Screens

Use this skill when creating or changing browser pages, screen components, screen hooks, or screen-local components.

## Goal

Keep browser routes thin and keep screen UI organized without overbuilding folders too early.

## Route files

Browser route files live in:

```txt
app/(web)/<route>/page.tsx
```

Rules:

- `page.tsx` must be minimal.
- `page.tsx` should only import and render a screen component.
- Do not put state, callbacks, effects, or large JSX directly into `page.tsx`.

## Screen folders

Screen code lives in:

```txt
app/screens/<screen-name>/
```

Default structure:

```txt
app/screens/<screen-name>/
  index.ts
  <screen-name>.component.tsx
  <screen-name>.hook.ts
```

## Component file

Use `<screen-name>.component.tsx` for:

- screen layout,
- JSX,
- rendering local components,
- connecting data from the screen hook to the UI.

Screen component names must use the `Screen` suffix.

Example:

```tsx
export function HomeScreen() {}
```

Keep component code readable. If the JSX becomes hard to scan, extract local components into `components/`.

## Hook file

Use `<screen-name>.hook.ts` for:

- state,
- callbacks,
- side effects,
- derived UI state,
- calling client API request functions.

Hooks without JSX must use `.ts`, not `.tsx`.

Screen hook names must use the `Hook` suffix.

Example:

```ts
export function useHomeScreenHook() {}
```

## Local components

Create:

```txt
app/screens/<screen-name>/components/
```

only when the screen has UI parts that are large enough to deserve separate files.

Do not extract a component when it only hides two obvious lines of JSX.

## Screen-local lib

Create:

```txt
app/screens/<screen-name>/lib/
```

only for pure helpers used by this screen.

Move helpers to `app/shared/` only when they are reused by multiple features.

## Types and constants

Keep small local types and constants inside the component or hook when that is clearer.

Create separate `types.ts` or `constants.ts` only when the screen grows enough that inline declarations reduce readability.

## Before finishing

Check:

- `page.tsx` is minimal.
- Screen component names use the `Screen` suffix.
- Screen logic is in the hook.
- JSX is in the component.
- Local components are not extracted too early.
- Screen-local helpers did not get moved to shared utilities without real reuse.
