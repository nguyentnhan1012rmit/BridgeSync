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
    <div style={{ maxWidth: '76rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">{t('glossary.title')}</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">
            {isLoading ? t('common.loading') : `${glossaryData.length} trilingual terms`}
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
        <div className="relative flex-1 min-w-[220px]" style={{ maxWidth: '24rem' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('glossary.searchTerms')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-8 text-sm"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/10 rounded-lg text-sm text-danger">
          <AlertCircle size={15} />
          <span>{error?.message || 'Failed to load glossary'}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-text-muted" />
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
                    <td className="font-medium text-primary whitespace-nowrap">{item.baseTerm}</td>
                    <td className="text-text-primary">{item.translations?.en}</td>
                    <td className="text-text-primary">{item.translations?.vi}</td>
                    <td className="text-text-primary">{item.translations?.ja}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state py-10">
                        <BookOpen size={24} />
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
        <form onSubmit={handleAdd} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
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
            <label className="block text-sm font-medium text-text-secondary mb-1">
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
            <label className="block text-sm font-medium text-text-secondary mb-1">
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
            <label className="block text-sm font-medium text-text-secondary mb-1">
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

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>
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
