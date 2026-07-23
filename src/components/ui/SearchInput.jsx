import { FiSearch } from 'react-icons/fi'

export function SearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base ps-9"
      />
    </div>
  )
}
