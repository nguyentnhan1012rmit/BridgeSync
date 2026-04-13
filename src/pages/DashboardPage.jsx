import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import {
  FolderKanban,
  ListChecks,
  FileText,
  BookOpen,
  ArrowUpRight,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { getDashboardStats } from '@/api/stats'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refresh every 30s
  })

  const statsConfig = [
    { key: 'activeProjects', icon: FolderKanban, value: data?.activeProjects ?? '—', color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'pendingTasks',   icon: ListChecks,   value: data?.pendingTasks ?? '—',   color: 'text-accent',  bg: 'bg-accent/10' },
    { key: 'reportsThisWeek', icon: FileText,    value: data?.reportsThisWeek ?? '—', color: 'text-warning', bg: 'bg-warning/10' },
    { key: 'translationsSaved', icon: BookOpen,  value: data?.glossaryTerms ?? '—',  color: 'text-success', bg: 'bg-success/10' },
  ]

  const recentReports = data?.recentReports || []

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
        {statsConfig.map((stat) => (
          <Card key={stat.key} hover className="group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{t(`dashboard.${stat.key}`)}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin text-text-muted" />
                  ) : (
                    stat.value
                  )}
                </p>
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
          </div>
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-text-muted" />
              </div>
            )}
            {!isLoading && recentReports.length === 0 && (
              <div className="px-6 py-12 text-center text-text-muted text-sm">
                {t('common.noData')}
              </div>
            )}
            {recentReports.map((report) => (
              <div key={report._id} className="flex items-start gap-3 px-6 py-4 hover:bg-surface-alt/50 transition-colors">
                <div className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{report.authorId?.name || 'Someone'}</span>
                    {' submitted a report'}
                    {report.projectId?.name && (
                      <> for <span className="font-medium text-primary">{report.projectId.name}</span></>
                    )}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                    {report.houkoku?.currentStatus}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                    <Clock size={11} />
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
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
