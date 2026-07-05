import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines Tailwind classes, resolves conflicts, and filters out falsy values.
 *
 * - Use `clsx` for conditional class building (`cn('base', condition && 'extra')`)
 * - Use `tailwind-merge` to override base classes via props (`cn('px-4', className)` drops `px-4` if `className` has `px-6`)
 */
export function mergeClassNames(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}
