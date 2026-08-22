import { Navigate } from 'react-router-dom'
import FullScreenLoader from '../components/common/FullScreenLoader'
import { useAuth } from '../hooks/useAuth'

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default PublicRoute
