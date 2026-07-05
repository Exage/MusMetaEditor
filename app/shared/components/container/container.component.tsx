import { mergeClassNames } from '@/app/shared/utils/merge-class-names.utils'

type ContainerProps = {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={mergeClassNames('mx-auto w-full max-w-4xl px-2 sm:px-4', className)}>
      {children}
    </div>
  )
}
