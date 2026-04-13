import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Info, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { Card, Button, Modal, TranslateTooltip } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getTasksByProject, createTask, updateTaskStatus } from '@/api/tasks'
import { getProjects } from '@/api/projects'
import { getProjectMembers } from '@/api/projects'

const statusConfig = {
  ongoing:   { color: 'bg-info/15 text-info',       dot: 'bg-info',    label: 'Ongoing' },
  completed: { color: 'bg-success/15 text-success',  dot: 'bg-success', label: 'Completed' },
  delayed:   { color: 'bg-danger/15 text-danger',    dot: 'bg-danger',  label: 'Delayed' },
}

const statusCycle = ['ongoing', 'completed', 'delayed']

export default function TasksPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState('')
  const [showCreate, setShowCreate] = useState(false)
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

  // ── Create task ──
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] })
      setShowCreate(false)
      setForm({ title: '', description: '', assigneeId: '' })
    },
  })

  // ── Update task status ──
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] })
    },
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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('tasks.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">
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
        <div className="relative min-w-[240px]">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm bg-surface-raised border border-border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              text-text-primary transition-all cursor-pointer"
          >
            <option value="">{t('tasks.selectProject')}</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Hover-to-translate hint */}
      {selectedProject && (
        <div className="flex items-center gap-2 px-4 py-3 bg-accent/5 border border-accent/20 rounded-xl text-sm text-accent-dark">
          <Info size={16} className="flex-shrink-0" />
          <span>{t('tasks.hoverToTranslate')}</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error?.message || 'Failed to load tasks'}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {selectedProject && !isLoading && !isError && tasks.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-muted">{t('common.noData')}</p>
        </Card>
      )}

      {/* Task List */}
      {tasks.length > 0 && (
        <Card padding="none">
          <div className="divide-y divide-border">
            {tasks.map((task) => {
              const cfg = statusConfig[task.status] || statusConfig.ongoing
              return (
                <div key={task._id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt/50 transition-colors group">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0`} />

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="hidden sm:block text-sm text-text-secondary min-w-[120px]">
                    {task.assigneeId?.name || '—'}
                  </div>

                  {/* Status badge — click to cycle */}
                  <button
                    onClick={() => cycleStatus(task)}
                    disabled={updateStatusMutation.isPending}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-all hover:opacity-80 ${cfg.color}`}
                    title={t('tasks.clickToChangeStatus')}
                  >
                    {t(`tasks.statusOptions.${task.status}`) || task.status}
                  </button>

                  {/* Date */}
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Create task modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('tasks.newTask')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('tasks.taskName')} *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('tasks.taskName')}
              className="w-full px-4 py-2.5 text-sm bg-surface-alt border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                placeholder:text-text-muted transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('tasks.description')}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('tasks.description')}
              className="w-full px-4 py-2.5 text-sm bg-surface-alt border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                placeholder:text-text-muted transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('tasks.assignee')}
            </label>
            <div className="relative">
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm bg-surface-alt border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  text-text-primary transition-all cursor-pointer"
              >
                <option value="">{t('tasks.unassigned')}</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
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
