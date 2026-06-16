import { useState, useEffect }    from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchListingById }       from '../api/services'
import { useAuth }                from '../context/AuthContext'
import { formatNaira, CATEGORY_ICONS } from '../utils/constants'
import StarRating  from '../components/ui/StarRating'
import Badge       from '../components/ui/Badge'
import Button      from '../components/ui/Button'
import RequestModal from '../components/RequestModal'
import { SkeletonDetailPage } from '../components/ui/Skeleton'

export default function ServiceDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user, isAuthenticated, isCustomer } = useAuth()

  const [listing,   setListing]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchListingById(id)
        setListing(data.listing)
      } catch {
        setError('This service is unavailable or does not exist.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <SkeletonDetailPage />

  if (error || !listing) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Service not found</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Button variant="outline" onClick={() => navigate('/services')}>
          ← Back to Services
        </Button>
      </div>
    )
  }

  const {
    title, description, category, price, deliveryTime,
    coverImage, provider, providerProfile, tags,
  } = listing

  const isOwner    = user?._id === provider?._id
  const rating     = providerProfile?.averageRating || 0
  const reviews    = providerProfile?.totalReviews  || 0
  const avatar     = providerProfile?.profilePic || provider?.profilePic

  return (
    <>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 space-y-7">

            {/* Cover */}
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100
                            h-64 flex items-center justify-center">
              {coverImage
                ? <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                : <span className="text-7xl">{CATEGORY_ICONS[category] || '⚡'}</span>
              }
            </div>

            {/* Title block */}
            <div>
              <Badge label={category} className="mb-3" />
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{title}</h1>

              {/* Provider row */}
              <button
                onClick={() => navigate(`/providers/${provider?._id}`)}
                className="flex items-center gap-3 mt-4 group"
              >
                {avatar ? (
                  <img src={avatar} alt={provider?.name}
                    className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-base">
                      {provider?.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {provider?.name}
                  </p>
                  <StarRating rating={rating} size="sm" />
                </div>
              </button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">About this service</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Tags */}
            {tags?.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t}
                      className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Provider skills */}
            {providerProfile?.skills?.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-2">Provider Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {providerProfile.skills.map((s) => (
                    <span key={s}
                      className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                  Starting at
                </p>
                <p className="text-3xl font-bold text-gray-900">{formatNaira(price)}</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {deliveryTime} day{deliveryTime > 1 ? 's' : ''} delivery
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <StarRating rating={rating} size="sm" />
                  {reviews > 0 && (
                    <span className="text-xs text-gray-400">({reviews})</span>
                  )}
                </div>
              </div>

              <div className="pt-1">
                {isOwner ? (
                  <p className="text-center text-sm text-gray-400 italic py-2">This is your listing</p>
                ) : isCustomer ? (
                  <Button className="w-full" size="lg" onClick={() => setShowModal(true)}>
                    Submit a Request
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    className="w-full" size="lg"
                    onClick={() => navigate('/login', { state: { from: { pathname: `/services/${id}` } } })}
                  >
                    Login to Request
                  </Button>
                ) : (
                  <p className="text-center text-sm text-gray-400 italic py-2">
                    Providers cannot submit requests
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate(`/providers/${provider?._id}`)}
                className="w-full text-center text-sm text-blue-600 hover:underline"
              >
                View full profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RequestModal listing={listing} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}