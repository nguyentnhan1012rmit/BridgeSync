import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Card } from '@/components/ui'
import LanguageToggle from '@/components/LanguageToggle'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div style={{ maxWidth: '44rem' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">
          {t('nav.settings')}
        </h1>
        <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">
          Configure your preferences
        </p>
      </div>

      {/* Language Setting */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', flexShrink: 0 }} className="bg-primary/8">
            <Globe size={18} className="text-primary" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 500 }} className="text-text-primary">{t('common.language')}</h2>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px' }} className="text-text-muted">
              Select your preferred interface language
            </p>
            <div style={{ marginTop: '12px' }}>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
