import { useCallback, useState } from 'react'
import { getAppInfo } from '../../lib/tauri'
import logo from '../../assets/veltrunix-logo.png'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function About() {
  const [appInfo, setAppInfo] = useState<{ name: string; version: string; platform: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const info = await getAppInfo()
      setAppInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat informasi aplikasi.')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tentang Veltrunix"
        description="Local Development Environment untuk Windows"
      />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt="Veltrunix Logo"
            className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-xl border border-border bg-background p-4"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Veltrunix</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Local Development Environment untuk Windows
          </p>
          {appInfo && (
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span>Versi: <strong className="text-foreground font-mono">{appInfo.version}</strong></span>
              <span>Platform: <strong className="text-foreground font-mono">{appInfo.platform}</strong></span>
            </div>
          )}
          {!appInfo && !loading && !error && (
            <Button variant="ghost" size="sm" onClick={fetchInfo} className="mt-4">
              Muat informasi aplikasi
            </Button>
          )}
          {loading && <p className="mt-4 text-sm text-muted-foreground">Memuat informasi dari backend…</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="mt-0 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Fitur Utama</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                Manajemen PHP (deteksi, versi, ekstensi, php.ini)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                PHP-CGI FastCGI lifecycle (start/stop/status/health check)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                Nginx Virtual Host dengan FastCGI terintegrasi
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                Deteksi runtime (Node.js, npm, Composer, Git)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                Domain lokal & manajemen proyek Laravel
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="mt-0 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Teknologi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Rust</strong> — Backend Tauri 2, manajemen proses & sistem</li>
              <li><strong className="text-foreground">React 18 + TypeScript</strong> — Frontend desktop</li>
              <li><strong className="text-foreground">Vite</strong> — Build tool & dev server</li>
              <li><strong className="text-foreground">Tailwind CSS</strong> — Styling responsif & dark mode</li>
              <li><strong className="text-foreground">SQLite</strong> — Metadata aplikasi & konfigurasi</li>
              <li><strong className="text-foreground">Tokio + Serde</strong> — Async runtime & serialisasi</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="mt-0 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Link</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Repositori: <code className="text-foreground font-mono">github.com/veltrunix</code></li>
              <li>Lisensi: <code className="text-foreground font-mono">MIT</code></li>
              <li>Platform: <code className="text-foreground font-mono">Windows 10/11</code></li>
              <li>Arsitektur: <code className="text-foreground font-mono">x64</code></li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        <p>Veltrunix &copy; 2025 — Local Development Environment untuk Windows</p>
        <p className="mt-1">Dibangun dengan Tauri 2, React, dan Rust</p>
      </div>
    </div>
  )
}