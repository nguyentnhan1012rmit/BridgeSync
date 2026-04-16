import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'vi', label: 'VI', flag: '🇻🇳' },
  { code: 'ja', label: 'JP', flag: '🇯🇵' },
]

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  return (
    <div className={`flex items-center gap-0.5 p-1 bg-surface-alt rounded-xl ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`
            px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer
            transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
            flex items-center gap-1.5
            ${
              currentLang === lang.code
                ? 'bg-surface-raised text-text-primary shadow-sm'
                : 'bg-transparent text-text-muted hover:text-text-secondary'
            }
          `}
          title={lang.label}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}
