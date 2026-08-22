import { Navigate, useLocation } from 'react-router-dom'
import FullScreenLoader from '../components/common/FullScreenLoader'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/" replace state={{ from: location }} />
  return children
}

export default ProtectedRoute
