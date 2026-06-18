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
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 rounded"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 bg-gray-200 rounded w-32 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: main content */}
        <div className="lg:col-span-2 space-y-7">
          {/* Cover image */}
          <div className="h-96 bg-gray-200 rounded-lg" />

          {/* Title */}
          <div className="h-8 bg-gray-200 rounded w-3/4" />

          {/* Description */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>

        {/* Right column: provider info */}
        <div className="space-y-4">
          {/* Provider card */}
          <div className="bg-gray-100 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-2 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>

          {/* Price and button */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
