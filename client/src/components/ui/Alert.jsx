const variants = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
}

export default function Alert({ type = 'error', message }) {
  if (!message) return null
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${variants[type]}`}>
      {message}
    </div>
  )
}