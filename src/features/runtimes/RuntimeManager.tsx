import { useCallback, useState } from 'react'
import { RUNTIME_TYPES, RuntimeInfo } from './types'
import { detectRuntimes } from './api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'

export default function RuntimeManager() {
  const [runtimes, setRuntimes] = useState<RuntimeInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await detectRuntimes()
      setRuntimes(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat deteksi runtime dari backend.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Runtime Manager"
        description="Deteksi dan manajemen versi runtime pengembangan web lokal (PHP, Node.js, npm, Composer, Git)."
        action={
          <Button
            variant="primary"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memuat…
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        }
      />

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="mt-0 p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="pb-3 font-medium text-text-muted uppercase text-xs tracking-wider">Runtime</th>
                  <th className="pb-3 font-medium text-text-muted uppercase text-xs tracking-wider">Status</th>
                  <th className="pb-3 font-medium text-text-muted uppercase text-xs tracking-wider">Versi</th>
                  <th className="pb-3 font-medium text-text-muted uppercase text-xs tracking-wider">Path</th>
                </tr>
              </thead>
              <tbody>
                {runtimes.length === 0 && !loading && !error ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <EmptyState
                        title="Tidak ada data runtime"
                        description="Klik tombol Refresh untuk memulai deteksi dari backend."
                        action={
                          <Button variant="primary" size="sm" onClick={refresh}>
                            Deteksi Runtime
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  RUNTIME_TYPES.map((rt) => {
                    const info = runtimes.find((r) => r.name === rt.key)
                    return (
                      <tr key={rt.key} className="border-b border-surface-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-4">
                          <span className="font-medium text-text-primary">{rt.label}</span>
                        </td>
                        <td className="py-4">
                          {info ? (
                            <StatusBadge status={info.status} variant="runtime" />
                          ) : (
                            <StatusBadge status="Not found" variant="runtime" />
                          )}
                        </td>
                        <td className="py-4">
                          {info?.version ? (
                            <span className="text-sm font-mono text-text-primary">{info.version}</span>
                          ) : (
                            <span className="text-sm text-text-muted">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          {info?.path ? (
                            <span
                              className="text-sm text-text-muted truncate-path"
                              title={info.path}
                            >
                              {info.path}
                            </span>
                          ) : (
                            <span className="text-sm text-text-muted">—</span>
                          )}
                          {info?.error && (
                            <div className="mt-1 text-xs text-destructive">{info.error}</div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!loading && !error && runtimes.length > 0 && (
        <p className="text-xs text-text-muted">
          Status terbaru diperoleh secara langsung dari pemeriksaan backend. Jalankan Refresh untuk
          memperbarui data.
        </p>
      )}
    </div>
  )
}