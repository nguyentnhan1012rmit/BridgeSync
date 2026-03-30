import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui'

const glossaryData = [
  { term: 'API', en: 'Application Programming Interface', vi: 'Giao diện lập trình ứng dụng', ja: 'アプリケーション・プログラミング・インターフェース', category: 'Architecture' },
  { term: 'CI/CD', en: 'Continuous Integration / Continuous Deployment', vi: 'Tích hợp liên tục / Triển khai liên tục', ja: '継続的インテグレーション / 継続的デプロイメント', category: 'DevOps' },
  { term: 'Sprint', en: 'Fixed time-box for development iteration', vi: 'Chu kỳ phát triển cố định (thường 2 tuần)', ja: 'スプリント — 開発の反復期間', category: 'Agile' },
  { term: 'Backlog', en: 'Prioritized list of pending work', vi: 'Danh sách công việc chờ xử lý theo ưu tiên', ja: 'バックログ — 優先順位付きの保留タスクリスト', category: 'Agile' },
  { term: 'Pull Request', en: 'Code review request before merging', vi: 'Yêu cầu xem xét mã trước khi hợp nhất', ja: 'プルリクエスト — マージ前のコードレビュー依頼', category: 'Git' },
  { term: 'Staging', en: 'Pre-production test environment', vi: 'Môi trường kiểm thử trước sản xuất', ja: 'ステージング — 本番前のテスト環境', category: 'DevOps' },
  { term: 'Hotfix', en: 'Emergency production bug fix', vi: 'Sửa lỗi khẩn cấp trên production', ja: 'ホットフィックス — 本番環境の緊急バグ修正', category: 'DevOps' },
  { term: 'Refactoring', en: 'Restructuring code without changing behavior', vi: 'Tái cấu trúc mã không thay đổi hành vi', ja: 'リファクタリング — 動作を変えずにコードを再構築', category: 'Engineering' },
  { term: 'Middleware', en: 'Software layer between OS and application', vi: 'Phần mềm trung gian giữa hệ điều hành và ứng dụng', ja: 'ミドルウェア — OSとアプリの間のソフトウェア層', category: 'Architecture' },
  { term: 'Schema', en: 'Database structure definition', vi: 'Định nghĩa cấu trúc cơ sở dữ liệu', ja: 'スキーマ — データベース構造の定義', category: 'Database' },
]

const categories = [...new Set(glossaryData.map((g) => g.category))]

export default function GlossaryPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filtered = glossaryData.filter((item) => {
    const matchSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.en.toLowerCase().includes(search.toLowerCase()) ||
      item.vi.toLowerCase().includes(search.toLowerCase()) ||
      item.ja.includes(search)

    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory

    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('glossary.title')}</h1>
        <p className="text-text-secondary text-sm mt-1">
          {glossaryData.length} IT terms with trilingual definitions
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('glossary.searchTerms')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-surface-raised border border-border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              placeholder:text-text-muted transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-all
              ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:text-text-primary'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-all
                ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:text-text-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt/50 border-b border-border">
                <th className="text-left px-6 py-3.5 font-medium text-text-secondary">{t('glossary.term')}</th>
                <th className="text-left px-6 py-3.5 font-medium text-text-secondary">{t('glossary.english')}</th>
                <th className="text-left px-6 py-3.5 font-medium text-text-secondary">{t('glossary.vietnamese')}</th>
                <th className="text-left px-6 py-3.5 font-medium text-text-secondary">{t('glossary.japanese')}</th>
                <th className="text-left px-6 py-3.5 font-medium text-text-secondary">{t('glossary.category')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.term} className="hover:bg-surface-alt/30 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-primary whitespace-nowrap">{item.term}</td>
                  <td className="px-6 py-3.5 text-text-primary">{item.en}</td>
                  <td className="px-6 py-3.5 text-text-primary">{item.vi}</td>
                  <td className="px-6 py-3.5 text-text-primary">{item.ja}</td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs bg-surface-alt text-text-secondary px-2 py-1 rounded-md font-medium">
                      {item.category}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
