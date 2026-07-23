import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiRefreshCw } from 'react-icons/fi'
import { GiCoffeeCup } from 'react-icons/gi'
import { useLang } from '../context/LanguageContext'
import Button from '../components/ui/Button'

export default function NotFound({ code = '404', titleAr, titleEn, messageAr, messageEn }) {
  const { isRTL } = useLang()
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-4xl text-secondary-light shadow-glow mb-6"
        >
          <GiCoffeeCup />
        </motion.div>
        <p className="text-6xl font-bold font-display text-primary-500">{code}</p>
        <h1 className="text-xl font-bold font-display text-txt mt-3">
          {titleAr ? (isRTL ? titleAr : titleEn) : (isRTL ? 'الصفحة غير موجودة' : 'Page not found')}
        </h1>
        <p className="text-sm text-txt-secondary mt-2">
          {messageAr ? (isRTL ? messageAr : messageEn) : (isRTL ? 'عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' : "Sorry, the page you're looking for doesn't exist or was moved.")}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/dashboard"><Button icon={FiHome}>{isRTL ? 'العودة للرئيسية' : 'Back to Dashboard'}</Button></Link>
          <Button variant="outline" icon={FiRefreshCw} onClick={() => window.location.reload()}>{isRTL ? 'إعادة المحاولة' : 'Retry'}</Button>
        </div>
      </motion.div>
    </div>
  )
}
