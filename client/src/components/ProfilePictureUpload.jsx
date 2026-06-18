import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { uploadProfilePicture } from '../api/services'

export default function ProfilePictureUpload({ currentPic, userName, onSuccess }) {
  const [preview,    setPreview]    = useState(currentPic || null)
  const [uploading,  setUploading]  = useState(false)
  const [dragOver,   setDragOver]   = useState(false)
  const inputRef = useRef(null)

  const MAX_SIZE = 2 * 1024 * 1024  // 2MB

  const processFile = async (file) => {
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed')
      return
    }

    if (file.size > MAX_SIZE) {
      toast.error('Image must be under 2MB')
      return
    }

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to Cloudinary via backend
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('profilePic', file)

      const { data } = await uploadProfilePicture(formData)
      onSuccess?.(data.profilePic)
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
      setPreview(currentPic || null)  // revert preview on failure
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar preview */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center ring-4 ring-white shadow-md">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover"/>
          ) : (
            <span className="text-blue-600 font-bold text-3xl">
              {userName?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        )}

        {/* Camera button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700
                     rounded-full flex items-center justify-center shadow-md
                     transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-xs border-2 border-dashed rounded-xl p-4 text-center
          cursor-pointer transition-colors
          ${dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <p className="text-sm text-gray-500">
          {uploading ? 'Uploading...' : 'Drop image here or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 2MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}