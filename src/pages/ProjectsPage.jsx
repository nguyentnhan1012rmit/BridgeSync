import { useTranslation } from 'react-i18next'
import { Plus, Users, Calendar } from 'lucide-react'
import { Card, Button } from '@/components/ui'

const mockProjects = [
  {
    id: 1,
    name: 'Project Sakura 🌸',
    client: 'Tanaka Corp.',
    status: 'active',
    dueDate: '2026-04-15',
    members: 6,
    progress: 72,
  },
  {
    id: 2,
    name: 'Payment Gateway',
    client: 'Yamamoto Inc.',
    status: 'planning',
    dueDate: '2026-05-01',
    members: 4,
    progress: 15,
  },
  {
    id: 3,
    name: 'CRM Migration',
    client: 'Suzuki Ltd.',
    status: 'active',
    dueDate: '2026-04-30',
    members: 8,
    progress: 45,
  },
  {
    id: 4,
    name: 'Inventory System',
    client: 'Nakamura Co.',
    status: 'onHold',
    dueDate: '2026-06-01',
    members: 3,
    progress: 30,
  },
]

const statusColors = {
  active: 'bg-success/15 text-success',
  planning: 'bg-info/15 text-info',
  onHold: 'bg-warning/15 text-warning',
  completed: 'bg-text-muted/15 text-text-muted',
}

export default function ProjectsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('projects.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">{mockProjects.length} projects total</p>
        </div>
        <Button icon={Plus}>{t('projects.newProject')}</Button>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockProjects.map((project) => (
          <Card key={project.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-text-primary">{project.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">{project.client}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status]}`}>
                {t(`projects.statusOptions.${project.status}`)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Users size={13} />
                <span>{project.members} {t('projects.members').toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>{project.dueDate}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
