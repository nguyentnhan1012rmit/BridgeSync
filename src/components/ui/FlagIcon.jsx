/**
 * SVG flag icons for the 3 supported languages.
 * Uses inline SVGs instead of emoji flags for cross-platform consistency.
 * Displays on Windows, Mac, Linux, Android, and iOS identically.
 */

const flags = {
  en: (size) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width={size} height={size * 0.5} style={{ borderRadius: 2 }}>
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  vi: (size) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width={size} height={size * 0.667} style={{ borderRadius: 2 }}>
      <rect width="30" height="20" fill="#DA251D"/>
      <polygon points="15,4 11.47,14.76 20.71,8.24 9.29,8.24 18.53,14.76" fill="#FFFF00"/>
    </svg>
  ),
  ja: (size) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width={size} height={size * 0.667} style={{ borderRadius: 2 }}>
      <rect width="30" height="20" fill="#fff"/>
      <circle cx="15" cy="10" r="6" fill="#BC002D"/>
    </svg>
  ),
}

/**
 * Render an SVG flag icon for a given language code.
 * @param {{ code: 'en' | 'vi' | 'ja', size?: number, className?: string }} props
 */
export default function FlagIcon({ code, size = 16, className = '' }) {
  const renderFlag = flags[code]
  if (!renderFlag) return null

  return (
    <span className={`inline-flex items-center shrink-0 ${className}`} aria-hidden="true">
      {renderFlag(size)}
    </span>
  )
}
