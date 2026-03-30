import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { Card } from '@/components/ui'
import LanguageToggle from '@/components/LanguageToggle'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('nav.settings')}</h1>
        <p className="text-text-secondary text-sm mt-1">Configure your BridgeSync preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Settings size={18} className="text-text-muted" />
          <h2 className="font-semibold text-text-primary">{t('common.language')}</h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Select your preferred interface language. Changes take effect immediately without reloading.
        </p>
        <LanguageToggle />
      </Card>
    </div>
  )
}
