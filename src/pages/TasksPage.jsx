import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Info, Loader2, AlertCircle, ChevronDown, ListChecks, Pencil, Trash2 } from 'lucide-react'
import { Card, Button, Modal, TextHighlighter } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } from '@/api/tasks'
import { getProjects, getProjectMembers } from '@/api/projects'
import { getAllGlossaryTerms } from '@/api/glossary'

const statusConfig = {
  ongoing:   { bg: 'oklch(0.52 0.10 240 / 0.1)', fg: 'oklch(0.42 0.10 240)', dot: 'oklch(0.52 0.10 240)' },
  completed: { bg: 'oklch(0.55 0.14 150 / 0.1)', fg: 'oklch(0.45 0.14 150)', dot: 'oklch(0.55 0.14 150)' },
  delayed:   { bg: 'oklch(0.52 0.16 25 / 0.1)',  fg: 'oklch(0.42 0.16 25)',  dot: 'oklch(0.52 0.16 25)' },
}

const statusCycle = ['ongoing', 'completed', 'delayed']

export default function TasksPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '' })

  // ── Fetch projects for selector ──
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // ── Fetch tasks for selected project ──
  const { data: tasks = [], isLoading, isError, error } = useQuery({
    queryKey: ['tasks', selectedProject],
    queryFn: () => getTasksByProject(selectedProject),
    enabled: !!selectedProject,
  })

  // ── Fetch project members for assignee dropdown ──
  const { data: members = [] } = useQuery({
    queryKey: ['projectMembers', selectedProject],
    queryFn: () => getProjectMembers(selectedProject),
    enabled: !!selectedProject,
  })

  // ── Fetch glossary terms ──
  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ['glossary'],
    queryFn: getAllGlossaryTerms,
  })

  // ── Create task ──
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] })
      setShowCreate(false)
      setForm({ title: '', description: '', assigneeId: '' })
      toast.success(t('tasks.newTask'), { description: 'Task created successfully' })
    },
    onError: (err) => toast.error(err?.message || 'Failed to create task'),
  })

  // ── Update task status ──
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to update status'),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) => updateTask(taskId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] })
      setEditingTask(null)
      setForm({ title: '', description: '', assigneeId: '' })
      toast.success('Task updated')
    },
    onError: (err) => toast.error(err?.message || 'Failed to update task'),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] })
      toast.success('Task deleted')
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete task'),
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createMutation.mutate({
      projectId: selectedProject,
      title: form.title,
      description: form.description,
      assigneeId: form.assigneeId || undefined,
    })
  }

  const cycleStatus = (task) => {
    const currentIdx = statusCycle.indexOf(task.status)
    const nextStatus = statusCycle[(currentIdx + 1) % statusCycle.length]
    updateStatusMutation.mutate({ taskId: task._id, status: nextStatus })
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title || '',
      description: task.description || '',
      assigneeId: task.assigneeId?._id || '',
    })
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    if (!editingTask || !form.title.trim()) return
    updateTaskMutation.mutate({
      taskId: editingTask._id,
      taskData: {
        title: form.title,
        description: form.description,
        assigneeId: form.assigneeId || undefined,
      },
    })
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      deleteTaskMutation.mutate(taskId)
    }
  }

  return (
    <div style={{ maxWidth: '76rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">{t('tasks.title')}</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">
            {selectedProject
              ? `${tasks.length} ${t('tasks.title').toLowerCase()}`
              : t('tasks.selectProject')}
          </p>
        </div>
        {selectedProject && (user?.role === 'PM' || user?.role === 'BrSE') && (
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            {t('tasks.newTask')}
          </Button>
        )}
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative min-w-[220px]">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="form-input appearance-none pr-9 cursor-pointer text-sm"
          >
            <option value="">{t('tasks.selectProject')}</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Hover-to-translate hint */}
      {selectedProject && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/4 border border-accent/10 rounded-lg text-sm text-accent-dark">
          <Info size={14} className="flex-shrink-0" />
          <span>{t('tasks.hoverToTranslate')}</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/10 rounded-lg text-sm text-danger">
          <AlertCircle size={15} />
          <span>{error?.message || 'Failed to load tasks'}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Empty state */}
      {selectedProject && !isLoading && !isError && tasks.length === 0 && (
        <Card className="empty-state py-14">
          <ListChecks size={28} />
          <p className="text-sm">{t('common.noData')}</p>
        </Card>
      )}

      {/* Task List */}
      {tasks.length > 0 && (
        <Card padding="none">
          <div className="divide-y divide-border">
            {tasks.map((task) => {
              const cfg = statusConfig[task.status] || statusConfig.ongoing
              return (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', transition: 'background 150ms' }} className="hover:bg-surface-alt/50 group">
                  {/* Status dot */}
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: cfg.dot }} />

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      <TextHighlighter text={task.title} glossaryTerms={glossaryTerms} />
                    </p>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                        <TextHighlighter text={task.description} glossaryTerms={glossaryTerms} />
                      </p>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="hidden sm:block text-sm text-text-muted min-w-[100px]">
                    {task.assigneeId?.name || '—'}
                  </div>

                  {/* Status badge — click to cycle */}
                  <button
                    onClick={() => cycleStatus(task)}
                    disabled={updateStatusMutation.isPending}
                    style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px', cursor: 'pointer', border: 'none', background: cfg.bg, color: cfg.fg, transition: 'all 150ms' }}
                    title={t('tasks.clickToChangeStatus')}
                  >
                    {t(`tasks.statusOptions.${task.status}`) || task.status}
                  </button>

                  {/* Date */}
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>

                  {(user?.role === 'PM' || user?.role === 'BrSE') && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditTask(task)}
                        className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/8"
                        title="Edit task"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        disabled={deleteTaskMutation.isPending}
                        className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/8"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Create task modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('tasks.newTask')}>
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('tasks.taskName')} *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('tasks.taskName')}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('tasks.description')}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('tasks.description')}
              className="form-input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('tasks.assignee')}
            </label>
            <div className="relative">
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="form-input appearance-none pr-9 cursor-pointer"
              >
                <option value="">{t('tasks.unassigned')}</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          {createMutation.isError && (
            <p className="text-sm text-danger">{createMutation.error?.message}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.loading') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editingTask)} onClose={() => setEditingTask(null)} title="Edit task">
        <form onSubmit={handleUpdate} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('tasks.taskName')} *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('tasks.taskName')}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('tasks.description')}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('tasks.description')}
              className="form-input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('tasks.assignee')}
            </label>
            <div className="relative">
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="form-input appearance-none pr-9 cursor-pointer"
              >
                <option value="">{t('tasks.unassigned')}</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          {updateTaskMutation.isError && (
            <p className="text-sm text-danger">{updateTaskMutation.error?.message}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={() => setEditingTask(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateTaskMutation.isPending}>
              {updateTaskMutation.isPending ? t('common.loading') : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
