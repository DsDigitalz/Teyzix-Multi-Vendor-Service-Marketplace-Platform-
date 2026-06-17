import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth }      from '../../context/AuthContext'
import {
  fetchMyRequests,
  updateStatus,
  cancelRequest,
  fetchMyListings,
  fetchMyProfile,
  updateMyProfile,
  deleteListing,
} from '../../api/services'
import { formatNaira, formatDate } from '../../utils/constants'
import RequestCard  from '../../components/RequestCard'
import StatusBadge  from '../../components/ui/StatusBadge'
import Button       from '../../components/ui/Button'
import Input        from '../../components/ui/Input'
import { Link }     from 'react-router-dom'

const TABS = ['Overview', 'Pending', 'Active Projects', 'My Listings', 'Profile']

export default function ProviderDashboard() {
  const { user, updateUser } = useAuth()

  const [tab,       setTab]       = useState('Overview')
  const [requests,  setRequests]  = useState([])
  const [listings,  setListings]  = useState([])
  const [profile,   setProfile]   = useState(null)
  const [loading,   setLoading]   = useState(true)

  const [profileForm,   setProfileForm]   = useState({
    bio: '', skills: '', isAvailable: true,
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const loadRequests = useCallback(async () => {
    try {
      const { data } = await fetchMyRequests()
      setRequests(data.requests)
    } catch {
      toast.error('Failed to load requests')
    }
  }, [])

  const loadListings = useCallback(async () => {
    try {
      const { data } = await fetchMyListings()
      setListings(data.listings)
    } catch {}
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await fetchMyProfile()
      setProfile(data.profile)
      setProfileForm({
        bio:         data.profile.bio || '',
        skills:      (data.profile.skills || []).join(', '),
        isAvailable: data.profile.isAvailable,
      })
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([loadRequests(), loadListings(), loadProfile()])
      .finally(() => setLoading(false))
  }, [loadRequests, loadListings, loadProfile])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateStatus(id, { status: newStatus })
      toast.success(`Moved to ${newStatus}`)
      loadRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return
    try {
      await cancelRequest(id, { reason: 'Cancelled by provider' })
      toast.success('Request cancelled')
      loadRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await deleteListing(id)
      toast.success('Listing deleted')
      loadListings()
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const skillsArr = profileForm.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      await updateMyProfile({
        bio:         profileForm.bio,
        skills:      skillsArr,
        isAvailable: profileForm.isAvailable,
      })
      toast.success('Profile updated!')
      loadProfile()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // Derived data
  const pending  = requests.filter(r => r.status === 'Pending' && !r.isCancelled)
  const active   = requests.filter(r =>
    ['Accepted', 'In Progress', 'Completed'].includes(r.status) && !r.isCancelled
  )
  const delivered = requests.filter(r => r.status === 'Delivered' && !r.isCancelled)
  const totalEarnings = delivered.reduce((sum, r) => sum + r.budget, 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Provider Dashboard</p>
        </div>
        <Link to="/dashboard/provider/listings/new">
          <Button>+ Create Listing</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`
                px-4 pb-3 pt-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              {t}
              {t === 'Pending' && pending.length > 0 && (
                <span className="ml-1.5 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Overview tab ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">

          {/* Earnings + stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Earnings',    value: formatNaira(totalEarnings), icon: '💰', highlight: true },
              { label: 'Active Projects',   value: active.length,              icon: '🔄', highlight: false },
              { label: 'Pending Requests',  value: pending.length,             icon: '⏳', highlight: false },
              { label: 'Delivered',         value: delivered.length,           icon: '✅', highlight: false },
            ].map((s) => (
              <div key={s.label}
                className={`rounded-xl border p-4 ${
                  s.highlight ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
                }`}
              >
                <span className="text-xl">{s.icon}</span>
                <p className={`text-xl font-bold mt-2 ${s.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {s.value}
                </p>
                <p className={`text-xs mt-0.5 ${s.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Pending requests alert */}
          {pending.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="font-semibold text-yellow-900 text-sm">
                    {pending.length} request{pending.length > 1 ? 's' : ''} waiting for your response
                  </p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Accept or let customers know your availability
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setTab('Pending')}>
                Review Now
              </Button>
            </div>
          )}

          {/* Recent activity */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Recent Activity</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-12 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="font-medium text-gray-700">No requests yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Create a listing so customers can find you</p>
                <Button size="sm" onClick={() => setTab('My Listings')}>Manage Listings</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.slice(0, 5).map(r => (
                  <div key={r._id}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {r.listing?.title || 'Request'}
                      </p>
                      <p className="text-xs text-gray-400">{r.customer?.name} · {formatDate(r.deadline)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={r.isCancelled ? 'Cancelled' : r.status} />
                      <span className="text-sm font-bold text-gray-800">{formatNaira(r.budget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pending tab ── */}
      {tab === 'Pending' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {pending.length} pending request{pending.length !== 1 ? 's' : ''} — accept to start working
          </p>
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-medium text-gray-700">No pending requests</p>
            </div>
          ) : (
            pending.map(r => (
              <RequestCard
                key={r._id}
                request={r}
                viewAs="provider"
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
                onRefresh={loadRequests}
              />
            ))
          )}
        </div>
      )}

      {/* ── Active Projects tab ── */}
      {tab === 'Active Projects' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {active.length} project{active.length !== 1 ? 's' : ''} in progress
          </p>
          {active.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-3xl mb-2">🚀</p>
              <p className="font-medium text-gray-700">No active projects</p>
              <p className="text-sm text-gray-400 mt-1">Accept pending requests to get started</p>
            </div>
          ) : (
            active.map(r => (
              <RequestCard
                key={r._id}
                request={r}
                viewAs="provider"
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
                onRefresh={loadRequests}
              />
            ))
          )}
        </div>
      )}

      {/* ── My Listings tab ── */}
      {tab === 'My Listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
            <Link to="/dashboard/provider/listings/new">
              <Button size="sm">+ New Listing</Button>
            </Link>
          </div>
          {listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-3xl mb-2">📝</p>
              <p className="font-medium text-gray-700">No listings yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Create your first service listing</p>
              <Link to="/dashboard/provider/listings/new">
                <Button size="sm">Create Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l._id}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg
                                  flex items-center justify-center text-xl flex-shrink-0">
                    {l.coverImage
                      ? <img src={l.coverImage} alt="" className="w-full h-full object-cover rounded-lg"/>
                      : '💼'
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{l.title}</p>
                    <p className="text-xs text-gray-500">{l.category} · {formatNaira(l.price)} · {l.deliveryTime}d</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.totalOrders} order{l.totalOrders !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      l.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {l.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <Link to={`/dashboard/provider/listings/edit/${l._id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Button
                      variant="ghost" size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteListing(l._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Profile tab ── */}
      {tab === 'Profile' && (
        <div className="max-w-lg space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                {profile?.profilePic || user?.profilePic ? (
                  <img src={profile?.profilePic || user?.profilePic} alt=""
                    className="w-full h-full rounded-full object-cover"/>
                ) : (
                  <span className="text-blue-600 font-bold text-xl">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {profile && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    ★ {profile.averageRating?.toFixed(1) || '0.0'} · {profile.totalReviews} review{profile.totalReviews !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe your expertise and what makes you stand out..."
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Skills</label>
                <Input
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm(p => ({ ...p, skills: e.target.value }))}
                  placeholder="React, Node.js, Figma, Tailwind CSS"
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProfileForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    profileForm.isAvailable ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    profileForm.isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                  }`}/>
                </button>
                <label className="text-sm text-gray-700">
                  Available for new work
                </label>
              </div>

              <Button type="submit" loading={savingProfile} className="w-full">
                Save Profile
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}