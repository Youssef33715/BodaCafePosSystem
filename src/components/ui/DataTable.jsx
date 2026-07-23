import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import { SkeletonTable } from './Skeletons'
import EmptyState from './EmptyState'
import { FiInbox } from 'react-icons/fi'

export default function DataTable({ columns, data, loading, emptyTitle, emptyMessage }) {
  const { t } = useLang()

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-start text-xs font-semibold text-txt-muted uppercase tracking-wide whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        {loading ? (
          <SkeletonTable rows={6} cols={columns.length} />
        ) : (
          <tbody>
            {data.map((row, i) => (
              <motion.tr
                key={row.id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="border-b border-border/60 hover:bg-bg-hover/60 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-sm text-txt whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        )}
      </table>
      {!loading && data.length === 0 && (
        <EmptyState icon={FiInbox} title={emptyTitle || t.common.noResults} message={emptyMessage || ''} />
      )}
    </div>
  )
}
