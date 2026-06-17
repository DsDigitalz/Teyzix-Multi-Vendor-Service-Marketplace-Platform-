import { useState, useEffect } from 'react'
import { fetchAdminStats, fetchAllUsers } from '../../api/services'
import { formatDate } from '../../utils/constants'
import StatusBadge from '../../components/ui/StatusBadge'

const TABS = ['Stats', 'Users']

export default function AdminDashboard() {
  const [tab,     setTab]     = useState('Stats')
  const [stats,   setStats]   = useState(null)
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchAdminStats()
        setStats(data.stats)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  useEffect(() => {
    if (tab === 'Users') {
      fetchAllUsers().then(({ data }) => setUsers(data.users)).catch(() => {})
    }
  }, [tab])

  const STATUS_FLOW = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered']

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 pb-3 pt-1 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats tab */}
      {tab === 'Stats' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"/>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users',     value: stats.users.total,     icon: '👥' },
                  { label: 'Customers',        value: stats.users.customers, icon: '🛒' },
                  { label: 'Providers',        value: stats.users.providers, icon: '💼' },
                  { label: 'Active Listings',  value: stats.listings.total,  icon: '📋' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <span className="text-2xl">{s.icon}</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Requests by status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Requests by Status
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({stats.requests.total} total)
                  </span>
                </h2>
                <div className="space-y-3">
                  {STATUS_FLOW.map(s => {
                    const count = stats.requests.byStatus?.[s] || 0
                    const pct   = stats.requests.total > 0
                      ? Math.round((count / stats.requests.total) * 100)
                      : 0
                    return (
                      <div key={s}>
                        <div className="flex items-center justify-between mb-1">
                          <StatusBadge status={s} />
                          <span className="text-sm font-semibold text-gray-700">
                            {count} <span className="text-gray-400 font-normal text-xs">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews.total}</p>
                  <p className="text-sm text-gray-500">Total reviews on the platform</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Failed to load stats</p>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 'Users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Joined
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.role === 'admin'    ? 'bg-red-100 text-red-700'    :
                      u.role === 'provider' ? 'bg-violet-100 text-violet-700' :
                                             'bg-sky-100 text-sky-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {u.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  )
}