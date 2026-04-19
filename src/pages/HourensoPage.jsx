import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, ChevronDown, ChevronUp, Calendar, User, Loader2, AlertCircle, FileText } from 'lucide-react'
import { Card, Button, Modal, TextHighlighter } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getProjectReports, createReport } from '@/api/hourenso'
import { getProjects } from '@/api/projects'
import { getGlossary } from '@/api/glossary'
import * as XLSX from 'xlsx'

function HourensoSection({ title, icon: Icon, children, defaultOpen = true, accentColor = 'primary' }) {
  const [open, setOpen] = useState(defaultOpen)

  const colorMap = {
    primary: 'text-primary',
    accent: 'text-accent-dark',
    warning: 'text-warning',
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface-alt/30 hover:bg-surface-alt/60 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={colorMap[accentColor] || 'text-primary'} />}
          <span className="font-medium text-sm text-text-primary">{title}</span>
        </div>
        <div className={`transition-transform duration-200 ${open ? 'rotate-0' : 'rotate-180'}`}>
          <ChevronUp size={14} className="text-text-muted" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-[var(--ease-smooth)] ${
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3.5 py-3 space-y-2.5 text-sm">{children}</div>
      </div>
    </div>
  )
}

function FieldRow({ label, value, glossaryTerms }) {
  return (
    <div>
      <span className="text-text-muted text-[11px] uppercase tracking-wider font-medium">{label}</span>
      <p className="text-text-primary text-sm mt-0.5">
        {value ? <TextHighlighter text={String(value)} glossaryTerms={glossaryTerms} /> : '—'}
      </p>
    </div>
  )
}

const emptyForm = {
  currentStatus: '',
  progress: '',
  issues: '',
  nextSteps: '',
  sharedInformation: '',
  topic: '',
  proposedOptions: '',
  deadline: '',
}

