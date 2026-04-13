import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Calendar, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { Card, Button, Modal } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getProjects, createProject, deleteProject } from '@/api/projects'

const statusColors = {
  active: 'bg-success/15 text-success',
  archived: 'bg-text-muted/15 text-text-muted',
}

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  // ── Fetch projects ──
  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // ── Create project ──
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowCreate(false)
      setForm({ name: '', description: '' })
    },
  })

  // ── Delete project ──
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createMutation.mutate({ name: form.name, description: form.description })
  }

  const handleDelete = (projectId) => {
    if (window.confirm(t('projects.confirmDelete'))) {
      deleteMutation.mutate(projectId)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('projects.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">
            {isLoading ? t('common.loading') : `${projects.length} ${t('projects.title').toLowerCase()} total`}
          </p>
        </div>
        {(user?.role === 'PM' || user?.role === 'BrSE') && (
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            {t('projects.newProject')}
          </Button>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error?.message || 'Failed to load projects'}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && projects.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-muted">{t('common.noData')}</p>
        </Card>
      )}

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <Card key={project._id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">{project.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status] || statusColors.active}`}>
                  {t(`projects.statusOptions.${project.status}`) || project.status}
                </span>
                {user?.role === 'PM' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project._id) }}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-50"
                    title={t('common.delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Users size={13} />
                <span>{project.members?.length || 0} {t('projects.members').toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create project modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('projects.newProject')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('projects.projectName')} *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('projects.projectName')}
              className="w-full px-4 py-2.5 text-sm bg-surface-alt border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                placeholder:text-text-muted transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('projects.description')}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('projects.description')}
              className="w-full px-4 py-2.5 text-sm bg-surface-alt border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                placeholder:text-text-muted transition-all resize-none"
            />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-danger">{createMutation.error?.message}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.loading') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
