import { Button } from '@/app/shared/components/button'

interface SelectedFileProps {
  file: File
  error?: string | null
  status?: 'selected' | 'reading' | 'read' | 'error'
  canRemove?: boolean
  action?: React.ReactNode
  onClear?: () => void
}

export function SelectedFile({
  file,
  error,
  status,
  canRemove = true,
  action,
  onClear,
}: SelectedFileProps) {
  const isReading = status === 'reading'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="truncate font-medium">{file.name}</h3>
          <p className="text-sm text-gray-400">{file.size} bytes</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {onClear && (
            <Button variant="danger" disabled={!canRemove} onClick={onClear}>
              Remove
            </Button>
          )}
        </div>
      </div>
      {isReading && <p className="text-sm text-fuchsia-300">Reading metadata...</p>}
      {status === 'read' && <p className="text-sm text-emerald-400">Metadata read</p>}
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  )
}
