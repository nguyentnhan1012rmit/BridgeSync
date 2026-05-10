import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Card } from '@/components/ui'
import LanguageToggle from '@/components/LanguageToggle'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          {t('nav.settings')}
        </h1>
        <p className="text-sm mt-0.5 text-text-muted">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Language Setting */}
      <Card className="mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg shrink-0 bg-primary/8">
            <Globe size={18} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[0.9375rem] font-medium text-text-primary">{t('common.language')}</h2>
            <p className="text-[0.8125rem] mt-1 text-text-muted">
              {t('settings.languageDescription')}
            </p>
            <div className="mt-3">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
