interface UploadTrackProps {
  inputId: string
  label?: string
  className?: string
}

export function UploadTrack({ inputId, label, className }: UploadTrackProps) {
  return (
    <div className={className ?? 'flex justify-center py-10 rounded-3xl bg-fuchsia-500/5'}>
      <label
        htmlFor={inputId}
        className="inline-block uppercase px-10 py-2 bg-fuchsia-300/5 rounded-full text-fuchsia-400 text-2xl hover:bg-fuchsia-300/15 cursor-pointer transition-colors"
      >
        {label ?? 'upload your tracks'}
      </label>
    </div>
  )
}
