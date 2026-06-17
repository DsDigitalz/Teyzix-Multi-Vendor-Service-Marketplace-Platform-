import { STATUS_FLOW } from '../../utils/constants'

export default function StatusStepper({ currentStatus, isCancelled = false }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus)

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-sm font-medium text-red-600">Request Cancelled</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center w-full">
        {STATUS_FLOW.map((step, idx) => {
          const done    = idx < currentIdx
          const active  = idx === currentIdx
          const pending = idx > currentIdx

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all
                  ${done   ? 'bg-blue-600 border-blue-600'          : ''}
                  ${active ? 'bg-white border-blue-600 ring-4 ring-blue-100' : ''}
                  ${pending ? 'bg-white border-gray-200'             : ''}
                `}>
                  {done ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-xs font-bold ${active ? 'text-blue-600' : 'text-gray-300'}`}>
                      {idx + 1}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${
                  done || active ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {idx < STATUS_FLOW.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${
                  done ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex sm:hidden flex-col gap-2">
        {STATUS_FLOW.map((step, idx) => {
          const done   = idx < currentIdx
          const active = idx === currentIdx

          return (
            <div key={step} className="flex items-center gap-3">
              <div className={`
                w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2
                ${done   ? 'bg-blue-600 border-blue-600' : ''}
                ${active ? 'bg-white border-blue-600'    : ''}
                ${!done && !active ? 'bg-white border-gray-200' : ''}
              `}>
                {done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${active ? 'font-semibold text-blue-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                {step}
              </span>
              {active && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Current
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}