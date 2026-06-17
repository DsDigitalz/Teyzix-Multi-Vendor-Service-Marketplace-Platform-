import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth }        from '../../context/AuthContext'
import { fetchMyRequests, cancelRequest, updateMyProfile } from '../../api/services'
import { formatNaira }    from '../../utils/constants'
import RequestCard        from '../../components/RequestCard'
import StatusBadge        from '../../components/ui/StatusBadge'
import Button             from '../../components/ui/Button'
import Input              from '../../components/ui/Input'

const TABS = ['Overview', 'Active Requests', 'Completed', 'Profile']

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth()

  const [tab,      setTab]      = useState('Overview')
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)

  // Profile edit state
  const [profileForm,   setProfileForm]   = useState({ name: user?.name || '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await fetchMyRequests()
      setRequests(data.requests)
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return
    try {
      await cancelRequest(id, { reason: 'Cancelled by customer' })
      toast.success('Request cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateMyProfile({ name: profileForm.name })
      updateUser({ name: profileForm.name })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // Derived data
  const active    = requests.filter(r => !r.isCancelled && !['Delivered'].includes(r.status))
  const completed = requests.filter(r => r.status === 'Delivered' || r.isCancelled)
  const totalSpent = requests
    .filter(r => r.status === 'Delivered')
    .reduce((sum, r) => sum + r.budget, 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Customer Dashboard</p>
        </div>
        <Button onClick={() => window.location.href = '/services'}>
          + Browse Services
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                px-4 pb-3 pt-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              {t}
              {t === 'Active Requests' && active.length > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                  {active.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Overview tab ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests',  value: requests.length,  icon: '📋', color: 'blue'   },
              { label: 'Active',          value: active.length,    icon: '🔄', color: 'purple' },
              { label: 'Completed',       value: completed.filter(r => !r.isCancelled).length, icon: '✅', color: 'green' },
              { label: 'Total Spent',     value: formatNaira(totalSpent), icon: '💰', color: 'amber' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{s.icon}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Recent Requests</h2>
              <button
                onClick={() => setTab('Active Requests')}
                className="text-xs text-blue-600 hover:underline"
              >
                View all →
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-12 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-medium text-gray-700">No requests yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Browse services and submit your first request</p>
                <Button size="sm" onClick={() => window.location.href = '/services'}>
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map(r => (
                  <div key={r._id}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {r.listing?.title || 'Request'}
                      </p>
                      <p className="text-xs text-gray-400">{r.provider?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={r.isCancelled ? 'Cancelled' : r.status} />
                      <span className="text-sm font-semibold text-gray-800">
                        {formatNaira(r.budget)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active Requests tab ── */}
      {tab === 'Active Requests' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{active.length} active request{active.length !== 1 ? 's' : ''}</p>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : active.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-medium text-gray-700">No active requests</p>
              <p className="text-sm text-gray-400 mt-1">All caught up!</p>
            </div>
          ) : (
            active.map(r => (
              <RequestCard
                key={r._id}
                request={r}
                viewAs="customer"
                onCancel={handleCancel}
                onRefresh={load}
              />
            ))
          )}
        </div>
      )}

      {/* ── Completed tab ── */}
      {tab === 'Completed' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {completed.filter(r => !r.isCancelled).length} completed project{completed.length !== 1 ? 's' : ''}
          </p>
          {completed.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-3xl mb-2">📦</p>
              <p className="font-medium text-gray-700">No completed projects yet</p>
            </div>
          ) : (
            completed.map(r => (
              <RequestCard
                key={r._id}
                request={r}
                viewAs="customer"
                onCancel={handleCancel}
                onRefresh={load}
              />
            ))
          )}
        </div>
      )}

      {/* ── Profile tab ── */}
      {tab === 'Profile' && (
        <div className="max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <StatusBadge status="Pending" showDot={false} className="mt-1 bg-sky-100 text-sky-700 border-sky-200">
                  Customer
                </StatusBadge>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <Button type="submit" loading={savingProfile} className="w-full">
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}