import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="h-20 w-20 rounded-2xl bg-bg-hover border border-border flex items-center justify-center text-4xl text-txt-muted mb-5">
        <Icon />
      </div>
      <h3 className="text-lg font-semibold text-txt font-display">{title}</h3>
      <p className="text-sm text-txt-secondary mt-1.5 max-w-sm">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
