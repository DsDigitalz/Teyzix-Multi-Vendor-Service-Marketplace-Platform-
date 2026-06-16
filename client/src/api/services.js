import api from './axios'

// ── Listings ──────────────────────────────────────────────
export const fetchListings   = (params) => api.get('/services', { params })
export const fetchListingById = (id)    => api.get(`/services/${id}`)
export const fetchMyListings  = ()      => api.get('/services/provider/my-listings')
export const createListing    = (data)  => api.post('/services', data)
export const updateListing    = (id, data) => api.put(`/services/${id}`, data)
export const deleteListing    = (id)    => api.delete(`/services/${id}`)

// ── Provider profiles ─────────────────────────────────────
export const fetchProviderProfile = (userId) => api.get(`/providers/${userId}`)
export const fetchMyProfile       = ()        => api.get('/providers/profile/me')
export const updateMyProfile      = (data)    => api.put('/providers/profile/me', data)
export const uploadProfilePicture = (formData) =>
  api.put('/providers/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Requests ──────────────────────────────────────────────
export const submitRequest    = (data)      => api.post('/requests', data)
export const fetchMyRequests  = (params)    => api.get('/requests', { params })
export const fetchRequestById = (id)        => api.get(`/requests/${id}`)
export const updateStatus     = (id, data)  => api.patch(`/requests/${id}/status`, data)
export const cancelRequest    = (id, data)  => api.patch(`/requests/${id}/cancel`, data)

// ── Reviews ───────────────────────────────────────────────
export const submitReview         = (data)       => api.post('/reviews', data)
export const fetchProviderReviews = (providerId) => api.get(`/reviews/provider/${providerId}`)

// ── Admin ─────────────────────────────────────────────────
export const fetchAdminStats = ()       => api.get('/admin/stats')
export const fetchAllUsers   = (params) => api.get('/admin/users', { params })