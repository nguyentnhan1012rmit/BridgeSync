import { useTranslation } from 'react-i18next'
import { User as UserIcon, Mail, Shield } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

const roleLabels = {
  PM: 'Project Manager',
  BrSE: 'Bridge SE',
  Developer: 'Developer',
  'Japanese client': 'Japanese Client',
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (!user) return null

  const fields = [
    { icon: UserIcon, label: t('auth.name'), value: user.name },
    { icon: Mail, label: t('auth.email'), value: user.email },
    { icon: Shield, label: t('auth.role'), value: roleLabels[user.role] || user.role },
  ]

  return (
    <div style={{ maxWidth: '36rem' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">
          {t('profile.title')}
        </h1>
        <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">
          {t('profile.subtitle')}
        </p>
      </div>

      <Card>
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">{user.name}</p>
            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/8 text-accent-dark mt-1">
              {roleLabels[user.role] || user.role}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 pt-5">
          {fields.map((field) => {
            const IconComponent = field.icon;
            return (
              <div key={field.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-text-muted flex-shrink-0">
                  <IconComponent size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-text-muted">{field.label}</p>
                  <p className="text-sm font-medium text-text-primary truncate">{field.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  )
}
