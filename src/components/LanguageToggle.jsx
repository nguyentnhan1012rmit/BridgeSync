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
    <div className={`flex items-center gap-1 ${className}`}>
      <Languages size={16} className="text-text-muted mr-1" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`
            px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer
            transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
            ${
              currentLang === lang.code
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }
          `}
          title={lang.label}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}
