import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

// Maps the real User model (name, email, role: 'admin'|'cashier', isActive)
// onto what Sidebar/Navbar already render (name, role, roleEn).
function normalizeUser(raw) {
  if (!raw) return null
  const roleEn = raw.role === 'admin' ? 'Admin' : raw.role === 'cashier' ? 'Cashier' : raw.role
  const roleAr = raw.role === 'admin' ? 'مدير النظام' : raw.role === 'cashier' ? 'كاشير' : raw.role
  return {
    id: raw._id ?? raw.id,
    name: raw.name,
    email: raw.email,
    role: roleAr,
    roleEn,
    rawRole: raw.role,
    isActive: raw.isActive,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)

  // No /auth/me endpoint exists, so the session is rehydrated on refresh from
  // the real login response that was cached locally at login time.
  useEffect(() => {
    const stored = authApi.getStoredUser()
    if (stored) setUser(normalizeUser(stored))
    setBootstrapping(false)
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await authApi.login(email, password)
      const normalized = normalizeUser(data)
      setUser(normalized)
      return normalized
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, bootstrapping, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
