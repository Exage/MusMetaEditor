import type { TrackMetadataFormValues } from '@/app/shared/interface'
import { TrackMetadataField } from './track-metadata-field'
import {
  TRACK_METADATA_FORM_FIELDS,
  type TrackMetadataTextField,
} from './track-metadata-form.constants'

interface TrackMetadataFormProps {
  draft: TrackMetadataFormValues
  onMetadataChange: (field: TrackMetadataTextField, value: string) => void
}

export function TrackMetadataForm({ draft, onMetadataChange }: TrackMetadataFormProps) {
  return (
    <div className="grid grid-cols-2 border border-gray-500 rounded-2xl">
      {TRACK_METADATA_FORM_FIELDS.map((field, index) => (
        <TrackMetadataField
          key={field.field}
          label={field.label}
          value={String(draft.metadata[field.field] ?? '')}
          onValueChange={(value) => onMetadataChange(field.field, value)}
          isLast={index === TRACK_METADATA_FORM_FIELDS.length - 1}
        />
      ))}
    </div>
  )
}
