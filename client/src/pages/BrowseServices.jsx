import { useState, useEffect, useCallback } from 'react'
import { fetchListings } from '../api/services'
import { CATEGORIES }    from '../utils/constants'
import ServiceCard from '../components/ServiceCard'
import { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState        from '../components/ui/EmptyState'
import Button            from '../components/ui/Button'

export default function BrowseServices() {
  const [listings,    setListings]    = useState([])
  const [pagination,  setPagination]  = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  // Search: input is what the user types, query is what's actually sent
  const [input,    setInput]    = useState('')
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('')
  const [page,     setPage]     = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: 9 }
      if (query)    params.q        = query
      if (category) params.category = category

      const { data } = await fetchListings(params)
      setListings(data.listings)
      setPagination(data.pagination)
    } catch {
      setError('Failed to load services. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [query, category, page])

  useEffect(() => { load() }, [load])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [query, category])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(input.trim())
  }

  const clearAll = () => {
    setInput('')
    setQuery('')
    setCategory('')
    setPage(1)
  }

  const hasFilters = query || category

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Services</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Find trusted professionals for your next project
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search services, skills, keywords..."
            className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {input && (
            <button
              type="button"
              onClick={() => { setInput(''); setQuery('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <Button type="submit" className="px-5">Search</Button>
      </form>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory('')}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
            ${!category
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}
          `}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(prev => prev === cat ? '' : cat)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
              ${category === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Showing results for:</span>
          {query && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700
                             text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
              "{query}"
              <button onClick={() => { setInput(''); setQuery('') }} className="hover:text-blue-900 ml-0.5">×</button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700
                             text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
              {category}
              <button onClick={() => setCategory('')} className="hover:text-blue-900 ml-0.5">×</button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-700 underline ml-1">
            Clear all
          </button>
        </div>
      )}

      {/* Result count */}
      {!loading && pagination && (
        <p className="text-xs text-gray-500">
          {pagination.total} service{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200
                        rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={load} className="text-red-600 font-medium hover:underline text-xs ml-4">
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No services found"
          description={
            hasFilters
              ? 'Try adjusting your search or clearing filters'
              : 'No services have been listed yet. Check back soon.'
          }
          action={
            hasFilters && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <ServiceCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline" size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </Button>
          <span className="text-sm text-gray-500 tabular-nums">
            {pagination.page} / {pagination.pages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}