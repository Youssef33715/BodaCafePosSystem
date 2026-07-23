import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, subtitle, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`relative w-full ${sizes[size]} max-h-[90vh] flex flex-col bg-bg-card border border-border rounded-xl shadow-lift overflow-hidden`}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border shrink-0">
              <div>
                <h3 className="text-lg font-bold font-display text-txt">{title}</h3>
                {subtitle && <p className="text-sm text-txt-secondary mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="close"
                className="h-9 w-9 rounded-lg flex items-center justify-center text-txt-secondary hover:bg-bg-hover hover:text-txt transition-colors shrink-0"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
