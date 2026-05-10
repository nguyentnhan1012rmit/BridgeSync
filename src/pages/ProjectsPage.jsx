import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Calendar, Trash2, Pencil, Loader2, AlertCircle, FolderKanban, Languages, ChevronDown, UserPlus, UserMinus } from 'lucide-react'
import { Card, Button, Modal, TextHighlighter } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getProjects, createProject, updateProject, deleteProject, getProjectMembers, addProjectMember, removeProjectMember } from '@/api/projects'
import { getAllGlossaryTerms } from '@/api/glossary'
import { getUsers } from '@/api/auth'

const statusColors = {
  active: { background: 'oklch(0.55 0.14 150 / 0.1)', color: 'oklch(0.45 0.14 150)' },
  archived: { background: 'oklch(0.55 0.005 260 / 0.1)', color: 'oklch(0.45 0.005 260)' },
}

const languageLabels = {
  en: 'EN',
  vi: 'VI',
  ja: 'JA',
}

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [manageProject, setManageProject] = useState(null)
  const [editProject, setEditProject] = useState(null)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [form, setForm] = useState({ name: '', description: '', preferredLanguage: 'ja' })

  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // ── Fetch glossary terms ──
  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ['glossary'],
    queryFn: getAllGlossaryTerms,
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: user?.role === 'PM',
  })

  const { data: projectMembers = [] } = useQuery({
    queryKey: ['projectMembers', manageProject?._id],
    queryFn: () => getProjectMembers(manageProject._id),
    enabled: Boolean(manageProject?._id),
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowCreate(false)
      setForm({ name: '', description: '', preferredLanguage: 'ja' })
      toast.success(t('projects.newProject'), { description: 'Project created successfully' })
    },
    onError: (err) => toast.error(err?.message || 'Failed to create project'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete project'),
  })

  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }) => addProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', manageProject?._id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setSelectedMemberId('')
      toast.success('Member added')
    },
    onError: (err) => toast.error(err?.message || 'Failed to add member'),
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }) => removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', manageProject?._id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Member removed')
    },
    onError: (err) => toast.error(err?.message || 'Failed to remove member'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ projectId, projectData }) => updateProject(projectId, projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setEditProject(null)
      toast.success('Project updated')
    },
    onError: (err) => toast.error(err?.message || 'Failed to update project'),
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createMutation.mutate({
      name: form.name,
      description: form.description,
      preferredLanguage: form.preferredLanguage,
    })
  }

  const handleDelete = (projectId) => {
    if (window.confirm(t('projects.confirmDelete'))) {
      deleteMutation.mutate(projectId)
    }
  }

  const memberIdSet = new Set(projectMembers.map((member) => member._id))
  const availableUsers = allUsers.filter((candidate) => !memberIdSet.has(candidate._id))

  const openEditProject = (project) => {
    setEditProject(project)
    setForm({ name: project.name, description: project.description || '', preferredLanguage: project.preferredLanguage || 'ja' })
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    if (!editProject || !form.name.trim()) return
    updateMutation.mutate({
      projectId: editProject._id,
      projectData: { name: form.name, description: form.description, preferredLanguage: form.preferredLanguage },
    })
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
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/8 text-accent-dark">
                    <Languages size={11} />
                    {languageLabels[project.preferredLanguage] || 'JA'}
                  </span>
                  {(user?.role === 'PM' || user?.role === 'BrSE') && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditProject(project) }}
                        style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', transition: 'all 150ms' }}
                        className="text-text-muted hover:text-primary hover:bg-primary/8"
                        title="Edit project"
                      >
                        <Pencil size={14} />
                      </button>
                      {user?.role === 'PM' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setManageProject(project) }}
                          style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', transition: 'all 150ms' }}
                          className="text-text-muted hover:text-primary hover:bg-primary/8"
                          title="Manage members"
                        >
                          <UserPlus size={14} />
                        </button>
                      )}
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
                    </>
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }} className="text-text-secondary">
              {t('projects.preferredLanguage')}
            </label>
            <div className="relative">
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                className="form-input appearance-none pr-9 cursor-pointer"
              >
                <option value="ja">{t('language.ja')}</option>
                <option value="en">{t('language.en')}</option>
                <option value="vi">{t('language.vi')}</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
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

      <Modal open={Boolean(manageProject)} onClose={() => setManageProject(null)} title="Manage project members">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-text-primary">{manageProject?.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{projectMembers.length} members assigned</p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="form-input appearance-none pr-9 cursor-pointer"
              >
                <option value="">Select user to add</option>
                {availableUsers.map((candidate) => (
                  <option key={candidate._id} value={candidate._id}>
                    {candidate.name} ({candidate.role})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <Button
              type="button"
              icon={UserPlus}
              disabled={!selectedMemberId || addMemberMutation.isPending}
              onClick={() => addMemberMutation.mutate({ projectId: manageProject._id, userId: selectedMemberId })}
            >
              Add
            </Button>
          </div>

          {(addMemberMutation.isError || removeMemberMutation.isError) && (
            <p className="text-sm text-danger">
              {addMemberMutation.error?.message || removeMemberMutation.error?.message}
            </p>
          )}

          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {projectMembers.map((member) => (
              <div key={member._id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                  <p className="text-xs text-text-muted truncate">{member.email} · {member.role}</p>
                </div>
                <button
                  type="button"
                  disabled={removeMemberMutation.isPending}
                  onClick={() => removeMemberMutation.mutate({ projectId: manageProject._id, userId: member._id })}
                  className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/8"
                  title="Remove member"
                >
                  <UserMinus size={15} />
                </button>
              </div>
            ))}
            {projectMembers.length === 0 && (
              <div className="empty-state py-8">
                <Users size={22} />
                <p className="text-sm">{t('common.noData')}</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit project modal */}
      <Modal open={Boolean(editProject)} onClose={() => setEditProject(null)} title={t('common.edit') + ' ' + t('projects.title').toLowerCase().slice(0, -1)}>
        <form onSubmit={handleUpdate} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('projects.projectName')} *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('projects.description')}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('projects.preferredLanguage')}
            </label>
            <div className="relative">
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                className="form-input appearance-none pr-9 cursor-pointer"
              >
                <option value="ja">{t('language.ja')}</option>
                <option value="en">{t('language.en')}</option>
                <option value="vi">{t('language.vi')}</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
          {updateMutation.isError && (
            <p className="text-sm text-danger">{updateMutation.error?.message}</p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={() => setEditProject(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
