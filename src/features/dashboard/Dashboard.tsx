import { useCallback, useState } from 'react'
import { getAppInfo } from '../../lib/tauri'
import { detectRuntimes } from '../runtimes/api'
import { detectNginx } from '../nginx/api'
import { listVhosts } from '../vhosts/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'

interface ServiceStatus {
  label: string
  status: 'Installed' | 'Not found' | 'Running' | 'Stopped' | 'Error'
  version: string | null
}

export default function Dashboard() {
  const [info, setInfo] = useState<{ name: string; version: string; platform: string } | null>(
    null,
  )
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [appInfo, runtimes, nginx, vhosts] = await Promise.allSettled([
        getAppInfo(),
        detectRuntimes(),
        detectNginx(),
        listVhosts(),
      ])

      if (appInfo.status === 'fulfilled') {
        setInfo(appInfo.value)
      }

      const serviceList: ServiceStatus[] = []

      if (runtimes.status === 'fulfilled') {
        const php = runtimes.value.find((r) => r.name === 'php')
        serviceList.push({
          label: 'PHP',
          status: php?.status ?? 'Not found',
          version: php?.version ?? null,
        })
      }

      if (nginx.status === 'fulfilled') {
        serviceList.push({
          label: 'Nginx',
          status: nginx.value.status,
          version: nginx.value.version ?? null,
        })
      }

      if (vhosts.status === 'fulfilled') {
        serviceList.push({
          label: 'Virtual Hosts',
          status: vhosts.value.length > 0 ? 'Installed' : 'Not found',
          version: null,
        })
      }

      setServices(serviceList)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat informasi dari backend.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Veltrunix Local Development Environment — Status lingkungan pengembangan web lokal."
      />

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader title="Informasi aplikasi" />
          <CardContent className="mt-4 flex flex-col gap-3">
            {loading && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-text-muted">Memuat dari backend…</span>
              </div>
            )}
            {info && (
              <>
                <div className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <span className="text-sm text-text-muted">Nama</span>
                  <span className="text-sm font-mono text-text-primary">{info.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <span className="text-sm text-text-muted">Versi</span>
                  <span className="text-sm font-mono text-text-primary">{info.version}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-muted">Platform</span>
                  <span className="text-sm font-mono text-text-primary">{info.platform}</span>
                </div>
              </>
            )}
            {!info && !loading && !error && (
              <Button variant="outline" size="sm" onClick={fetchInfo}>
                Periksa informasi aplikasi
              </Button>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="Status layanan" />
          <CardContent className="mt-4">
            <div className="space-y-3">
              {services.map((svc) => (
                <div
                  key={svc.label}
                  className="flex items-center justify-between py-3 border-b border-surface-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{svc.label}</p>
                    {svc.version && (
                      <p className="text-xs text-text-muted font-mono">
                        {svc.version}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={svc.status} variant="nginx" />
                </div>
              ))}
              {services.length === 0 && !loading && !error && (
                <p className="text-sm text-text-muted">
                  Belum ada pemeriksaan yang dilakukan.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="Aksi cepat" />
          <CardContent className="mt-4 space-y-3">
            <Button variant="primary" size="sm" className="w-full sm:w-auto" onClick={fetchInfo}>
              Deteksi Semua Runtime
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Deteksi Nginx
            </Button>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              Kelola Virtual Host
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader
            title="Runtime Manager"
            description="Deteksi dan manajemen versi runtime pengembangan web lokal (PHP, Node.js, npm, Composer, Git)."
          />
          <CardContent className="mt-4">
            <EmptyState
              title="Belum ada data runtime"
              description="Klik tombol di bawah untuk memulai deteksi runtime dari backend."
              action={
                <Button variant="primary" size="sm" onClick={fetchInfo}>
                  Deteksi Runtime
                </Button>
              }
            />
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader
            title="Layanan & Port"
            description="Pemeriksaan port, PID proses, dan kontrol start/stop layanan akan ditampilkan di sini."
          />
          <CardContent className="mt-4">
            <EmptyState
              title="Belum diimplementasikan"
              description="Modul layanan akan tersedia pada tahap pengembangan berikutnya."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}