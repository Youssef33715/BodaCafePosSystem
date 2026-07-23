import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function MainLayout({ title, subtitle, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} title={title} subtitle={subtitle} />
        <motion.main
          key={title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 p-4 sm:p-6 max-w-[1920px] w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
