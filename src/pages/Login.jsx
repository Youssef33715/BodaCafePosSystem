import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiShield,
  FiTrendingUp, FiUsers, FiGlobe,
} from 'react-icons/fi'
import { GiCoffeeCup } from 'react-icons/gi'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Button from '../components/ui/Button'

export default function Login() {
  const { login, loading } = useAuth()
  const { isRTL, toggleLang } = useLang()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.message || (isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'))
    }
  }

  const features = [
    { icon: FiTrendingUp, title: isRTL ? 'إدارة سهلة وفعالة' : 'Simple & Powerful', desc: isRTL ? 'تحكم كامل في المبيعات والمخزون' : 'Full control over sales & stock', color: 'from-primary-600 to-primary-800' },
    { icon: FiShield, title: isRTL ? 'أمن وموثوق' : 'Secure & Reliable', desc: isRTL ? 'حماية بياناتك بأعلى معايير الأمان' : 'Your data protected at the highest standard', color: 'from-success to-emerald-700' },
    { icon: FiUsers, title: isRTL ? 'فريق متكامل' : 'Full Team Support', desc: isRTL ? 'إدارة الموظفين والصلاحيات بسهولة' : 'Manage staff & permissions easily', color: 'from-info to-blue-700' },
  ]

  return (
    <div className="min-h-screen flex bg-bg overflow-hidden">
      {/* Left visual panel */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b1a0f] via-[#1a120b] to-bg" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.2), transparent 40%)',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-4xl text-secondary-light shadow-glow mb-6"
            >
              <GiCoffeeCup />
            </motion.div>
            <h1 className="text-4xl font-bold font-display text-white">Coffee House</h1>
            <p className="text-secondary-light font-semibold tracking-wide mt-1">POS System</p>

            <h2 className="text-3xl font-bold font-display text-white mt-10">
              {isRTL ? 'مرحبا بك مجددا!' : 'Welcome back!'}
            </h2>
            <p className="text-txt-secondary mt-2 max-w-sm">
              {isRTL ? 'قم بتسجيل الدخول للوصول إلى لوحة التحكم' : 'Sign in to access your control panel'}
            </p>

            <div className="mt-10 space-y-4 max-w-sm">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3.5"
                >
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white text-lg shrink-0 shadow-lg`}>
                    <f.icon />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-txt-secondary text-xs mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 max-w-sm"
          >
            <p className="text-white/90 text-sm italic leading-relaxed">
              {isRTL
                ? '"النجاح ليس صدفة، بل هو نتيجة إدارة ذكية وتخطيط منظم."'
                : '"Success is not an accident. It is smart management and organized planning."'}
            </p>
            <p className="text-secondary-light text-xs font-semibold mt-2">— {isRTL ? 'فريق Coffee House' : 'Coffee House Team'}</p>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10">
        <div className="flex justify-end">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 text-sm text-txt-secondary hover:text-txt bg-bg-card border border-border rounded-lg px-4 py-2 transition-colors"
          >
            <FiGlobe size={15} />
            {isRTL ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md card p-8 shadow-lift"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-xl">
                <FiLogIn />
              </div>
              <h2 className="text-2xl font-bold font-display text-txt">{isRTL ? 'تسجيل الدخول' : 'Sign In'}</h2>
            </div>
            <p className="text-sm text-txt-secondary mb-7">
              {isRTL ? 'أدخل بياناتك لتسجيل الدخول إلى النظام' : 'Enter your details to access the system'}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <FiMail className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                  <input
                    type="email"
                    placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter your email'}
                    className={`input-base ps-10 ${errors.email ? 'border-danger' : ''}`}
                    {...register('email', { required: true })}
                  />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required'}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <FiLock className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                    className={`input-base ps-10 pe-10 ${errors.password ? 'border-danger' : ''}`}
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt"
                  >
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-txt-secondary cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary-600" />
                  {isRTL ? 'تذكرني' : 'Remember me'}
                </label>
                <button type="button" className="text-primary-400 hover:text-primary-300 font-medium">
                  {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading} icon={FiLogIn} iconPosition="start">
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </Button>

              <div className="flex items-center gap-3 py-1">
                <span className="flex-1 h-px bg-border" />
                <span className="text-xs text-txt-muted">{isRTL ? 'أو' : 'or'}</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              <Button type="button" variant="dark" fullWidth icon={FiShield} onClick={handleSubmit(onSubmit)}>
                {isRTL ? 'تسجيل دخول الموظف' : 'Employee Sign In'}
              </Button>
            </form>

            <p className="text-center text-sm text-txt-muted mt-6">
              {isRTL ? 'ليست لديك حساب؟' : "Don't have an account?"}{' '}
              <button className="text-primary-400 hover:text-primary-300 font-medium">
                {isRTL ? 'تواصل مع المشرف' : 'Contact admin'}
              </button>
            </p>
          </motion.div>
        </div>

        <p className="text-center text-xs text-txt-muted">
          © 2026 Coffee House POS System. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </p>
      </div>
    </div>
  )
}
