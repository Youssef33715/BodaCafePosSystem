import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useLang } from '../../context/LanguageContext'

export default function Pagination({ page, totalPages, onChange, pageSize, onPageSizeChange, totalItems }) {
  const { t, isRTL } = useLang()
  const PrevIcon = isRTL ? FiChevronRight : FiChevronLeft
  const NextIcon = isRTL ? FiChevronLeft : FiChevronRight

  const pages = []
  const maxShow = 5
  let start = Math.max(1, page - Math.floor(maxShow / 2))
  let end = Math.min(totalPages, start + maxShow - 1)
  start = Math.max(1, end - maxShow + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (totalPages <= 1 && !onPageSizeChange) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 flex-wrap">
      {onPageSizeChange && totalItems != null && (
        <p className="text-xs text-txt-muted order-2 sm:order-1">
          {isRTL ? `عرض ${Math.min((page - 1) * pageSize + 1, totalItems)} إلى ${Math.min(page * pageSize, totalItems)} من ${totalItems}` : `Showing ${Math.min((page - 1) * pageSize + 1, totalItems)}-${Math.min(page * pageSize, totalItems)} of ${totalItems}`}
        </p>
      )}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-txt-secondary hover:bg-bg-hover disabled:opacity-40 transition-colors"
        >
          <PrevIcon size={14} />
        </button>
        {start > 1 && <span className="text-txt-muted px-1">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-8 min-w-8 px-2 rounded-lg text-sm font-medium transition-colors ${
              p === page ? 'bg-primary-600 text-white' : 'text-txt-secondary hover:bg-bg-hover'
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="text-txt-muted px-1">…</span>}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-txt-secondary hover:bg-bg-hover disabled:opacity-40 transition-colors"
        >
          <NextIcon size={14} />
        </button>
      </div>
      {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="input-base w-auto text-xs py-1.5 order-3"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{isRTL ? `${s} لكل صفحة` : `${s} / page`}</option>
          ))}
        </select>
      )}
    </div>
  )
}
