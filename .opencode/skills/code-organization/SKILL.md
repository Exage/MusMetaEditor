---
name: code-organization
description: Use when adding, changing, refactoring, or reviewing MusMetaEdit application code for structure, naming, comments, extraction, and abstraction decisions.
---

# Skill: Code organization

Use this skill when adding, changing, refactoring, or reviewing application code.

## Goal

Write code that fits the project structure, stays readable, and avoids unnecessary fragmentation.

## Core principles

- Prefer clear, direct code over excessive abstraction.
- Do not split logic into many tiny functions only to make one larger function work.
- Keep related logic close to where it is used until there is a clear reason to move it.
- Extract logic only when it improves readability, reuse, testability, or separates a real responsibility.
- Avoid creating new folders, barrel files, helpers, or abstraction layers unless the existing code actually needs them.
- Do not introduce generic utilities, generic API clients, or shared abstractions for one-off use cases.

## Function extraction rules

Extract a function when at least one condition is true:

- The same logic is used in more than one place.
- The parent function becomes difficult to scan.
- The logic has a clear independent responsibility.
- The extracted function can be named naturally without vague words like `handle`, `process`, `manage`, or `do`.
- The extraction separates UI logic, API logic, validation logic, parsing logic, metadata logic, cover-processing logic, or file-processing logic.

Do not extract a function when:

- It is used only once and makes the flow harder to follow.
- The function only wraps one or two obvious lines.
- The name is less clear than the code itself.
- The extraction forces the reader to jump between many files.
- The function exists only because of an artificial “small functions” rule.

## Local-first rule

Start local. Move code outward only when there is a real reason.

Preferred order:

1. Keep small logic inside the component, hook, or route where it is used.
2. Move logic to a local `lib/` folder when the screen or feature grows.
3. Move logic to `app/shared/` only when it is truly reusable across features.

Do not move code to shared utilities just because it looks reusable in theory.

## Comments

- Write code comments in English only.
- Do not write comments that repeat what the code already says.
- Add comments only for non-obvious decisions, edge cases, browser/server constraints, file format limitations, or temporary trade-offs.
- Prefer clear naming and simple control flow over explanatory comments.

Good comment:

```ts
// Telegram may ignore APIC frames when the MIME type is missing.
```

Bad comment:

```ts
// Set title
```

## Naming

- Use `kebab-case` for file and folder names.
- Use clear domain names instead of vague generic names.
- Avoid names like `utils`, `helpers`, `manager`, `processor`, or `handler` when a more specific name exists.
- Hooks must use the `Hook` suffix when they represent screen-level logic, for example `useHomeScreenHook`.

## Refactoring rules

When refactoring existing code:

- Preserve existing behavior unless the task explicitly asks to change it.
- Prefer small, focused changes over large rewrites.
- Do not rename files or move code without a clear reason.
- Do not change public API response shapes unless required.
- Do not add support for new audio formats unless explicitly requested.
- Keep MP3 as the only supported audio format unless the task says otherwise.

## Before finishing

Check:

- The code follows the current folder structure.
- The logic is not over-split into tiny functions.
- Reusable logic is extracted only when reuse or clarity is real.
- Comments are in English.
- New abstractions are justified by actual duplication or complexity.
