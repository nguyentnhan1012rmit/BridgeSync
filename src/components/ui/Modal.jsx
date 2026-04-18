import { useEffect } from 'react'
import { X } from 'lucide-react'

const widthMap = {
  'max-w-sm': '24rem',
  'max-w-md': '28rem',
  'max-w-lg': '32rem',
  'max-w-xl': '36rem',
  'max-w-2xl': '42rem',
  'max-w-3xl': '48rem',
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const resolvedWidth = widthMap[maxWidth] || '32rem'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: 'fadeIn 120ms ease' }}
      />

      {/* Panel */}
      <div
        className="relative w-full bg-surface-raised rounded-xl border border-border
          shadow-xl overflow-hidden"
        style={{ maxWidth: resolvedWidth, animation: 'slideUp 200ms cubic-bezier(0.25, 0.1, 0.25, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-alt transition-colors cursor-pointer text-text-muted hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
