import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import * as XLSX from 'xlsx'

const mockReports = [
  {
    id: 1,
    date: '2026-03-28',
    reporter: 'Nguyen Van A',
    project: 'Project Sakura',
    houkoku: {
      currentStatus: 'API integration 72% complete. 3 of 5 endpoints functional.',
      progress: 'Completed user authentication and order endpoints. Payment endpoint in progress.',
      issues: 'DeepL API rate limit reached during batch translation testing.',
      nextSteps: 'Implement payment webhook handler by EOD Friday.',
    },
    renraku: {
      sharedInfo: 'Client request: Add CSV export feature for Q2 reporting. Not in original spec — need scope discussion.',
    },
    soudan: {
      consultTopic: 'Should we use WebSocket or polling for real-time notification?',
      options: 'Option A: WebSocket (lower latency, higher complexity). Option B: Long-polling (simpler, sufficient for current scale).',
      deadline: '2026-04-01',
    },
  },
  {
    id: 2,
    date: '2026-03-25',
    reporter: 'Tran Thi B',
    project: 'CRM Migration',
    houkoku: {
      currentStatus: 'Data migration script tested on staging. 95% accuracy on record mapping.',
      progress: 'Completed customer and order table mapping. Product catalog pending.',
      issues: 'Legacy field "custom_note" has inconsistent encoding (Shift-JIS vs UTF-8).',
      nextSteps: 'Implement encoding detection utility. Run full migration dry-run by Wednesday.',
    },
    renraku: {
      sharedInfo: 'Staging environment credentials have been rotated. New credentials shared via secure channel.',
    },
    soudan: {
      consultTopic: 'How to handle 500+ records with corrupt Shift-JIS characters?',
      options: 'Option A: Auto-convert with fallback to "?" for unreadable chars. Option B: Manual review queue for corrupted records.',
      deadline: '2026-03-30',
    },
  },
]

function HourensoSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-alt/50 hover:bg-surface-alt cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-primary" />}
          <span className="font-medium text-sm text-text-primary">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>
      {open && <div className="px-4 py-3 space-y-2 text-sm">{children}</div>}
    </div>
  )
}

function FieldRow({ label, value }) {
  return (
    <div>
      <span className="text-text-muted text-xs uppercase tracking-wider">{label}</span>
      <p className="text-text-primary mt-0.5">{value}</p>
    </div>
  )
}

export default function HourensoPage() {
  const { t } = useTranslation()

  const handleExportExcel = () => {
    const rows = mockReports.map((r) => ({
      Date: r.date,
      Reporter: r.reporter,
      Project: r.project,
      'Houkoku — Status': r.houkoku.currentStatus,
      'Houkoku — Progress': r.houkoku.progress,
      'Houkoku — Issues': r.houkoku.issues,
      'Houkoku — Next Steps': r.houkoku.nextSteps,
      'Renraku — Shared Info': r.renraku.sharedInfo,
      'Soudan — Topic': r.soudan.consultTopic,
      'Soudan — Options': r.soudan.options,
      'Soudan — Deadline': r.soudan.deadline,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Hourenso Reports')

    ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 40 }))

    XLSX.writeFile(wb, `hourenso_reports_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('hourenso.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">{t('hourenso.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="accent" icon={Download} onClick={handleExportExcel}>
            {t('hourenso.exportExcel')}
          </Button>
          <Button icon={Plus}>{t('hourenso.newReport')}</Button>
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-6">
        {mockReports.map((report) => (
          <Card key={report.id} className="space-y-4">
            {/* Report header */}
            <div className="flex items-center gap-4 text-sm text-text-secondary pb-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{report.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{report.reporter}</span>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {report.project}
              </span>
            </div>

            {/* Houkoku */}
            <HourensoSection title={t('hourenso.sections.houkoku')}>
              <FieldRow label={t('hourenso.fields.currentStatus')} value={report.houkoku.currentStatus} />
              <FieldRow label={t('hourenso.fields.progress')} value={report.houkoku.progress} />
              <FieldRow label={t('hourenso.fields.issues')} value={report.houkoku.issues} />
              <FieldRow label={t('hourenso.fields.nextSteps')} value={report.houkoku.nextSteps} />
            </HourensoSection>

            {/* Renraku */}
            <HourensoSection title={t('hourenso.sections.renraku')} defaultOpen={false}>
              <FieldRow label={t('hourenso.fields.sharedInfo')} value={report.renraku.sharedInfo} />
            </HourensoSection>

            {/* Soudan */}
            <HourensoSection title={t('hourenso.sections.soudan')} defaultOpen={false}>
              <FieldRow label={t('hourenso.fields.consultTopic')} value={report.soudan.consultTopic} />
              <FieldRow label={t('hourenso.fields.options')} value={report.soudan.options} />
              <FieldRow label={t('hourenso.fields.deadline')} value={report.soudan.deadline} />
            </HourensoSection>
          </Card>
        ))}
      </div>
    </div>
  )
}
