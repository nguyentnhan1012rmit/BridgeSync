import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, ChevronDown, ChevronUp, Calendar, User, Loader2, AlertCircle, FileText, Sparkles, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { Card, Button, Modal, TextHighlighter } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getProjectReports, createReport, updateReport, deleteReport } from '@/api/hourenso'
import { getProjects } from '@/api/projects'
import { getGlossary } from '@/api/glossary'

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

const reportToForm = (report) => ({
  currentStatus: report.houkoku?.currentStatus || '',
  progress: report.houkoku?.progress || '',
  issues: report.houkoku?.issues || '',
  nextSteps: report.houkoku?.nextSteps || '',
  sharedInformation: report.renraku?.sharedInformation || '',
  topic: report.soudan?.topic || '',
  proposedOptions: report.soudan?.proposedOptions?.join(', ') || '',
  deadline: report.soudan?.deadline ? new Date(report.soudan.deadline).toISOString().slice(0, 10) : '',
})

const languageLabels = {
  en: 'English',
  vi: 'Tiếng Việt',
  ja: '日本語',
}

const textLength = (value) => value.trim().length

const hasDecisionRequest = (form) => {
  return Boolean(
    form.topic.trim() ||
    form.proposedOptions.trim() ||
    form.deadline
  )
}

const getQualityCheck = (form, t) => {
  const suggestions = []
  let score = 100

  const requiredFields = [
    ['currentStatus', 'hourenso.fields.currentStatus'],
    ['progress', 'hourenso.fields.progress'],
    ['issues', 'hourenso.fields.issues'],
    ['nextSteps', 'hourenso.fields.nextSteps'],
  ]

  requiredFields.forEach(([field, labelKey]) => {
    if (!form[field].trim()) {
      suggestions.push(t('hourenso.quality.missingRequired', { field: t(labelKey) }))
      score -= 18
    }
  })

  if (textLength(form.currentStatus) > 0 && textLength(form.currentStatus) < 20) {
    suggestions.push(t('hourenso.quality.statusTooShort'))
    score -= 8
  }

  if (textLength(form.progress) > 0 && !/\d|%|done|complete|completed|finish|finished|進捗|完了|xong|hoàn thành/i.test(form.progress)) {
    suggestions.push(t('hourenso.quality.progressNeedsEvidence'))
    score -= 8
  }

  if (textLength(form.issues) > 0 && textLength(form.nextSteps) < 20) {
    suggestions.push(t('hourenso.quality.issueNeedsNextStep'))
    score -= 10
  }

  if (hasDecisionRequest(form)) {
    if (!form.topic.trim()) {
      suggestions.push(t('hourenso.quality.soudanNeedsTopic'))
      score -= 8
    }

    const optionCount = form.proposedOptions.split(',').map((s) => s.trim()).filter(Boolean).length
    if (optionCount < 2) {
      suggestions.push(t('hourenso.quality.soudanNeedsOptions'))
      score -= 8
    }

    if (!form.deadline) {
      suggestions.push(t('hourenso.quality.soudanNeedsDeadline'))
      score -= 8
    }
  }

  if (!form.sharedInformation.trim()) {
    suggestions.push(t('hourenso.quality.renrakuOptional'))
    score -= 4
  }

  const normalizedScore = Math.max(0, Math.min(100, score))
  const level = normalizedScore >= 85 ? 'strong' : normalizedScore >= 65 ? 'needsReview' : 'incomplete'

  return {
    score: normalizedScore,
    level,
    suggestions: suggestions.slice(0, 5),
  }
}

