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
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Informasi aplikasi" />
          <CardContent className="mt-4 flex flex-col gap-2">
            {loading && <p className="text-sm text-muted-foreground">Memuat dari backend…</p>}
            {info && (
              <>
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Nama:</span>{' '}
                  <span className="text-foreground">{info.name}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Versi:</span>{' '}
                  <span className="text-foreground">{info.version}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Platform:</span>{' '}
                  <span className="text-foreground">{info.platform}</span>
                </p>
              </>
            )}
            {!info && !loading && !error && (
              <Button variant="ghost" size="sm" onClick={fetchInfo}>
                Periksa informasi aplikasi
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Status layanan" />
          <CardContent className="mt-4">
            <div className="space-y-3">
              {services.map((svc) => (
                <div
                  key={svc.label}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{svc.label}</p>
                    {svc.version && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {svc.version}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={svc.status} variant="nginx" />
                </div>
              ))}
              {services.length === 0 && !loading && !error && (
                <p className="text-sm text-muted-foreground">
                  Belum ada pemeriksaan yang dilakukan.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Aksi cepat" />
          <CardContent className="mt-4 space-y-3">
            <Button variant="primary" size="sm" className="w-full">
              Deteksi Semua Runtime
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Deteksi Nginx
            </Button>
            <Button variant="ghost" size="sm" className="w-full">
              Kelola Virtual Host
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Runtime Manager" description="Deteksi dan manajemen versi runtime (PHP, Node.js, npm, Composer, Git)." />
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
        <Card>
          <CardHeader title="Layanan &amp; Port" description="Pemeriksaan port, PID proses, dan kontrol start/stop layanan akan ditampilkan di sini." />
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