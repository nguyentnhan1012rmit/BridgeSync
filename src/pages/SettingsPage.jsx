import { useTranslation } from 'react-i18next'
import { Globe, Monitor } from 'lucide-react'
import { Card } from '@/components/ui'
import LanguageToggle from '@/components/LanguageToggle'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6" style={{ maxWidth: '48rem' }}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('nav.settings')}</h1>
        <p className="text-text-secondary text-sm mt-1">Configure your BridgeSync preferences</p>
      </div>

      {/* Language Setting */}
      <Card>
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-xl bg-primary/8 border border-primary/15 flex-shrink-0">
            <Globe size={18} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-text-primary">{t('common.language')}</h2>
            <p className="text-sm text-text-muted mt-1">
              Select your preferred interface language. Changes take effect immediately.
            </p>
            <div className="mt-4">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </Card>

      {/* Display Setting */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-accent/8 border border-accent/15 flex-shrink-0">
            <Monitor size={18} className="text-accent-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-text-primary">Display</h2>
            <p className="text-sm text-text-muted mt-1">
              Interface density and visual preferences
            </p>
            <p className="text-sm text-text-muted italic mt-3">More settings coming soon.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
