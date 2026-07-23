export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm font-medium text-txt-secondary">{label}</span>}
      <div className="relative">
        {Icon && <Icon className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" />}
        <input className={`input-base ${Icon ? 'ps-10' : ''} ${error ? 'border-danger focus:border-danger focus:ring-danger/25' : ''} ${className}`} {...props} />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm font-medium text-txt-secondary">{label}</span>}
      <textarea className={`input-base min-h-[90px] resize-none ${error ? 'border-danger' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm font-medium text-txt-secondary">{label}</span>}
      <select className={`input-base cursor-pointer ${error ? 'border-danger' : ''} ${className}`} {...props}>
        {children}
      </select>
    </label>
  )
}
