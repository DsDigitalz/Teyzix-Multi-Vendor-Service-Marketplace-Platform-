export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Graphic Design',
  'Logo Design',
  'Content Writing',
  'Copywriting',
  'Social Media Management',
  'Digital Marketing',
  'SEO',
  'Video Editing',
  'Photography',
  'Data Analysis',
  'Other',
]

export const CATEGORY_ICONS = {
  'Web Development':        '💻',
  'Mobile Development':     '📱',
  'Graphic Design':         '🎨',
  'Logo Design':            '✏️',
  'Content Writing':        '📝',
  'Copywriting':            '🖊️',
  'Social Media Management':'📣',
  'Digital Marketing':      '📈',
  'SEO':                    '🔍',
  'Video Editing':          '🎬',
  'Photography':            '📷',
  'Data Analysis':          '📊',
  'Other':                  '⚡',
}

export const STATUS_FLOW = [
  'Pending',
  'Accepted',
  'In Progress',
  'Completed',
  'Delivered',
]

export const STATUS_COLORS = {
  Pending:       'bg-yellow-100 text-yellow-800 border-yellow-200',
  Accepted:      'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
  Completed:     'bg-green-100 text-green-800 border-green-200',
  Delivered:     'bg-emerald-100 text-emerald-800 border-emerald-200',
}

// Formats a number as Nigerian Naira
export const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)

// e.g. "Jun 15, 2026"
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  })