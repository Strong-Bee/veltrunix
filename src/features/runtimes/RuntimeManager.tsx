import { useCallback, useState } from 'react'
import { RUNTIME_TYPES, RuntimeInfo, RuntimeStatus } from './types'
import { detectRuntimes } from './api'

function StatusBadge({ status }: { status: RuntimeStatus }) {
  const config: Record<RuntimeStatus, { bg: string; text: string; border: string }> = {
    Installed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Not found': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    Error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }

  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {status === 'Installed' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      ) : null}
      {status}
    </span>
  )
}

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Runtime Manager</h1>
        <p className="mt-1 text-slate-500">
          Deteksi dan manajemen versi runtime pengembangan web lokal (PHP, Node.js, npm,
          Composer, Git).
        </p>
      </div>

      <button
        onClick={refresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 font-medium text-slate-500 uppercase text-xs tracking-wider">Runtime</th>
              <th className="pb-3 font-medium text-slate-500 uppercase text-xs tracking-wider">Status</th>
              <th className="pb-3 font-medium text-slate-500 uppercase text-xs tracking-wider">Versi</th>
              <th className="pb-3 font-medium text-slate-500 uppercase text-xs tracking-wider">Path</th>
            </tr>
          </thead>
          <tbody>
            {runtimes.length === 0 && !loading && !error ? (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">
                    Tidak ada data runtime. Klik tombol Refresh untuk memulai deteksi dari backend.
                  </p>
                </td>
              </tr>
            ) : (
              RUNTIME_TYPES.map((rt) => {
                const info = runtimes.find((r) => r.name === rt.key)
                return (
                  <tr key={rt.key} className="border-b border-slate-100 last:border-0">
                    <td className="py-4">
                      <span className="font-medium text-slate-900">{rt.label}</span>
                    </td>
                    <td className="py-4">
                      {info ? <StatusBadge status={info.status} /> : <StatusBadge status="Not found" />}
                    </td>
                    <td className="py-4">
                      {info?.version ? (
                        <span className="text-sm font-mono text-slate-700">{info.version}</span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4">
                      {info?.path ? (
                        <span className="text-sm text-slate-500 truncate max-w-xs" title={info.path}>
                          {info.path}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                      {info?.error && (
                        <div className="mt-1 text-xs text-red-600">{info.error}</div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && runtimes.length > 0 && (
        <p className="text-xs text-slate-400">
          Status terbaru diperoleh secara langsung dari pemeriksaan backend. Jalankan Refresh untuk
          memperbarui data.
        </p>
      )}
    </div>
  )
}
