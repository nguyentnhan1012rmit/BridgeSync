import { useTranslation } from 'react-i18next'
import { Plus, Info } from 'lucide-react'
import { Card, Button, TranslateTooltip } from '@/components/ui'

const itGlossary = {
  'API': {
    en: 'Application Programming Interface',
    vi: 'Giao diện lập trình ứng dụng',
    ja: 'アプリケーション・プログラミング・インターフェース',
  },
  'CI/CD': {
    en: 'Continuous Integration / Continuous Deployment',
    vi: 'Tích hợp liên tục / Triển khai liên tục',
    ja: '継続的インテグレーション / 継続的デプロイメント',
  },
  'Sprint': {
    en: 'A fixed time-box for development iteration',
    vi: 'Chu kỳ phát triển cố định (thường 2 tuần)',
    ja: 'スプリント — 開発の反復期間（通常2週間）',
  },
  'Backlog': {
    en: 'Prioritized list of pending work items',
    vi: 'Danh sách công việc chờ xử lý theo ưu tiên',
    ja: 'バックログ — 優先順位付きの保留タスクリスト',
  },
}

const mockTasks = [
  {
    id: 1,
    name: 'Implement REST API endpoints',
    assignee: 'Nguyen Van A',
    priority: 'high',
    dueDate: '2026-04-02',
    project: 'Project Sakura',
    terms: ['API'],
  },
  {
    id: 2,
    name: 'Setup CI/CD pipeline for staging',
    assignee: 'Tran Thi B',
    priority: 'medium',
    dueDate: '2026-04-05',
    project: 'Project Sakura',
    terms: ['CI/CD'],
  },
  {
    id: 3,
    name: 'Complete Sprint 5 backlog items',
    assignee: 'Le Van C',
    priority: 'high',
    dueDate: '2026-04-01',
    project: 'CRM Migration',
    terms: ['Sprint', 'Backlog'],
  },
  {
    id: 4,
    name: 'Database schema review',
    assignee: 'Pham Thi D',
    priority: 'low',
    dueDate: '2026-04-10',
    project: 'Payment Gateway',
    terms: [],
  },
]

const priorityConfig = {
  high: { color: 'bg-danger/15 text-danger', dot: 'bg-danger' },
  medium: { color: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  low: { color: 'bg-info/15 text-info', dot: 'bg-info' },
}

function highlightTerms(text, terms) {
  if (!terms.length) return text

  const parts = []
  let remaining = text
  let key = 0

  for (const term of terms) {
    const idx = remaining.indexOf(term)
    if (idx === -1) continue

    if (idx > 0) parts.push(remaining.slice(0, idx))

    parts.push(
      <TranslateTooltip key={key++} term={term} translations={itGlossary[term]}>
        {term}
      </TranslateTooltip>
    )

    remaining = remaining.slice(idx + term.length)
  }

  if (remaining) parts.push(remaining)
  return parts.length ? parts : text
}

export default function TasksPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('tasks.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">{mockTasks.length} tasks across all projects</p>
        </div>
        <Button icon={Plus}>{t('tasks.newTask')}</Button>
      </div>

      {/* Hover to translate hint */}
      <div className="flex items-center gap-2 px-4 py-3 bg-accent/5 border border-accent/20 rounded-xl text-sm text-accent-dark">
        <Info size={16} className="flex-shrink-0" />
        <span>{t('tasks.hoverToTranslate')}</span>
      </div>

      {/* Task List */}
      <Card padding="none">
        <div className="divide-y divide-border">
          {mockTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt/50 transition-colors group">
              {/* Priority dot */}
              <div className={`w-2.5 h-2.5 rounded-full ${priorityConfig[task.priority].dot} flex-shrink-0`} />

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {highlightTerms(task.name, task.terms)}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{task.project}</p>
              </div>

              {/* Assignee */}
              <div className="hidden sm:block text-sm text-text-secondary min-w-[120px]">
                {task.assignee}
              </div>

              {/* Priority badge */}
              <span className={`hidden md:inline-block text-xs font-medium px-2 py-0.5 rounded-full ${priorityConfig[task.priority].color}`}>
                {t(`tasks.priorityOptions.${task.priority}`)}
              </span>

              {/* Due date */}
              <span className="text-xs text-text-muted whitespace-nowrap">{task.dueDate}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
