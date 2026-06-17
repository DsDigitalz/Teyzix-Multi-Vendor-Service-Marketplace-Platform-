import { useState } from 'react'
import { formatNaira, formatDate } from '../utils/constants'
import StatusBadge   from './ui/StatusBadge'
import StatusStepper from './ui/StatusStepper'
import ReviewForm    from './ReviewForm'
import Button        from './ui/Button'

export default function RequestCard({
  request,
  viewAs,           // 'customer' | 'provider'
  onStatusUpdate,   // provider only
  onCancel,
  onRefresh,
}) {
  const [expanded,    setExpanded]    = useState(false)
  const [showReview,  setShowReview]  = useState(false)
  const [updating,    setUpdating]    = useState(false)

  const {
    _id, listing, customer, provider,
    requirements, budget, deadline,
    status, statusHistory, isCancelled, isReviewed,
    deliveryNote,
  } = request

  const canReview  = viewAs === 'customer' && status === 'Delivered' && !isReviewed && !isCancelled
  const canCancel  = !isCancelled && status !== 'Delivered' && status !== 'Completed'

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await onStatusUpdate?.(_id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  // Next status the provider can move to
  const STATUS_FLOW = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered']
  const currentIdx  = STATUS_FLOW.indexOf(status)
  const nextStatus  = STATUS_FLOW[currentIdx + 1]

  const nextStatusLabel = {
    Accepted:      'Accept Request',
    'In Progress': 'Start Work',
    Completed:     'Mark Completed',
    Delivered:     'Mark Delivered',
  }

  return (
    <div className={`
      bg-white rounded-xl border transition-all
      ${isCancelled ? 'border-red-100 opacity-75' : 'border-gray-200 hover:border-gray-300'}
    `}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge status={isCancelled ? 'Cancelled' : status} />
              {listing?.category && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {listing.category}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {listing?.title || 'Service Request'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {viewAs === 'customer'
                ? `Provider: ${provider?.name || '—'}`
                : `Customer: ${customer?.name || '—'}`}
              {' · '}Deadline: {formatDate(deadline)}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold text-gray-900">{formatNaira(budget)}</p>
            <p className="text-xs text-gray-400">Budget</p>
          </div>
        </div>

        {/* Requirements preview */}
        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {requirements}
        </p>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {expanded ? 'Hide details ↑' : 'Show details ↓'}
          </button>

          <div className="flex items-center gap-2">
            {canCancel && (
              <Button
                variant="ghost" size="sm"
                onClick={() => onCancel?.(_id)}
                className="text-red-500 hover:bg-red-50 text-xs"
              >
                Cancel
              </Button>
            )}

            {/* Provider: next status button */}
            {viewAs === 'provider' && !isCancelled && nextStatus && (
              <Button
                size="sm"
                loading={updating}
                onClick={() => handleStatusUpdate(nextStatus)}
              >
                {nextStatusLabel[nextStatus] || `Move to ${nextStatus}`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">

          {/* Status stepper */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Progress
            </p>
            <StatusStepper currentStatus={status} isCancelled={isCancelled} />
          </div>

          {/* Full requirements */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Requirements
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{requirements}</p>
          </div>

          {/* Delivery note */}
          {deliveryNote && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">Delivery Note</p>
              <p className="text-sm text-green-700 leading-relaxed">{deliveryNote}</p>
            </div>
          )}

          {/* Status history timeline */}
          {statusHistory?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Activity
              </p>
              <div className="space-y-2">
                {[...statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-gray-700">{h.status}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatDate(h.changedAt)}</span>
                      {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review section */}
          {canReview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Leave a Review</p>
                  <p className="text-xs text-gray-500">Help others by rating this provider</p>
                </div>
                <span className="text-xl">⭐</span>
              </div>
              {showReview ? (
                <ReviewForm
                  requestId={_id}
                  onSuccess={() => { setShowReview(false); onRefresh?.() }}
                />
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowReview(true)}>
                  Write a Review
                </Button>
              )}
            </div>
          )}

          {isReviewed && viewAs === 'customer' && (
            <p className="text-xs text-gray-400 italic">✓ You've reviewed this project</p>
          )}
        </div>
      )}
    </div>
  )
}