import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAppInfo } from '../../lib/tauri'
import { detectRuntimes } from '../runtimes/api'
import { detectNginx } from '../nginx/api'
import { detectApache } from '../services/apache-api'
import { listVhosts } from '../vhosts/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'

interface ServiceStatus {
  label: string
  status: 'Installed' | 'Not found' | 'Running' | 'Stopped' | 'Error'
  version: string | null
  detail: string
}

export default function Dashboard() {
  const [info, setInfo] = useState<{ name: string; version: string; platform: string } | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [vhostCount, setVhostCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const fetchInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    const results = await Promise.allSettled([getAppInfo(), detectRuntimes(), detectNginx(), detectApache(), listVhosts()])
    if (results[0].status === 'fulfilled') setInfo(results[0].value)
    const rows: ServiceStatus[] = []
    if (results[1].status === 'fulfilled') {
      for (const [label, key] of [['PHP', 'php'], ['Node.js', 'node'], ['Python', 'python']] as const) {
        const item = results[1].value.find((runtime) => runtime.name === key)
        rows.push({ label, status: item?.status ?? 'Not found', version: item?.version ?? null, detail: item?.path ?? 'Runtime belum terdeteksi' })
      }
    }
    if (results[2].status === 'fulfilled') rows.push({ label: 'Nginx', status: results[2].value.status, version: results[2].value.version ?? null, detail: results[2].value.path ?? 'Binary belum ditemukan' })
    if (results[3].status === 'fulfilled') rows.push({ label: 'Apache', status: results[3].value.status === 'Installed' ? 'Installed' : results[3].value.status === 'Running' ? 'Running' : results[3].value.status === 'Error' ? 'Error' : 'Not found', version: results[3].value.version ?? null, detail: results[3].value.path ?? 'Binary belum ditemukan' })
    if (results[4].status === 'fulfilled') setVhostCount(results[4].value.length)
    const failures = results.filter((result) => result.status === 'rejected').length
    if (failures) setError(`${failures} pemeriksaan tidak dapat diselesaikan. Pastikan backend Veltrunix berjalan.`)
    setServices(rows)
    setLastChecked(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { void fetchInfo() }, [fetchInfo])
  const installedCount = useMemo(() => services.filter((item) => item.status === 'Installed' || item.status === 'Running').length, [services])
  const runningCount = useMemo(() => services.filter((item) => item.status === 'Running').length, [services])

  const navigate = (key: string) => window.dispatchEvent(new CustomEvent('veltrunix:navigate', { detail: key }))

  return <div className="dashboard-page">
    <PageHeader title="Dashboard" description="Ringkasan lingkungan development lokal dan status komponen Anda."
      action={<Button variant="outline" size="sm" onClick={() => void fetchInfo()} disabled={loading}>{loading ? 'Memeriksa…' : '↻  Refresh status'}</Button>} />
    {error && <div className="alert alert-error" role="alert">{error}</div>}

    <section className="welcome-panel">
      <div className="welcome-copy">
        <span className="eyebrow"><i /> YOUR LOCAL WORKSPACE</span>
        <h2>Build something<br /><span>remarkable.</span></h2>
        <p>Semua runtime, web server, dan project lokal dalam satu control center.</p>
        <div className="welcome-meta"><span className="welcome-meta-dot" /> {info?.platform ?? 'Local environment'} <span>·</span> Veltrunix {info?.version ?? '0.1.0'}</div>
      </div>
      <div className="welcome-visual" aria-hidden="true">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="visual-core"><span>V</span></div>
        <span className="orbit-chip chip-node">NODE</span><span className="orbit-chip chip-php">PHP</span><span className="orbit-chip chip-db">DB</span>
      </div>
    </section>

    <section className="metric-grid" aria-label="Ringkasan status">
      <Card variant="elevated"><CardContent className="metric-card"><span className="metric-icon metric-icon-green">⌁</span><div><p>Komponen tersedia</p><strong>{installedCount}<small> / {services.length || 5}</small></strong><span className="metric-foot">Runtime & web server</span></div></CardContent></Card>
      <Card variant="elevated"><CardContent className="metric-card"><span className="metric-icon metric-icon-blue">◉</span><div><p>Service berjalan</p><strong>{runningCount}</strong><span className="metric-foot">Status saat ini</span></div></CardContent></Card>
      <Card variant="elevated"><CardContent className="metric-card"><span className="metric-icon metric-icon-violet">▤</span><div><p>Virtual hosts</p><strong>{vhostCount}</strong><span className="metric-foot">Konfigurasi lokal</span></div></CardContent></Card>
      <Card variant="elevated"><CardContent className="metric-card"><span className="metric-icon metric-icon-amber">◷</span><div><p>Last checked</p><strong className="metric-time">{lastChecked ? lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</strong><span className="metric-foot">{lastChecked ? lastChecked.toLocaleDateString() : 'Belum diperiksa'}</span></div></CardContent></Card>
    </section>

    <section className="dashboard-columns">
      <Card variant="elevated">
        <div className="dashboard-card-heading"><div><CardHeader title="Environment overview" description="Status komponen development yang terdeteksi." /></div><span className="live-label"><i /> LIVE</span></div>
        <CardContent className="environment-list">
          {services.map((service) => <div className="environment-row" key={service.label}>
            <div className="environment-symbol">{service.label === 'PHP' ? 'php' : service.label === 'Node.js' ? 'JS' : service.label === 'Python' ? 'Py' : service.label === 'Nginx' ? 'N' : 'A'}</div>
            <div className="environment-info"><strong>{service.label}</strong><span title={service.detail}>{service.version ?? service.detail}</span></div>
            <StatusBadge status={service.status} variant="runtime" />
          </div>)}
          {!services.length && <p className="text-sm text-text-muted py-6">{loading ? 'Memuat status environment…' : 'Belum ada data environment.'}</p>}
        </CardContent>
      </Card>
      <div className="dashboard-side-stack">
        <Card variant="elevated">
          <CardHeader title="Quick access" description="Buka modul yang sering digunakan." />
          <CardContent className="quick-access-list">
            <button onClick={() => navigate('services')}><span className="quick-icon">⇄</span><span><strong>Service Center</strong><small>Start & stop web server</small></span><b>→</b></button>
            <button onClick={() => navigate('runtimes')}><span className="quick-icon">⌘</span><span><strong>Runtime Manager</strong><small>Inspect installed toolchains</small></span><b>→</b></button>
            <button onClick={() => navigate('vhosts')}><span className="quick-icon">▣</span><span><strong>Virtual Hosts</strong><small>Manage local domains</small></span><b>→</b></button>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader title="Workspace details" />
          <CardContent className="workspace-details">
            <div><span>Application</span><strong>{info?.name ?? 'Veltrunix'}</strong></div>
            <div><span>Version</span><strong>{info?.version ?? '0.1.0'}</strong></div>
            <div><span>Platform</span><strong>{info?.platform ?? 'Windows'}</strong></div>
          </CardContent>
        </Card>
      </div>
    </section>
    <p className="dashboard-note">Status diperoleh dari pemeriksaan backend lokal. Komponen berstatus Not found perlu dipasang atau ditambahkan ke PATH.</p>
  </div>
}
