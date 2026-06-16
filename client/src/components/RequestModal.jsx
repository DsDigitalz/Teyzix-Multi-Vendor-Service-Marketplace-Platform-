import { useState, useEffect, useRef } from 'react'
import { useNavigate }   from 'react-router-dom'
import { useAuth }       from '../context/AuthContext'
import { submitRequest } from '../api/services'
import { formatNaira }   from '../utils/constants'
import Button from './ui/Button'
import Input  from './ui/Input'
import toast  from 'react-hot-toast'

export default function RequestModal({ listing, onClose }) {
  const { isAuthenticated, isCustomer } = useAuth()
  const navigate   = useNavigate()
  const overlayRef = useRef(null)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const [form, setForm] = useState({
    requirements: '',
    budget:       listing?.price ?? '',
    deadline:     '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Lock body scroll + Escape to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const validate = () => {
    const e = {}
    if (!form.requirements.trim())
      e.requirements = 'Please describe what you need'
    else if (form.requirements.trim().length < 20)
      e.requirements = 'At least 20 characters required'
    if (!form.budget && form.budget !== 0)
      e.budget = 'Budget is required'
    else if (Number(form.budget) < 0)
      e.budget = 'Budget cannot be negative'
    if (!form.deadline)
      e.deadline = 'Please set a deadline'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login')
    if (!isCustomer) return toast.error('Only customers can submit requests')

    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      await submitRequest({
        listingId:    listing._id,
        requirements: form.requirements,
        budget:       Number(form.budget),
        deadline:     new Date(form.deadline).toISOString(),
      })
      setSuccess(true)
      toast.success('Request submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl
                      max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between
                        px-6 py-4 border-b border-gray-100 z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Submit a Request</h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{listing?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {success ? (
            /* ── Success state ── */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Request Submitted!</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Your request has been sent. You'll see it in your dashboard once the provider responds.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={() => navigate('/dashboard/customer/requests')}>
                  View My Requests
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Listing summary pill */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center
                                justify-center text-blue-600 font-bold text-base flex-shrink-0">
                  {listing?.title?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{listing?.title}</p>
                  <p className="text-xs text-gray-500">
                    From {formatNaira(listing?.price)} · {listing?.deliveryTime}d delivery
                  </p>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Describe your requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your project in detail — goals, style preferences, target audience, examples you like, specific features needed..."
                  className={`
                    w-full px-3 py-2.5 rounded-lg border text-sm resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors placeholder:text-gray-400
                    ${errors.requirements ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}
                  `}
                />
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${errors.requirements ? 'text-red-600' : 'text-transparent'}`}>
                    {errors.requirements || '.'}
                  </p>
                  <p className={`text-xs ${form.requirements.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {form.requirements.length}/2000
                  </p>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Your Budget (NGN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold select-none">
                    ₦
                  </span>
                  <input
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    min="0"
                    placeholder="50000"
                    className={`
                      w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors
                      ${errors.budget ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}
                    `}
                  />
                </div>
                {errors.budget
                  ? <p className="text-xs text-red-600">{errors.budget}</p>
                  : <p className="text-xs text-gray-400">
                      Provider's starting price: {formatNaira(listing?.price)}
                    </p>
                }
              </div>

              {/* Deadline */}
              <Input
                label="Project Deadline *"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                min={minDate}
                error={errors.deadline}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" type="button" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Submit Request
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}