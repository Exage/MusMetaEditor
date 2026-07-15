import { mergeClassNames } from '@/app/shared/utils'

interface TrackMetadataFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  isLast: boolean
  disabled?: boolean
}

export function TrackMetadataField({
  label,
  value,
  onValueChange,
  isLast,
  disabled = false,
}: TrackMetadataFieldProps) {
  const labelClassName = mergeClassNames(
    'border-r border-r-gray-500 p-2',
    !isLast && 'border-b border-b-gray-500'
  )
  const inputWrapperClassName = mergeClassNames(!isLast && 'border-b border-b-gray-500')

  return (
    <>
      <div className={labelClassName}>
        <h3>{label}</h3>
      </div>
      <div className={inputWrapperClassName}>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          className={mergeClassNames(
            'w-full p-2 outline-none',
            disabled && 'cursor-not-allowed text-gray-500 bg-gray-500/5'
          )}
        />
      </div>
    </>
  )
}
