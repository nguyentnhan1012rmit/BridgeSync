import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Calendar, Trash2, Loader2, AlertCircle, FolderKanban } from 'lucide-react'
import { Card, Button, Modal, TextHighlighter } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getProjects, createProject, deleteProject } from '@/api/projects'
import { getGlossary } from '@/api/glossary'

const statusColors = {
  active: { background: 'oklch(0.55 0.14 150 / 0.1)', color: 'oklch(0.45 0.14 150)' },
  archived: { background: 'oklch(0.55 0.005 260 / 0.1)', color: 'oklch(0.45 0.005 260)' },
}

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // ── Fetch glossary terms ──
  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ['glossary'],
    queryFn: getGlossary,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowCreate(false)
      setForm({ name: '', description: '' })
    },
  })

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
    <div style={{ maxWidth: '76rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">
            {t('projects.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">
            {isLoading ? t('common.loading') : `${projects.length} ${t('projects.title').toLowerCase()}`}
          </p>
        </div>
        {(user?.role === 'PM' || user?.role === 'BrSE') && (
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            {t('projects.newProject')}
          </Button>
        )}
      </div>

      {/* Error */}
      {isError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '16px', background: 'oklch(0.52 0.16 25 / 0.06)', border: '1px solid oklch(0.52 0.16 25 / 0.12)', color: 'oklch(0.52 0.16 25)' }}>
          <AlertCircle size={16} />
          <span>{error?.message || 'Failed to load projects'}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && projects.length === 0 && (
        <Card className="empty-state" style={{ padding: '56px 16px' }}>
          <FolderKanban size={32} />
          <p style={{ fontSize: '0.875rem' }}>{t('common.noData')}</p>
        </Card>
      )}

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => {
          const sc = statusColors[project.status] || statusColors.active
          return (
            <Card key={project._id} hover>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 500, fontSize: '0.9375rem', letterSpacing: '-0.01em' }} className="text-text-primary">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p style={{ fontSize: '0.8125rem', marginTop: '4px' }} className="text-text-muted line-clamp-2">
                       <TextHighlighter text={project.description} glossaryTerms={glossaryTerms} />
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: sc.background,
                    color: sc.color,
                  }}>
                    {t(`projects.statusOptions.${project.status}`) || project.status}
                  </span>
                  {user?.role === 'PM' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project._id) }}
                      disabled={deleteMutation.isPending}
                      style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', transition: 'all 150ms' }}
                      className="text-text-muted hover:text-danger hover:bg-danger/8"
                      title={t('common.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '10px', borderTop: '1px solid' }} className="text-text-muted border-border">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} />
                  <span>{project.members?.length || 0} {t('projects.members').toLowerCase()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Create project modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('projects.newProject')}>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }} className="text-text-secondary">
              {t('projects.projectName')} *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('projects.projectName')}
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }} className="text-text-secondary">
              {t('projects.description')}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('projects.description')}
              className="form-input"
              style={{ resize: 'none' }}
            />
          </div>

          {createMutation.isError && (
            <p style={{ fontSize: '0.875rem', marginBottom: '12px' }} className="text-danger">{createMutation.error?.message}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>
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
