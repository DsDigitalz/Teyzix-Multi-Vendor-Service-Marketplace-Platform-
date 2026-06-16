const colors = {
  Pending:     'bg-yellow-100 text-yellow-800',
  Accepted:    'bg-blue-100 text-blue-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  Completed:   'bg-green-100 text-green-800',
  Delivered:   'bg-emerald-100 text-emerald-800',
  customer:    'bg-sky-100 text-sky-800',
  provider:    'bg-violet-100 text-violet-800',
  admin:       'bg-red-100 text-red-800',
  default:     'bg-gray-100 text-gray-700',
}

export default function Badge({ label, className = '' }) {
  const color = colors[label] || colors.default
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      {label}
    </span>
  )
}