import { useAuth } from '../../context/AuthContext'

export default function ProviderDashboard() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
      <p className="text-gray-500 mt-1">Provider Dashboard — coming Day 6</p>
    </div>
  )
}