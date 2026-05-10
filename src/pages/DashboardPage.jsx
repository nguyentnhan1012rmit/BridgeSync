import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  FolderKanban,
  ListChecks,
  FileText,
  BookOpen,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react'
import { Card, Button, TextHighlighter } from '@/components/ui'
import { getDashboardStats } from '@/api/stats'
import { getGlossary } from '@/api/glossary'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  })

  // ── Fetch glossary terms ──
  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ['glossary'],
    queryFn: getGlossary,
  })

  const statsConfig = [
    { key: 'activeProjects', icon: FolderKanban, value: data?.activeProjects, color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'pendingTasks',   icon: ListChecks,   value: data?.pendingTasks,   color: 'text-info',    bg: 'bg-info/10' },
    { key: 'reportsThisWeek', icon: FileText,    value: data?.reportsThisWeek, color: 'text-warning', bg: 'bg-warning/10' },
    { key: 'translationsSaved', icon: BookOpen,  value: data?.glossaryTerms,  color: 'text-success', bg: 'bg-success/10' },
  ]

  const recentReports = data?.recentReports || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {t('dashboard.welcome')}, <span className="font-medium text-text-secondary">{user?.name || 'User'}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {statsConfig.map((stat) => (
          <Card key={stat.key} hover className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {t(`dashboard.${stat.key}`)}
                </p>
                <div className="mt-2 text-3xl font-bold text-text-primary tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 skeleton rounded" />
                  ) : (
                    stat.value ?? 0
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 overflow-hidden" padding="none">
          <div className="px-6 py-4 border-b border-border bg-surface-alt/30">
            <h2 className="text-sm font-semibold text-text-primary">
              {t('dashboard.recentActivity')}
            </h2>
          </div>
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            )}
            {!isLoading && recentReports.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <FileText size={32} className="opacity-20 mb-3" />
                <p className="text-sm">{t('common.noData')}</p>
              </div>
            )}
            {recentReports.map((report) => (
              <div
                key={report._id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-surface-alt/50 transition-colors"
              >
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-tight">
                    <span className="font-medium">{report.authorId?.name || 'Someone'}</span>
                    {' submitted a report'}
                    {report.projectId?.name && (
                      <> for <span className="font-medium text-primary">{report.projectId.name}</span></>
                    )}
                  </p>
                  {report.houkoku?.currentStatus && (
                    <p className="text-sm text-text-muted mt-1 truncate">
                      <TextHighlighter text={report.houkoku.currentStatus} glossaryTerms={glossaryTerms} />
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                    <Clock size={12} />
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="h-fit">
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            {t('dashboard.quickActions')}
          </h2>
          <div className="flex flex-col gap-2">
            {(user?.role === 'PM' || user?.role === 'BrSE') && (
              <>
                <Button variant="primary" size="lg" icon={Plus} className="w-full justify-start"
                  onClick={() => navigate('/projects')}
                >
                  {t('projects.newProject')}
                </Button>
                <Button variant="secondary" size="lg" icon={Plus} className="w-full justify-start"
                  onClick={() => navigate('/tasks')}
                >
                  {t('tasks.newTask')}
                </Button>
              </>
            )}
            {(user?.role === 'PM' || user?.role === 'BrSE' || user?.role === 'Developer') && (
              <Button variant="secondary" size="lg" icon={Plus} className="w-full justify-start"
                onClick={() => navigate('/hourenso')}
              >
                {t('hourenso.newReport')}
              </Button>
            )}
            <Button variant="secondary" size="lg" icon={FileText} className="w-full justify-start"
              onClick={() => navigate('/hourenso')}
            >
              {t('hourenso.exportExcel')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
