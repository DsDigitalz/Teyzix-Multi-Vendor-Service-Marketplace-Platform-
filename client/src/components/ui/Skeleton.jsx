export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonDetailPage() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-24 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-7 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: i === 3 ? '60%' : '100%' }} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}