import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth()
  // Wait for the token-rehydration check to finish before deciding to redirect,
  // otherwise a hard refresh on a protected page would briefly bounce to /login.
  if (bootstrapping) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
