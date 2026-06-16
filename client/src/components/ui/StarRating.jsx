export default function StarRating({
  rating = 0,
  max = 5,
  size = 'sm',
  showValue = true,
  interactive = false,
  onChange,
}) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-6 h-6' }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const partial = !filled && i < rating

          return (
            <svg
              key={i}
              onClick={() => interactive && onChange?.(i + 1)}
              className={`
                ${sizes[size]} flex-shrink-0 transition-transform
                ${interactive ? 'cursor-pointer hover:scale-110' : ''}
              `}
              viewBox="0 0 20 20"
              fill="none"
            >
              {partial && (
                <defs>
                  <linearGradient id={`g-${i}`}>
                    <stop offset={`${(rating % 1) * 100}%`} stopColor="#FBBF24" />
                    <stop offset={`${(rating % 1) * 100}%`} stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={filled ? '#FBBF24' : partial ? `url(#g-${i})` : '#E5E7EB'}
              />
            </svg>
          )
        })}
      </div>
      {showValue && (
        <span className="text-xs text-gray-500 font-medium tabular-nums">
          {rating > 0 ? rating.toFixed(1) : 'No reviews'}
        </span>
      )}
    </div>
  )
}