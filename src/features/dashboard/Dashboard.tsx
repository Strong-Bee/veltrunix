import { useCallback, useState } from 'react'
import { getAppInfo } from '../../lib/tauri'

interface CardProps {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const [info, setInfo] = useState<{ name: string; version: string; platform: string } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAppInfo()
      setInfo(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat informasi aplikasi dari backend.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Veltrunix Local Development Environment — Status lingkungan pengembangan web lokal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Informasi aplikasi">
          <div className="flex flex-col gap-2">
            {loading && <p className="text-sm text-slate-500">Memuat dari backend…</p>}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Nama:</span> {info.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Versi:</span> {info.version}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Platform:</span> {info.platform}
                </p>
              </>
            )}
            {!info && !loading && !error && (
              <button
                onClick={fetchInfo}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                Periksa informasi aplikasi dari backend
              </button>
            )}
          </div>
        </Card>

        <Card title="Status layanan">
          <p className="text-sm text-slate-500">
            Status layanan (PHP, web server, database) diperiksa langsung dari backend dan
            ditampilkan di sini ketika modul terkait sudah diimplementasikan.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Belum ada pemeriksaan yang dilakukan.
          </p>
        </Card>

        <Card title="Proyek">
          <p className="text-sm text-slate-500">
            Daftar proyek terdaftar dan domain lokal akan muncul di sini setelah modul Project
            Manager diaktifkan.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Belum ada proyek yang terdaftar.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Runtime Manager">
          <p className="text-sm text-slate-500">
            Deteksi dan manajemen versi runtime (mulai dari PHP) akan tersedia pada tahap berikutnya.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Belum diimplementasikan.
          </p>
        </Card>
        <Card title="Layanan &amp; Port">
          <p className="text-sm text-slate-500">
            Pemeriksaan port, PID proses, dan kontrol start/stop layanan akan ditampilkan di sini.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Belum diimplementasikan.
          </p>
        </Card>
      </div>
    </div>
  )
}
