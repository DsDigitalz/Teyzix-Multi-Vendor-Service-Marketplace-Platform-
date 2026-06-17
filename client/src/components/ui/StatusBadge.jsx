const CONFIG = {
  Pending:       { color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-500',  label: 'Pending'      },
  Accepted:      { color: 'bg-blue-100 text-blue-800 border-blue-200',        dot: 'bg-blue-500',    label: 'Accepted'     },
  'In Progress': { color: 'bg-purple-100 text-purple-800 border-purple-200',  dot: 'bg-purple-500',  label: 'In Progress'  },
  Completed:     { color: 'bg-green-100 text-green-800 border-green-200',     dot: 'bg-green-500',   label: 'Completed'    },
  Delivered:     { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: 'Delivered'  },
  Cancelled:     { color: 'bg-red-100 text-red-800 border-red-200',           dot: 'bg-red-500',     label: 'Cancelled'    },
}

export default function StatusBadge({ status, showDot = true, className = '' }) {
  const cfg = CONFIG[status] || CONFIG.Pending

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
      ${cfg.color} ${className}
    `}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      )}
      {cfg.label}
    </span>
  )
}