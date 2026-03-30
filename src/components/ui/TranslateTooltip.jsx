import { useState, useRef, useEffect } from 'react'

export default function TranslateTooltip({
  children,
  term,
  translations = {},
  className = '',
}) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
    }
  }, [visible])

  const hasTranslations = Object.keys(translations).length > 0

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        className={`
          border-b-2 border-dashed border-accent cursor-help
          text-accent-dark font-medium
          hover:text-accent hover:border-accent-light
          transition-colors duration-[var(--duration-fast)]
          ${className}
        `}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>

      {visible && hasTranslations && (
        <span
          className="
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
            block bg-surface-dark text-text-inverse rounded-lg shadow-lg
            px-4 py-3 min-w-[200px] max-w-[320px]
          "
          role="tooltip"
        >
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 block w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-surface-dark" />

          <span className="block text-xs text-text-inverse/60 uppercase tracking-wider mb-2 font-medium">
            {term}
          </span>

          <span className="block space-y-1.5">
            {translations.en && (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">EN</span>
                <span>{translations.en}</span>
              </span>
            )}
            {translations.vi && (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">VI</span>
                <span>{translations.vi}</span>
              </span>
            )}
            {translations.ja && (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">JP</span>
                <span>{translations.ja}</span>
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  )
}
