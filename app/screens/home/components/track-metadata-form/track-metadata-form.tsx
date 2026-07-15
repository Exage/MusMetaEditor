import type { TrackMetadataFormValues } from '@/app/shared/interface'
import { TrackMetadataField } from './track-metadata-field'
import {
  TRACK_METADATA_FORM_FIELDS,
  type TrackMetadataTextField,
} from './track-metadata-form.constants'

interface TrackMetadataFormProps {
  draft: TrackMetadataFormValues
  onMetadataChange: (field: TrackMetadataTextField, value: string) => void
  disabledFields?: TrackMetadataTextField[]
  hiddenFields?: TrackMetadataTextField[]
}

export function TrackMetadataForm({
  draft,
  onMetadataChange,
  disabledFields = [],
  hiddenFields = [],
}: TrackMetadataFormProps) {
  const visibleFields = TRACK_METADATA_FORM_FIELDS.filter(
    (field) => !hiddenFields.includes(field.field)
  )

  return (
    <div className="grid grid-cols-2 border border-gray-500 rounded-2xl">
      {visibleFields.map((field, index) => (
        <TrackMetadataField
          key={field.field}
          label={field.label}
          value={String(draft.metadata[field.field] ?? '')}
          onValueChange={(value) => onMetadataChange(field.field, value)}
          isLast={index === visibleFields.length - 1}
          disabled={disabledFields.includes(field.field)}
        />
      ))}
    </div>
  )
}
