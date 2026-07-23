import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, as: Comp = motion.div, ...props }) {
  return (
    <Comp
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.45)' } : undefined}
      className={`card p-5 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