function QualityCheckPanel({ check, t }) {
  const isStrong = check.level === 'strong'
  const levelClass = isStrong
    ? 'text-success bg-success/10 border-success/20'
    : check.level === 'needsReview'
      ? 'text-warning bg-warning/10 border-warning/20'
      : 'text-danger bg-danger/10 border-danger/20'

  return (
    <div className="border border-border rounded-lg p-3.5 bg-surface-alt/30 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-accent" />
          <div>
            <p className="text-sm font-medium text-text-primary">{t('hourenso.quality.title')}</p>
            <p className="text-xs text-text-muted">{t('hourenso.quality.subtitle')}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${levelClass}`}>
          {check.score}/100
        </span>
      </div>

      {isStrong ? (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 size={15} />
          <span>{t('hourenso.quality.ready')}</span>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {check.suggestions.map((suggestion) => (
            <li key={suggestion} className="flex gap-2 text-sm text-text-secondary">
              <AlertCircle size={14} className="text-warning mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function HourensoPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const qualityCheck = useMemo(() => getQualityCheck(form, t), [form, t])

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
      toast.success(t('hourenso.newReport'), { description: 'Report submitted successfully' })
    },
    onError: (err) => toast.error(err?.message || 'Failed to create report'),
  })

  const buildReportPayload = () => ({
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

  const updateMutation = useMutation({
    mutationFn: ({ reportId, reportData }) => updateReport(reportId, reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hourenso', selectedProject] })
      setEditingReport(null)
      setForm({ ...emptyForm })
      toast.success('Report updated')
    },
    onError: (err) => toast.error(err?.message || 'Failed to update report'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hourenso', selectedProject] })
      toast.success('Report deleted')
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete report'),
  })

  const handleSubmitReport = (e) => {
    e.preventDefault()
    if (!form.currentStatus.trim() || !form.progress.trim() || !form.issues.trim() || !form.nextSteps.trim()) return

    const reportData = buildReportPayload()

    if (editingReport) {
      updateMutation.mutate({ reportId: editingReport._id, reportData })
    } else {
      createMutation.mutate(reportData)
    }
  }

  const openEditReport = (report) => {
    setEditingReport(report)
    setForm(reportToForm(report))
  }

  const closeReportModal = () => {
    setShowCreate(false)
    setEditingReport(null)
    setForm({ ...emptyForm })
  }

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Delete this Hourenso report?')) {
      deleteMutation.mutate(reportId)
    }
  }

  const handleExportExcel = async () => {
    if (!reports.length) return

    setIsExporting(true)
    setExportError('')

    try {
      const ExcelJSImport = await import('exceljs')
      const ExcelJS = ExcelJSImport.default || ExcelJSImport
      const projectName = selectedProjectData?.name || 'Unknown'
      const projectLanguage = languageLabels[selectedProjectData?.preferredLanguage] || languageLabels.ja

      const rows = reports.map((r) => ({
        Date: new Date(r.createdAt).toLocaleDateString(),
        Reporter: r.authorId?.name || '—',
        Project: projectName,
        'Preferred Language': projectLanguage,
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

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Hourenso Reports')
      worksheet.columns = Object.keys(rows[0]).map((key) => ({
        header: key,
        key,
        width: 40,
      }))
      worksheet.addRows(rows)
      worksheet.getRow(1).font = { bold: true }
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hourenso_reports_${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError('Failed to export reports. Please try again.')
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const canCreateReport = user?.role === 'Developer' || user?.role === 'BrSE' || user?.role === 'PM'
  const selectedProjectData = projects.find((p) => p._id === selectedProject)

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
            <Button variant="secondary" icon={Download} onClick={handleExportExcel} size="sm" disabled={isExporting}>
              {isExporting ? t('common.loading') : t('hourenso.exportExcel')}
            </Button>
          )}
          {selectedProject && canCreateReport && (
            <Button icon={Plus} onClick={() => { setShowCreate(true); setForm({ ...emptyForm }) }} size="sm">
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

      {selectedProjectData?.preferredLanguage && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/10 rounded-lg text-sm text-accent-dark">
          <span className="font-medium">{t('projects.preferredLanguage')}:</span>
          <span>{languageLabels[selectedProjectData.preferredLanguage] || languageLabels.ja}</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/10 rounded-lg text-sm text-danger">
          <AlertCircle size={15} />
          <span>{error?.message || 'Failed to load reports'}</span>
        </div>
      )}

      {exportError && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/10 rounded-lg text-sm text-danger">
          <AlertCircle size={15} />
          <span>{exportError}</span>
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
              {canCreateReport && (
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditReport(report)}
                    className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/8"
                    title="Edit report"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReport(report._id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/8"
                    title="Delete report"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
      <Modal open={showCreate || Boolean(editingReport)} onClose={closeReportModal} title={editingReport ? 'Edit Hourenso report' : t('hourenso.newReport')} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmitReport} className="space-y-5">
          <QualityCheckPanel check={qualityCheck} t={t} />

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

          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-sm text-danger">{createMutation.error?.message || updateMutation.error?.message}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={closeReportModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending
                ? t('common.loading')
                : editingReport ? 'Save' : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
