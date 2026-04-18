import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'vi', label: 'VI', flag: '🇻🇳' },
  { code: 'ja', label: 'JP', flag: '🇯🇵' },
]

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  return (
    <div className={`flex items-center gap-0.5 p-0.5 bg-surface-alt rounded-lg ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`
            px-2 py-1 text-xs font-medium rounded-md cursor-pointer
            transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
            flex items-center gap-1
            ${
              currentLang === lang.code
                ? 'bg-surface-raised text-text-primary shadow-sm'
                : 'bg-transparent text-text-muted hover:text-text-secondary'
            }
          `}
          title={lang.label}
        >
          <span className="text-[11px]">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}
