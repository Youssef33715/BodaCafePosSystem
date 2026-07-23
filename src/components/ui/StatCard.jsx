import { motion } from 'framer-motion'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'

const colorMap = {
  purple: 'from-primary-700/20 to-primary-500/5 text-primary-400 border-primary-500/20',
  green: 'from-success/20 to-success/5 text-success border-success/20',
  blue: 'from-info/20 to-info/5 text-info border-info/20',
  orange: 'from-secondary/20 to-secondary/5 text-secondary-light border-secondary/20',
  amber: 'from-warning/20 to-warning/5 text-warning border-warning/20',
  red: 'from-danger/20 to-danger/5 text-danger border-danger/20',
}

export default function StatCard({ icon: Icon, label, value, trend, trendDirection = 'up', sub, color = 'purple' }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="card p-5 flex flex-col gap-4 min-w-0"
    >
      <div className="flex items-center justify-between">
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center text-xl shrink-0`}>
          <Icon />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trendDirection === 'up' ? 'text-success' : 'text-danger'}`}>
            {trendDirection === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-txt-secondary text-sm truncate">{label}</p>
        <p className="text-2xl font-bold text-txt font-display mt-1 truncate">{value}</p>
        {sub && <p className="text-xs text-txt-muted mt-1 truncate">{sub}</p>}
      </div>
    </motion.div>
  )
}
