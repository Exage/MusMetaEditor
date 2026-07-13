import { type ButtonHTMLAttributes } from 'react'
import { mergeClassNames } from '@/app/shared/utils/merge-class-names.utils'

// Button variants map semantic names to Tailwind color palettes:
// primary -> emerald, danger -> rose, accent -> fuchsia,
// secondary -> slate, warning -> amber, info -> sky.
/**
 * Shared reusable button with semantic color variants.
 *
 * Variants and their Tailwind color palettes:
 * - `primary`   → emerald  (bg-emerald-500/10, text-emerald-500)
 * - `danger`    → rose     (bg-rose-500/10, text-rose-500)
 * - `accent`    → fuchsia  (bg-fuchsia-500/10, text-fuchsia-500)
 * - `secondary` → slate    (bg-slate-500/10, text-slate-500)
 * - `warning`   → amber    (bg-amber-500/10, text-amber-500)
 * - `info`      → sky      (bg-sky-500/10, text-sky-500)
 *
 * @example
 * <Button variant="primary" disabled={isSaving}>Save</Button>
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>
 * <Button type="submit">Submit</Button>
 */
const buttonVariants = {
  primary:
    'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:hover:bg-emerald-500/10',
  danger: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 disabled:hover:bg-rose-500/10',
  accent:
    'bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20 disabled:hover:bg-fuchsia-500/10',
  secondary: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 disabled:hover:bg-slate-500/10',
  warning: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 disabled:hover:bg-amber-500/10',
  info: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 disabled:hover:bg-sky-500/10',
} as const

const baseClasses =
  'rounded-full px-6 py-2 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Color variant of the button.
   *
   * - `primary` → emerald
   * - `danger` → rose
   * - `accent` → fuchsia
   * - `secondary` → slate
   * - `warning` → amber
   * - `info` → sky
   *
   * @default 'primary'
   */
  variant?: keyof typeof buttonVariants
}

/**
 * Reusable button with semantic color variants.
 * Defaults to `variant="primary"` and `type="button"`.
 *
 * @see {@link buttonVariants} for the full variant → color mapping.
 */
export function Button({
  variant = 'primary',
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={mergeClassNames(baseClasses, buttonVariants[variant], className)}
      type={type}
      {...rest}
    >
      {children}
    </button>
  )
}
