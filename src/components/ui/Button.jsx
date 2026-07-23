import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-to-tr from-primary-700 to-primary-500 text-white shadow-glow hover:brightness-110',
  secondary: 'bg-gradient-to-tr from-secondary-dark to-secondary text-white shadow-glow-orange hover:brightness-110',
  success: 'bg-success text-white hover:brightness-110',
  danger: 'bg-danger text-white hover:brightness-110',
  outline: 'bg-transparent border border-border text-txt hover:border-primary-500 hover:text-primary-300',
  ghost: 'bg-transparent text-txt-secondary hover:bg-bg-hover hover:text-txt',
  dark: 'bg-bg-sidebar border border-border text-txt hover:border-border-light',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`btn ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'start' && <Icon className="shrink-0" />}
          {children}
          {Icon && iconPosition === 'end' && <Icon className="shrink-0" />}
        </>
      )}
    </motion.button>
  )
}
