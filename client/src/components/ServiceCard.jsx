import { Link } from 'react-router-dom'
import Badge from './ui/Badge'
import StarRating from './ui/StarRating'
import { CATEGORY_ICONS, formatNaira } from '../utils/constants'

export default function ServiceCard({ listing }) {
  const {
    _id,
    title,
    description,
    category,
    price,
    deliveryTime,
    coverImage,
    provider,
    providerProfile,
  } = listing

  const rating      = providerProfile?.averageRating || 0
  const totalReviews = providerProfile?.totalReviews  || 0
  const providerName = provider?.name || 'Unknown'
  const avatar       = providerProfile?.profilePic || provider?.profilePic

  return (
    <Link
      to={`/services/${_id}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-200
                 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden"
    >
      {/* Cover */}
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">{CATEGORY_ICONS[category] || '⚡'}</span>
            <span className="text-xs text-indigo-400 font-medium">{category}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <Badge label={category} className="self-start mb-2" />

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1
                       group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">
          {description}
        </p>

        <div className="flex items-center gap-1 mb-3">
          <StarRating rating={rating} size="sm" showValue />
          {totalReviews > 0 && (
            <span className="text-xs text-gray-400">({totalReviews})</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 min-w-0">
            {avatar ? (
              <img src={avatar} alt={providerName}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-xs font-bold">
                  {providerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-600 truncate">{providerName}</span>
          </div>

          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-sm font-bold text-gray-900">{formatNaira(price)}</p>
            <p className="text-xs text-gray-400">{deliveryTime}d delivery</p>
          </div>
        </div>
      </div>
    </Link>
  )
}