import { useState } from 'react'
import toast from 'react-hot-toast'
import { submitReview } from '../api/services'
import StarRating from './ui/StarRating'
import Button from './ui/Button'

export default function ReviewForm({ requestId, onSuccess }) {
  const [rating,   setRating]   = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [hovering, setHovering] = useState(0)

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return toast.error('Please select a rating')

    setLoading(true)
    try {
      await submitReview({ requestId, rating, feedback })
      toast.success('Review submitted!')
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Interactive star picker */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovering(star)}
              onMouseLeave={() => setHovering(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <svg className="w-8 h-8" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  fill={(hovering || rating) >= star ? '#FBBF24' : '#E5E7EB'}
                />
              </svg>
            </button>
          ))}
          {(hovering || rating) > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-600">
              {LABELS[hovering || rating]}
            </span>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Feedback <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience with this provider..."
          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Button type="submit" loading={loading} disabled={rating === 0}>
        Submit Review
      </Button>
    </form>
  )
}