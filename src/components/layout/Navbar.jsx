import { useEffect, useState } from 'react'
import { FiMenu, FiBell, FiCalendar, FiClock, FiGlobe, FiChevronDown } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function Navbar({ onMenuClick, title, subtitle }) {
  const { t, isRTL, toggleLang } = useLang()
  const { user } = useAuth()
  const now = useClock()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const dateStr = now.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden h-10 w-10 rounded-lg bg-bg-card border border-border flex items-center justify-center text-txt shrink-0"
          >
            <FiMenu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold font-display text-txt truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-txt-secondary truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-xs text-txt-secondary bg-bg-card border border-border rounded-lg px-3 py-2">
            <span className="flex items-center gap-1.5"><FiCalendar size={14} className="text-primary-400" />{dateStr}</span>
            <span className="w-px h-4 bg-border" />
            <span className="flex items-center gap-1.5"><FiClock size={14} className="text-secondary-light" />{timeStr}</span>
          </div>

          <button
            onClick={toggleLang}
            className="h-10 px-3 rounded-lg bg-bg-card border border-border flex items-center gap-1.5 text-txt-secondary hover:text-txt hover:border-border-light transition-colors text-sm"
            title="Toggle language"
          >
            <FiGlobe size={16} />
            <span className="hidden sm:inline font-medium">{isRTL ? 'EN' : 'AR'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className="relative h-10 w-10 rounded-lg bg-bg-card border border-border flex items-center justify-center text-txt-secondary hover:text-txt transition-colors"
            >
              <FiBell size={17} />
              <span className="absolute -top-1 -end-1 h-4 w-4 rounded-full bg-danger text-[10px] font-bold flex items-center justify-center text-white">3</span>
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute end-0 mt-2 w-72 card p-2 shadow-lift z-40"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
                      <span className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-txt truncate">{isRTL ? 'طلب جديد على الطاولة رقم 5' : 'New order on Table 5'}</p>
                        <p className="text-xs text-txt-muted mt-0.5">{isRTL ? 'منذ 5 دقائق' : '5 minutes ago'}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserOpen((p) => !p)}
              className="flex items-center gap-2 h-10 ps-1.5 pe-2.5 rounded-lg bg-bg-card border border-border hover:border-border-light transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-xs font-bold text-primary-300">
                {user?.name?.[0] || 'A'}
              </div>
              <span className="hidden sm:inline text-sm text-txt font-medium">{user?.name}</span>
              <FiChevronDown size={14} className="text-txt-muted hidden sm:inline" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
