export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      {label && <span className="text-sm text-txt-secondary">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? 'bg-primary-600' : 'bg-bg-hover border border-border'
        }`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200"
          style={{ insetInlineStart: checked ? 'calc(100% - 22px)' : '2px' }}
        />
      </button>
    </label>
  )
}
