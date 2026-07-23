import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from '../data/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('boda_lang') || 'ar')

  useEffect(() => {
    const t = translations[lang]
    document.documentElement.setAttribute('dir', t.dir)
    document.documentElement.setAttribute('lang', t.lang)
    localStorage.setItem('boda_lang', lang)
  }, [lang])

  const t = translations[lang]
  const isRTL = t.dir === 'rtl'
  const toggleLang = () => setLang((p) => (p === 'ar' ? 'en' : 'ar'))

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
