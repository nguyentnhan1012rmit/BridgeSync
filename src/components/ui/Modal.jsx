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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 150ms ease' }}
      />

      {/* Panel */}
      <div
        className="relative w-full bg-surface-raised rounded-2xl border border-border
          shadow-xl overflow-hidden"
        style={{ maxWidth: resolvedWidth, animation: 'slideUp 250ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-alt/30">
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-alt transition-colors cursor-pointer text-text-muted hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
