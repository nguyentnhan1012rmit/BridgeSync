import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Loader2, AlertCircle, BookOpen } from 'lucide-react'
import { Card, Button, Modal } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getGlossary, addGlossaryTerm } from '@/api/glossary'

export default function GlossaryPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ baseTerm: '', en: '', vi: '', ja: '' })

  // ── Fetch glossary ──
  const { data: glossaryData = [], isLoading, isError, error } = useQuery({
    queryKey: ['glossary'],
    queryFn: getGlossary,
  })

  // ── Add term ──
  const addMutation = useMutation({
    mutationFn: addGlossaryTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] })
      setShowAdd(false)
      setForm({ baseTerm: '', en: '', vi: '', ja: '' })
    },
  })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.baseTerm.trim()) return
    addMutation.mutate({
      baseTerm: form.baseTerm,
      translations: { en: form.en, vi: form.vi, ja: form.ja },
    })
  }

  const filtered = glossaryData.filter((item) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.baseTerm?.toLowerCase().includes(q) ||
      item.translations?.en?.toLowerCase().includes(q) ||
      item.translations?.vi?.toLowerCase().includes(q) ||
      item.translations?.ja?.includes(search)
    )
  })

  return (
    <div className="space-y-6" style={{ maxWidth: '80rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('glossary.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">
            {isLoading ? t('common.loading') : `${glossaryData.length} IT terms with trilingual definitions`}
          </p>
        </div>
        {user?.role === 'BrSE' && (
          <Button icon={Plus} onClick={() => setShowAdd(true)}>
            {t('glossary.addTerm')}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]" style={{ maxWidth: '28rem' }}>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('glossary.searchTerms')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2.5 p-4 bg-danger/8 border border-danger/15 rounded-2xl text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error?.message || 'Failed to load glossary'}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('glossary.term')}</th>
                  <th>{t('glossary.english')}</th>
                  <th>{t('glossary.vietnamese')}</th>
                  <th>{t('glossary.japanese')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td className="font-semibold text-primary whitespace-nowrap">{item.baseTerm}</td>
                    <td className="text-text-primary">{item.translations?.en}</td>
                    <td className="text-text-primary">{item.translations?.vi}</td>
                    <td className="text-text-primary">{item.translations?.ja}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state py-12">
                        <BookOpen size={32} />
                        <p className="text-sm">{t('common.noData')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add term modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('glossary.addTerm')}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('glossary.term')} *
            </label>
            <input
              type="text"
              required
              value={form.baseTerm}
              onChange={(e) => setForm({ ...form, baseTerm: e.target.value })}
              placeholder="e.g. Deployment"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('glossary.english')} *
            </label>
            <input
              type="text"
              required
              value={form.en}
              onChange={(e) => setForm({ ...form, en: e.target.value })}
              placeholder="English definition"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('glossary.vietnamese')} *
            </label>
            <input
              type="text"
              required
              value={form.vi}
              onChange={(e) => setForm({ ...form, vi: e.target.value })}
              placeholder="Định nghĩa tiếng Việt"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t('glossary.japanese')} *
            </label>
            <input
              type="text"
              required
              value={form.ja}
              onChange={(e) => setForm({ ...form, ja: e.target.value })}
              placeholder="日本語の定義"
              className="form-input"
            />
          </div>

          {addMutation.isError && (
            <p className="text-sm text-danger">{addMutation.error?.message}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? t('common.loading') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
