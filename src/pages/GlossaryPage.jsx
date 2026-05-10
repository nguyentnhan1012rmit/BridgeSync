import { useDeferredValue, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Loader2, AlertCircle, BookOpen, Upload, CheckCircle2 } from 'lucide-react'
import { Card, Button, Modal } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { getGlossary, addGlossaryTerm, importGlossaryTerms } from '@/api/glossary'

const normalizeHeader = (value) => String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '')

const getCell = (row, candidates) => {
  const entries = Object.entries(row)
  const found = entries.find(([key]) => candidates.includes(normalizeHeader(key)))
  return found ? String(found[1] || '').trim() : ''
}

const mapRowsToTerms = (rows) => {
  return rows.map((row) => ({
    baseTerm: getCell(row, ['baseterm', 'term', 'keyword', 'source']),
    translations: {
      en: getCell(row, ['en', 'english', 'englishdefinition']),
      vi: getCell(row, ['vi', 'vietnamese', 'vietnamesedefinition']),
      ja: getCell(row, ['ja', 'jp', 'japanese', 'japanesedefinition']),
    },
  })).filter((term) => term.baseTerm || term.translations.en || term.translations.vi || term.translations.ja)
}

const parseCsvRows = (text) => {
  const rows = []
  let current = ''
  let row = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && next === '"') {
      current += '"'
      i += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(current)
      rows.push(row)
      row = []
      current = ''
    } else {
      current += char
    }
  }

  if (current || row.length) {
    row.push(current)
    rows.push(row)
  }

  const [headers = [], ...dataRows] = rows.filter((items) => items.some((item) => item.trim()))
  return dataRows.map((items) => {
    return headers.reduce((acc, header, index) => {
      acc[header] = items[index] || ''
      return acc
    }, {})
  })
}

const parseExcelRows = async (file) => {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return parseCsvRows(await file.text())
  }

  const ExcelJSImport = await import('exceljs')
  const ExcelJS = ExcelJSImport.default || ExcelJSImport
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const worksheet = workbook.worksheets[0]

  if (!worksheet) return []

  const headers = []
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, columnNumber) => {
    headers[columnNumber - 1] = cell.text || String(cell.value || '')
  })

  const rows = []
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return

    const item = {}
    headers.forEach((header, index) => {
      item[header] = row.getCell(index + 1).text || String(row.getCell(index + 1).value || '')
    })
    rows.push(item)
  })

  return rows
}

export default function GlossaryPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ baseTerm: '', en: '', vi: '', ja: '' })
  const [importResult, setImportResult] = useState(null)
  const deferredSearch = useDeferredValue(search)

  // ── Fetch glossary ──
  const { data: glossaryResponse = {}, isLoading, isError, error } = useQuery({
    queryKey: ['glossaryPage', deferredSearch, page],
    queryFn: () => getGlossary({ search: deferredSearch, page, limit: 20 }),
  })
  const glossaryData = glossaryResponse.items || []
  const pagination = glossaryResponse.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 }

  // ── Add term ──
  const addMutation = useMutation({
    mutationFn: addGlossaryTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] })
      queryClient.invalidateQueries({ queryKey: ['glossaryPage'] })
      setShowAdd(false)
      setForm({ baseTerm: '', en: '', vi: '', ja: '' })
      toast.success(t('glossary.addTerm'), { description: 'Term added successfully' })
    },
    onError: (err) => toast.error(err?.message || 'Failed to add term'),
  })

  const importMutation = useMutation({
    mutationFn: importGlossaryTerms,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] })
      queryClient.invalidateQueries({ queryKey: ['glossaryPage'] })
      setImportResult(result)
      toast.success(`Imported ${result?.imported ?? 0} terms`)
    },
    onError: (err) => toast.error(err?.message || 'Import failed'),
  })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.baseTerm.trim()) return
    addMutation.mutate({
      baseTerm: form.baseTerm,
      translations: { en: form.en, vi: form.vi, ja: form.ja },
    })
  }

  const handleImportClick = () => {
    setImportResult(null)
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''

    if (!file) return

    try {
      const rows = await parseExcelRows(file)
      const terms = mapRowsToTerms(rows)

      if (terms.length === 0) {
        setImportResult({ imported: 0, skipped: 0, invalid: 0, message: t('glossary.importNoRows') })
        return
      }

      importMutation.mutate(terms)
    } catch {
      setImportResult({ imported: 0, skipped: 0, invalid: 0, message: t('glossary.importFailed') })
    }
  }

  return (
    <div style={{ maxWidth: '76rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }} className="text-text-primary">{t('glossary.title')}</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }} className="text-text-muted">
            {isLoading ? t('common.loading') : `${pagination.total} trilingual terms`}
          </p>
        </div>
        {user?.role === 'BrSE' && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleImportFile}
              className="hidden"
            />
            <Button variant="secondary" icon={Upload} onClick={handleImportClick} disabled={importMutation.isPending}>
              {importMutation.isPending ? t('common.loading') : t('glossary.importTerms')}
            </Button>
            <Button icon={Plus} onClick={() => setShowAdd(true)}>
              {t('glossary.addTerm')}
            </Button>
          </div>
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
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

      {(importResult || importMutation.isError) && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          importMutation.isError
            ? 'bg-danger/5 border border-danger/10 text-danger'
            : 'bg-success/5 border border-success/10 text-success'
        }`}>
          {importMutation.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>
            {importMutation.isError
              ? importMutation.error?.message || t('glossary.importFailed')
              : importResult?.message || t('glossary.importResult', {
                  imported: importResult?.imported ?? 0,
                  skipped: importResult?.skipped ?? 0,
                })}
          </span>
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
                {glossaryData.map((item) => (
                  <tr key={item._id}>
                    <td className="font-medium text-primary whitespace-nowrap">{item.baseTerm}</td>
                    <td className="text-text-primary">{item.translations?.en}</td>
                    <td className="text-text-primary">{item.translations?.vi}</td>
                    <td className="text-text-primary">{item.translations?.ja}</td>
                  </tr>
                ))}
                {glossaryData.length === 0 && (
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

      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
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