export default function HourensoPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  // ── Fetch projects ──
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // ── Fetch reports ──
  const { data: reports = [], isLoading, isError, error } = useQuery({
    queryKey: ['hourenso', selectedProject],
    queryFn: () => getProjectReports(selectedProject),
    enabled: !!selectedProject,
  })

  // ── Fetch glossary terms ──
  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ['glossary'],
    queryFn: getGlossary,
  })

  // ── Create report ──
  const createMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hourenso', selectedProject] })
      setShowCreate(false)
      setForm({ ...emptyForm })
    },
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.currentStatus.trim() || !form.progress.trim() || !form.nextSteps.trim()) return

    createMutation.mutate({
      projectId: selectedProject,
      houkoku: {
        currentStatus: form.currentStatus,
        progress: form.progress,
        issues: form.issues,
        nextSteps: form.nextSteps,
      },
      renraku: {
        sharedInformation: form.sharedInformation,
      },
      soudan: {
        topic: form.topic,
        proposedOptions: form.proposedOptions
          ? form.proposedOptions.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        deadline: form.deadline || null,
      },
    })
  }

  const handleExportExcel = () => {
    if (!reports.length) return

    const projectName = projects.find((p) => p._id === selectedProject)?.name || 'Unknown'

    const rows = reports.map((r) => ({
      Date: new Date(r.createdAt).toLocaleDateString(),
      Reporter: r.authorId?.name || '—',
      Project: projectName,
      'Houkoku — Status': r.houkoku?.currentStatus || '',
      'Houkoku — Progress': r.houkoku?.progress || '',
      'Houkoku — Issues': r.houkoku?.issues || '',
      'Houkoku — Next Steps': r.houkoku?.nextSteps || '',
      'Renraku — Shared Info': r.renraku?.sharedInformation || '',
      'Soudan — Topic': r.soudan?.topic || '',
      'Soudan — Options': r.soudan?.proposedOptions?.join(', ') || '',
      'Soudan — Deadline': r.soudan?.deadline
        ? new Date(r.soudan.deadline).toLocaleDateString()
        : '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Hourenso Reports')
    ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 40 }))
    XLSX.writeFile(wb, `hourenso_reports_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const canCreateReport = user?.role === 'Developer' || user?.role === 'BrSE' || user?.role === 'PM'

  return (
    <div style={{ maxWidth: '60rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">{t('hourenso.title')}</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">{t('hourenso.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedProject && reports.length > 0 && (
            <Button variant="secondary" icon={Download} onClick={handleExportExcel} size="sm">
              {t('hourenso.exportExcel')}
            </Button>
          )}
          {selectedProject && canCreateReport && (
            <Button icon={Plus} onClick={() => setShowCreate(true)} size="sm">
              {t('hourenso.newReport')}
            </Button>
          )}
        </div>
      </div>

      {/* Project selector */}
      <div className="relative min-w-[220px]" style={{ maxWidth: '22rem' }}>
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

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/10 rounded-lg text-sm text-danger">
          <AlertCircle size={15} />
          <span>{error?.message || 'Failed to load reports'}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Empty state */}
      {selectedProject && !isLoading && !isError && reports.length === 0 && (
        <Card className="empty-state py-14">
          <FileText size={28} />
          <p className="text-sm">{t('common.noData')}</p>
        </Card>
      )}

      {/* Reports */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report._id} className="space-y-3 report-card">
            {/* Report header */}
            <div className="flex items-center gap-3 text-sm text-text-muted pb-2.5 border-b border-border">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{report.authorId?.name || '—'}</span>
              </div>
              {report.authorId?.role && (
                <span className="text-[11px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">
                  {report.authorId.role}
                </span>
              )}
            </div>

            {/* Houkoku */}
            <HourensoSection title={t('hourenso.sections.houkoku')} accentColor="primary">
              <FieldRow label={t('hourenso.fields.currentStatus')} value={report.houkoku?.currentStatus} glossaryTerms={glossaryTerms} />
              <FieldRow label={t('hourenso.fields.progress')} value={report.houkoku?.progress} glossaryTerms={glossaryTerms} />
              <FieldRow label={t('hourenso.fields.issues')} value={report.houkoku?.issues} glossaryTerms={glossaryTerms} />
              <FieldRow label={t('hourenso.fields.nextSteps')} value={report.houkoku?.nextSteps} glossaryTerms={glossaryTerms} />
            </HourensoSection>

            {/* Renraku */}
            <HourensoSection title={t('hourenso.sections.renraku')} defaultOpen={false} accentColor="accent">
              <FieldRow label={t('hourenso.fields.sharedInfo')} value={report.renraku?.sharedInformation} glossaryTerms={glossaryTerms} />
            </HourensoSection>

            {/* Soudan */}
            <HourensoSection title={t('hourenso.sections.soudan')} defaultOpen={false} accentColor="warning">
              <FieldRow label={t('hourenso.fields.consultTopic')} value={report.soudan?.topic} glossaryTerms={glossaryTerms} />
              <FieldRow label={t('hourenso.fields.options')} value={report.soudan?.proposedOptions?.join(', ')} glossaryTerms={glossaryTerms} />
              <FieldRow
                label={t('hourenso.fields.deadline')}
                value={report.soudan?.deadline ? new Date(report.soudan.deadline).toLocaleDateString() : '—'}
                glossaryTerms={glossaryTerms}
              />
            </HourensoSection>
          </Card>
        ))}
      </div>

      {/* Create report modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('hourenso.newReport')} maxWidth="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-5">
          {/* Houkoku section */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t('hourenso.sections.houkoku')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.currentStatus')} *
                </label>
                <textarea
                  required rows={2}
                  value={form.currentStatus}
                  onChange={(e) => setForm({ ...form, currentStatus: e.target.value })}
                  className="form-input resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.progress')} *
                </label>
                <textarea
                  required rows={2}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: e.target.value })}
                  className="form-input resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.issues')}
                </label>
                <textarea
                  rows={2}
                  value={form.issues}
                  onChange={(e) => setForm({ ...form, issues: e.target.value })}
                  className="form-input resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.nextSteps')} *
                </label>
                <textarea
                  required rows={2}
                  value={form.nextSteps}
                  onChange={(e) => setForm({ ...form, nextSteps: e.target.value })}
                  className="form-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Renraku section */}
          <div>
            <h3 className="text-sm font-medium text-accent-dark mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {t('hourenso.sections.renraku')}
            </h3>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {t('hourenso.fields.sharedInfo')}
              </label>
              <textarea
                rows={2}
                value={form.sharedInformation}
                onChange={(e) => setForm({ ...form, sharedInformation: e.target.value })}
                className="form-input resize-none"
              />
            </div>
          </div>

          {/* Soudan section */}
          <div>
            <h3 className="text-sm font-medium text-warning mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {t('hourenso.sections.soudan')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.consultTopic')}
                </label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.options')}
                  <span className="text-text-muted ml-1 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.proposedOptions}
                  onChange={(e) => setForm({ ...form, proposedOptions: e.target.value })}
                  placeholder="Option A, Option B, Option C"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('hourenso.fields.deadline')}
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="form-input"
                />
              </div>
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
    </div>
  )
}
