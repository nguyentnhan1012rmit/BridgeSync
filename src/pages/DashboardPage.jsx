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
  Sparkles,
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
    { key: 'activeProjects', icon: FolderKanban, value: data?.activeProjects ?? '—', color: 'text-primary', bg: 'bg-primary/8', borderColor: 'border-primary/15' },
    { key: 'pendingTasks',   icon: ListChecks,   value: data?.pendingTasks ?? '—',   color: 'text-accent',  bg: 'bg-accent/8',  borderColor: 'border-accent/15' },
    { key: 'reportsThisWeek', icon: FileText,    value: data?.reportsThisWeek ?? '—', color: 'text-warning', bg: 'bg-warning/8', borderColor: 'border-warning/15' },
    { key: 'translationsSaved', icon: BookOpen,  value: data?.glossaryTerms ?? '—',  color: 'text-success', bg: 'bg-success/8', borderColor: 'border-success/15' },
  ]

  const recentReports = data?.recentReports || []

  return (
    <div className="space-y-8" style={{ maxWidth: '80rem' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('dashboard.title')}</h1>
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
                <p className="text-sm text-text-muted font-medium">{t(`dashboard.${stat.key}`)}</p>
                <p className="text-3xl font-bold text-text-primary mt-2 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-10 h-8 skeleton" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.borderColor} border`}>
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
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="font-semibold text-text-primary">{t('dashboard.recentActivity')}</h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-text-muted" />
              </div>
            )}
            {!isLoading && recentReports.length === 0 && (
              <div className="empty-state py-16">
                <FileText size={32} />
                <p className="text-sm">{t('common.noData')}</p>
              </div>
            )}
            {recentReports.map((report) => (
              <div key={report._id} className="flex items-start gap-3 px-6 py-4 hover:bg-primary/3 transition-colors">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0 ring-4 ring-accent/10" />
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
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-text-muted">
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
          <div className="space-y-2.5">
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
