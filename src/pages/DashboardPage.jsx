import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import {
  FolderKanban,
  ListChecks,
  FileText,
  Languages,
  ArrowUpRight,
  Clock,
  Plus,
} from 'lucide-react'
import { Card, Button } from '@/components/ui'

const stats = [
  { key: 'activeProjects', icon: FolderKanban, value: 4, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'pendingTasks', icon: ListChecks, value: 12, color: 'text-accent', bg: 'bg-accent/10' },
  { key: 'reportsThisWeek', icon: FileText, value: 3, color: 'text-warning', bg: 'bg-warning/10' },
  { key: 'translationsSaved', icon: Languages, value: 87, color: 'text-success', bg: 'bg-success/10' },
]

const recentActivity = [
  { action: 'Updated task "API Integration" in Project Sakura', time: '2 min ago', type: 'task' },
  { action: 'Submitted Hourenso report for Sprint 4', time: '1 hour ago', type: 'report' },
  { action: 'Added 5 new terms to IT Glossary', time: '3 hours ago', type: 'glossary' },
  { action: 'Created project "Payment Gateway"', time: '1 day ago', type: 'project' },
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
        <p className="text-text-secondary mt-1">
          {t('dashboard.welcome')}, {user?.name || 'User'} 👋
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.key} hover className="group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{t(`dashboard.${stat.key}`)}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs text-text-muted group-hover:text-primary transition-colors">
              <ArrowUpRight size={12} />
              <span>View details</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2" padding="none">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-semibold text-text-primary">{t('dashboard.recentActivity')}</h2>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-6 py-4 hover:bg-surface-alt/50 transition-colors">
                <div className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{item.action}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                    <Clock size={11} />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="font-semibold text-text-primary mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            <Button variant="primary" size="md" icon={Plus} className="w-full justify-start">
              {t('projects.newProject')}
            </Button>
            <Button variant="secondary" size="md" icon={Plus} className="w-full justify-start">
              {t('tasks.newTask')}
            </Button>
            <Button variant="secondary" size="md" icon={Plus} className="w-full justify-start">
              {t('hourenso.newReport')}
            </Button>
            <Button variant="accent" size="md" icon={FileText} className="w-full justify-start">
              {t('hourenso.exportExcel')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
