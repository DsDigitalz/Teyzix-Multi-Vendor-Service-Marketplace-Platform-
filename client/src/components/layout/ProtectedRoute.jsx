import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Redirects map — where each role goes after login
export const ROLE_HOME = {
  customer: '/dashboard/customer',
  provider: '/dashboard/provider',
  admin: '/dashboard/admin',
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Still checking localStorage on first mount — show nothing yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
      </div>
    )
  }

  // Not logged in — send to login, remember where they were trying to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return children
}