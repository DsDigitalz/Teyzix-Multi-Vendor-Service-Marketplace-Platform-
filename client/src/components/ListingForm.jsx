import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import toast                   from 'react-hot-toast'
import { createListing, updateListing, fetchListingById } from '../api/services'
import { CATEGORIES }  from '../utils/constants'
import Button from './ui/Button'
import Input  from './ui/Input'

export default function ListingForm({ listingId }) {
  const navigate  = useNavigate()
  const isEditing = Boolean(listingId)

  const EMPTY = {
    title: '', description: '', category: '', price: '',
    deliveryTime: '', tags: '', isActive: true,
  }

  const [form,    setForm]    = useState(EMPTY)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching,setFetching]= useState(isEditing)

  // Load existing listing data when editing
  useEffect(() => {
    if (!isEditing) return
    ;(async () => {
      try {
        const { data } = await fetchListingById(listingId)
        const l = data.listing
        setForm({
          title:        l.title        || '',
          description:  l.description  || '',
          category:     l.category     || '',
          price:        l.price        || '',
          deliveryTime: l.deliveryTime || '',
          tags:         (l.tags || []).join(', '),
          isActive:     l.isActive ?? true,
        })
      } catch {
        toast.error('Failed to load listing')
        navigate('/dashboard/provider')
      } finally {
        setFetching(false)
      }
    })()
  }, [listingId, isEditing, navigate])

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    else if (form.title.length > 100) e.title   = 'Max 100 characters'
    if (!form.description.trim()) e.description = 'Description is required'
    else if (form.description.length < 20) e.description = 'At least 20 characters'
    if (!form.category)           e.category    = 'Select a category'
    if (!form.price)              e.price       = 'Price is required'
    else if (Number(form.price) < 0) e.price    = 'Price cannot be negative'
    if (!form.deliveryTime)       e.deliveryTime = 'Delivery time is required'
    else if (Number(form.deliveryTime) < 1) e.deliveryTime = 'At least 1 day'
    return e
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const payload = {
        title:        form.title.trim(),
        description:  form.description.trim(),
        category:     form.category,
        price:        Number(form.price),
        deliveryTime: Number(form.deliveryTime),
        tags: form.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        isActive: form.isActive,
      }

      if (isEditing) {
        await updateListing(listingId, payload)
        toast.success('Listing updated!')
      } else {
        await createListing(payload)
        toast.success('Listing created!')
      }

      navigate('/dashboard/provider')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save listing')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard/provider')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditing ? 'Update your service details' : 'Describe your service to attract customers'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-sm">Service Details</h2>

          {/* Title */}
          <Input
            label="Service Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Professional React Website for Your Business"
            error={errors.title}
          />
          <div className="flex justify-end -mt-4">
            <span className={`text-xs ${form.title.length > 90 ? 'text-orange-500' : 'text-gray-400'}`}>
              {form.title.length}/100
            </span>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`
                w-full px-3 py-2 rounded-lg border text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
                ${errors.category ? 'border-red-400' : 'border-gray-300'}
              `}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              maxLength={2000}
              placeholder="Describe exactly what you will deliver, your process, what the client needs to provide, and why they should hire you..."
              className={`
                w-full px-3 py-2.5 rounded-lg border text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors placeholder:text-gray-400
                ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}
              `}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-600">{errors.description || ''}</p>
              <span className={`text-xs ${form.description.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                {form.description.length}/2000
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Delivery */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-sm">Pricing & Delivery</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Starting Price (NGN) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold select-none">
                  ₦
                </span>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  placeholder="25000"
                  className={`
                    w-full pl-7 pr-3 py-2 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'}
                  `}
                />
              </div>
              {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
            </div>

            {/* Delivery time */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Delivery Time (days) *</label>
              <div className="relative">
                <input
                  type="number"
                  name="deliveryTime"
                  value={form.deliveryTime}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  placeholder="7"
                  className={`
                    w-full px-3 pr-12 py-2 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${errors.deliveryTime ? 'border-red-400 bg-red-50' : 'border-gray-300'}
                  `}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs select-none">
                  days
                </span>
              </div>
              {errors.deliveryTime && <p className="text-xs text-red-600">{errors.deliveryTime}</p>}
            </div>
          </div>
        </div>

        {/* Tags & Visibility */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-sm">Tags & Visibility</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <Input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="react, website, frontend, responsive"
            />
            <p className="text-xs text-gray-400">
              Separate with commas — helps customers find your service
            </p>
          </div>

          {/* Preview tags */}
          {form.tags.trim() && (
            <div className="flex flex-wrap gap-2">
              {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Active toggle — only for edit mode */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`
                  relative w-10 h-5 rounded-full transition-colors flex-shrink-0
                  ${form.isActive ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}
                `}/>
              </button>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {form.isActive ? 'Listing is active' : 'Listing is hidden'}
                </label>
                <p className="text-xs text-gray-400">
                  {form.isActive
                    ? 'Visible to customers on the browse page'
                    : 'Hidden from browse — only you can see it'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none sm:px-8"
            onClick={() => navigate('/dashboard/provider')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1 sm:flex-none sm:px-8"
          >
            {isEditing ? 'Save Changes' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  )
}