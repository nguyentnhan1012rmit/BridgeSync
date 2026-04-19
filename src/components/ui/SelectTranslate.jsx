import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Languages, Loader2, X, Sparkles } from 'lucide-react'
import { translateText } from '@/api/translate'

const LANG_LABELS = {
  en: { flag: '🇺🇸', label: 'English', code: 'EN' },
  vi: { flag: '🇻🇳', label: 'Tiếng Việt', code: 'VI' },
  ja: { flag: '🇯🇵', label: '日本語', code: 'JP' },
}

// Check if user is authenticated (has a token in localStorage)
const isAuthenticated = () => Boolean(localStorage.getItem('token'))

export default function SelectTranslate() {
  const [selectedText, setSelectedText] = useState('')
  const [buttonPos, setButtonPos] = useState(null)
  const [showPanel, setShowPanel] = useState(false)
  const [panelPos, setPanelPos] = useState(null)
  const [panelFlipped, setPanelFlipped] = useState(false) // true = render below
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const panelRef = useRef(null)
  const buttonRef = useRef(null)
  const selectionTimeout = useRef(null)
  const selectionRect = useRef(null) // store the bounding rect of the selection

  // ── Detect text selection ──
  const handleMouseUp = useCallback((e) => {
    // Only activate when user is logged in
    if (!isAuthenticated()) return

    // Don't trigger if clicking inside our own panel or button
    if (panelRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return

    // Small delay so the browser finalizes selection
    clearTimeout(selectionTimeout.current)
    selectionTimeout.current = setTimeout(() => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text && text.length >= 2 && text.length <= 500) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        selectionRect.current = rect

        // Decide: show button above or below?
        const spaceAbove = rect.top
        const btnAbove = spaceAbove > 50

        setSelectedText(text)
        setButtonPos({
          // Use fixed positioning (viewport-relative)
          top: btnAbove ? rect.top - 44 : rect.bottom + 8,
          left: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
        })
        setShowPanel(false)
        setResults({})
        setError('')
      } else if (!showPanel) {
        setButtonPos(null)
        setSelectedText('')
      }
    }, 80)
  }, [showPanel])

  // ── Close everything on clicks outside ──
  const handleClickOutside = useCallback((e) => {
    if (
      panelRef.current?.contains(e.target) ||
      buttonRef.current?.contains(e.target)
    ) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (!text) {
      setButtonPos(null)
      setSelectedText('')
      setShowPanel(false)
      setResults({})
    }
  }, [])

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setButtonPos(null)
      setSelectedText('')
      setShowPanel(false)
      setResults({})
      window.getSelection()?.removeAllRanges()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(selectionTimeout.current)
    }
  }, [handleMouseUp, handleClickOutside, handleKeyDown])

  // ── Translate all 3 languages ──
  const doTranslate = async () => {
    if (!selectedText) return

    setLoading(true)
    setError('')

    // Calculate panel position: check if there's room above, otherwise go below
    const rect = selectionRect.current
    const PANEL_HEIGHT = 280
    const spaceAbove = rect ? rect.top : 200
    const flipped = spaceAbove < PANEL_HEIGHT + 20

    setPanelFlipped(flipped)
    setPanelPos({
      top: flipped
        ? (rect ? rect.bottom + 12 : buttonPos.top + 50)
        : (rect ? rect.top - 12 : buttonPos.top - 8),
      left: Math.min(Math.max(buttonPos.left, 180), window.innerWidth - 180),
    })
    setShowPanel(true)

    const langs = ['en', 'vi', 'ja']
    const translationResults = {}

    try {
      // Fetch all 3 translations in parallel
      const promises = langs.map(async (lang) => {
        try {
          const res = await translateText(selectedText, lang)
          translationResults[lang] = {
            text: res.translatedText,
            source: res.source,
          }
        } catch {
          translationResults[lang] = { text: '—', source: 'error' }
        }
      })

      await Promise.all(promises)
      setResults(translationResults)
    } catch (err) {
      setError('Translation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const closePanel = () => {
    setShowPanel(false)
    setButtonPos(null)
    setSelectedText('')
    setResults({})
    window.getSelection()?.removeAllRanges()
  }

  return createPortal(
    <>
      {/* ── Floating Translate Button ── */}
      {buttonPos && !showPanel && (
        <button
          ref={buttonRef}
          onClick={doTranslate}
          style={{
            position: 'fixed',
            top: `${buttonPos.top}px`,
            left: `${buttonPos.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 10000,
          }}
          className="select-translate-btn"
          title="Translate selected text"
        >
          <Languages size={15} />
          <span>Translate</span>
        </button>
      )}

      {/* ── Translation Results Panel ── */}
      {showPanel && panelPos && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            transform: panelFlipped
              ? 'translateX(-50%)'            // Below: top-left anchor
              : 'translateX(-50%) translateY(-100%)',  // Above: bottom-left anchor
            zIndex: 10001,
          }}
          className="select-translate-panel"
        >
          {/* Arrow */}
          <span className={panelFlipped ? 'select-translate-arrow-top' : 'select-translate-arrow'} />

          {/* Header */}
          <div className="select-translate-header">
            <div className="select-translate-header-left">
              <Sparkles size={13} className="text-accent-light" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                Instant Translate
              </span>
            </div>
            <button onClick={closePanel} className="select-translate-close">
              <X size={13} />
            </button>
          </div>

          {/* Original text */}
          <div className="select-translate-original">
            <span className="text-[10px] font-medium tracking-wider uppercase text-text-muted">
              Original
            </span>
            <p className="text-sm text-text-primary mt-0.5 leading-snug break-words">
              "{selectedText.length > 100 ? selectedText.slice(0, 100) + '…' : selectedText}"
            </p>
          </div>

          {/* Results */}
          <div className="select-translate-results">
            {loading ? (
              <div className="select-translate-loading">
                <Loader2 size={18} className="animate-spin text-accent" />
                <span className="text-xs text-text-muted">Translating…</span>
              </div>
            ) : error ? (
              <p className="text-xs text-danger px-1">{error}</p>
            ) : (
              Object.entries(LANG_LABELS).map(([langKey, langInfo]) => {
                const result = results[langKey]
                if (!result) return null
                return (
                  <div key={langKey} className="select-translate-row">
                    <div className="select-translate-lang-badge">
                      <span className="text-[11px]">{langInfo.flag}</span>
                      <span className="text-[10px] font-mono font-semibold">
                        {langInfo.code}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-snug break-words">
                        {result.text}
                      </p>
                      {result.source && result.source !== 'error' && (
                        <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                          via {result.source === 'Custom IT Glossary' ? (
                            <span className="text-accent font-medium">IT Glossary ✓</span>
                          ) : result.source === 'DeepL unavailable' ? (
                            <span className="text-warning">DeepL unavailable — check API key</span>
                          ) : (
                            <span className="text-info">{result.source}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
