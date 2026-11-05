import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { detectNginx, controlNginx, type NginxInfo } from '../nginx/api'
import { detectPhp, detectPhpCgi, startPhpCgi, stopPhpCgi, getPhpCgiStatus, type PhpInfo, type PhcgiStatus } from '../php/api'

type ServiceState = 'Running' | 'Stopped' | 'Installed' | 'Not found' | 'Error' | 'Unavailable'

function normalizeStatus(value: unknown): ServiceState {
  const status = String(value ?? '').toLowerCase().replace(/[ _-]/g, '')
  if (status === 'running') return 'Running'
  if (status === 'stopped') return 'Stopped'
  if (status === 'installed') return 'Installed'
  if (status === 'notfound' || status === 'not found') return 'Not found'
  if (status === 'error') return 'Error'
  return 'Unavailable'
}

function ServiceCard({ title, description, status, detail, children }: {
  title: string
  description: string
  status: ServiceState
  detail?: string | null
  children?: React.ReactNode
}) {
  return (
    <Card variant="elevated">
      <CardHeader title={title} description={description} />
      <CardContent className="mt-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={status} variant="nginx" />
          {detail && <span className="text-xs text-text-muted font-mono truncate">{detail}</span>}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export default function Services() {
  const [nginx, setNginx] = useState<NginxInfo | null>(null)
  const [php, setPhp] = useState<PhpInfo | null>(null)
  const [cgiPath, setCgiPath] = useState<string | null>(null)
  const [cgi, setCgi] = useState<PhcgiStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setBusy(true)
    setError(null)
    const results = await Promise.allSettled([
      detectNginx(),
      detectPhp(),
      detectPhpCgi(),
      getPhpCgiStatus(9000),
    ])
    if (results[0].status === 'fulfilled') setNginx(results[0].value)
    if (results[1].status === 'fulfilled') setPhp(results[1].value)
    if (results[2].status === 'fulfilled') setCgiPath(results[2].value)
    if (results[3].status === 'fulfilled') setCgi(results[3].value)
    const failed = results.find((result) => result.status === 'rejected')
    if (failed?.status === 'rejected') {
      setError(failed.reason instanceof Error ? failed.reason.message : 'Sebagian status layanan gagal dibaca.')
    }
    setBusy(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const runNginx = async (action: 'start' | 'stop' | 'restart') => {
    if (!nginx?.path) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await controlNginx({ path: nginx.path, action })
      setMessage(result)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kontrol Nginx gagal.')
    } finally {
      setBusy(false)
    }
  }

  const runPhpCgi = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (cgi?.running) {
        await stopPhpCgi(9000)
        setMessage('PHP-CGI dihentikan.')
      } else if (cgiPath) {
        await startPhpCgi(cgiPath, 9000, '127.0.0.1')
        setMessage('PHP-CGI berjalan pada 127.0.0.1:9000.')
      } else {
        throw new Error('php-cgi.exe tidak ditemukan. Periksa instalasi PHP.')
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kontrol PHP-CGI gagal.')
    } finally {
      setBusy(false)
    }
  }

  const nginxStatus = normalizeStatus(nginx?.status)
  const phpStatus = normalizeStatus(php?.status)
  const cgiStatus: ServiceState = cgi?.running ? 'Running' : cgiPath ? 'Stopped' : 'Not found'
  const activeCount = [nginxStatus, cgiStatus].filter((status) => status === 'Running').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Center"
        description="Pusat kontrol stack lokal. Kelola layanan web dan runtime dari satu tempat."
      />
      <Card variant="elevated">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted">Layanan aktif yang terdeteksi</p>
            <p className="mt-1 text-3xl font-semibold text-text-primary">{activeCount}<span className="ml-2 text-sm font-normal text-text-muted">/ 2 layanan yang sudah didukung</span></p>
            <p className="mt-1 text-xs text-text-muted">Status diperiksa langsung dari backend lokal.</p>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={busy}>{busy ? 'Memeriksa…' : 'Refresh status'}</Button>
        </CardContent>
      </Card>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ServiceCard title="Nginx" description="HTTP server dan reverse proxy" status={nginxStatus} detail={nginx?.version ?? nginx?.path}>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void runNginx('start')} disabled={busy || !nginx?.path || nginxStatus === 'Running'}>Start</Button>
            <Button size="sm" variant="outline" onClick={() => void runNginx('stop')} disabled={busy || !nginx?.path || nginxStatus !== 'Running'}>Stop</Button>
            <Button size="sm" variant="outline" onClick={() => void runNginx('restart')} disabled={busy || !nginx?.path}>Restart</Button>
          </div>
          {nginx?.error && <p className="text-xs text-destructive">{nginx.error}</p>}
        </ServiceCard>

        <ServiceCard title="PHP Runtime" description="CLI runtime dan konfigurasi PHP" status={phpStatus} detail={php?.version ?? php?.path}>
          <p className="text-xs text-text-muted">{php?.php_ini_path ? `php.ini: ${php.php_ini_path}` : 'Deteksi versi, binary, dan php.ini.'}</p>
          <p className="text-xs text-text-muted">{php?.extensions?.length ?? 0} ekstensi terdeteksi</p>
        </ServiceCard>

        <ServiceCard title="PHP-CGI / FastCGI" description="Backend PHP untuk Nginx melalui FastCGI" status={cgiStatus} detail={cgi?.address ?? cgiPath}>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void runPhpCgi()} disabled={busy || (!cgiPath && !cgi?.running)}>{cgi?.running ? 'Stop PHP-CGI' : 'Start PHP-CGI'}</Button>
            <span className="self-center text-xs text-text-muted">127.0.0.1:9000</span>
          </div>
        </ServiceCard>

        {(['Apache', 'MySQL / MariaDB', 'PostgreSQL'] as const).map((name) => (
          <ServiceCard key={name} title={name} description="Service adapter belum tersedia" status="Unavailable">
            <p className="text-xs text-text-muted">Belum diklaim terpasang atau berjalan. Integrasi service dan deteksi binary akan ditambahkan pada tahap berikutnya.</p>
          </ServiceCard>
        ))}
      </div>

      <Card variant="elevated">
        <CardHeader title="Catatan kompatibilitas" description="Veltrunix sedang dibangun bertahap menuju pengalaman XAMPP/Laragon." />
        <CardContent className="mt-3 space-y-2 text-sm text-text-muted">
          <p>Kontrol yang aktif saat ini: Nginx dan PHP-CGI. PHP CLI hanya dideteksi sebagai runtime.</p>
          <p>Apache, MySQL/MariaDB, PostgreSQL, project auto-detection, dan local domain automation belum diaktifkan. Kartu tersebut bukan indikator service yang sudah terpasang.</p>
        </CardContent>
      </Card>
    </div>
  )
}
