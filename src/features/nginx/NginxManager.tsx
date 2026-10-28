import { useCallback, useState } from 'react'
import { NginxInfo } from './types'
import {
  controlNginx,
  detectNginx,
  detectPhpCgi,
  checkNginxConfig,
} from './api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function NginxManager() {
  const [nginx, setNginx] = useState<NginxInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configCheck, setConfigCheck] = useState<{ valid: boolean; output: string } | null>(
    null,
  )
  const [explicitPath, setExplicitPath] = useState<string | null>(null)
  const [phpCgi, setPhpCgi] = useState<string | null>(null)

  const detect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await detectNginx({ path: explicitPath })
      setNginx(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mendeteksi Nginx.',
      )
    } finally {
      setLoading(false)
    }
  }, [explicitPath])

  const testConfig = useCallback(async () => {
    if (!nginx?.path) return
    setLoading(true)
    setError(null)
    try {
      const data = await checkNginxConfig(nginx.path)
      setConfigCheck({ valid: data.valid, output: data.output })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menguji konfigurasi Nginx.',
      )
    } finally {
      setLoading(false)
    }
  }, [nginx])

  const control = useCallback(
    async (action: string) => {
      if (!nginx?.path) return
      setLoading(true)
      setError(null)
      try {
        await controlNginx({ path: nginx.path, action })
        setError(null)
        const updated = await detectNginx({ path: nginx.path })
        setNginx(updated)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : `Gagal ${action} Nginx.`,
        )
      } finally {
        setLoading(false)
      }
    },
    [nginx],
  )

  const detectPhp = useCallback(async () => {
    try {
      const path = await detectPhpCgi()
      setPhpCgi(path)
    } catch (err) {
      setPhpCgi(null)
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nginx Manager"
        description="Manajemen web server Nginx untuk Windows. Deteksi, kontrol proses, dan uji konfigurasi."
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Path ke nginx.exe (opsional)"
              value={explicitPath ?? ''}
              onChange={(e) => setExplicitPath(e.target.value || null)}
              className="flex-1 sm:w-64"
            />
            <Button variant="outline" onClick={detect} disabled={loading} size="sm">
              {loading ? 'Deteksi…' : 'Deteksi Nginx'}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {nginx && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Nginx</h2>
              <p className="text-sm text-text-muted">
                {nginx.status === 'Not found'
                  ? 'Nginx tidak terdeteksi di sistem.'
                  : nginx.status === 'Error'
                  ? `Error: ${nginx.error}`
                  : `Versi ${nginx.version ?? '—'} — ${nginx.path}`}
              </p>
            </div>
            <StatusBadge status={nginx.status} variant="nginx" />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="elevated" className="p-4">
              <CardContent>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Status</p>
                <StatusBadge status={nginx.status} variant="nginx" className="mt-2" />
              </CardContent>
            </Card>
            <Card variant="elevated" className="p-4">
              <CardContent>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Versi</p>
                <p className="mt-2 text-sm font-mono text-text-primary">{nginx.version ?? '—'}</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="p-4">
              <CardContent>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Path</p>
                <p className="mt-2 text-sm text-text-primary truncate-path" title={nginx.path ?? ''}>
                  {nginx.path ?? '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          {nginx.config_path && (
            <Card variant="elevated" className="p-4 mt-4">
              <CardContent>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Config Path</p>
                <p className="mt-2 text-sm text-text-primary truncate-path" title={nginx.config_path}>
                  {nginx.config_path}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {nginx.status === 'Not found' ? (
              <span className="text-sm text-text-muted">
                Nginx belum terinstal. Silakan instal Nginx terlebih dahulu.
              </span>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={
                    loading ||
                    (nginx.status !== 'Stopped' &&
                      nginx.status !== 'Installed')
                  }
                  onClick={() => control('start')}
                  className="flex-1 sm:flex-none"
                >
                  Start
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading || nginx.status !== 'Running'}
                  onClick={() => control('stop')}
                  className="flex-1 sm:flex-none"
                >
                  Stop
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading || nginx.status === 'Error'}
                  onClick={() => control('restart')}
                  className="flex-1 sm:flex-none"
                >
                  Restart
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading || nginx.status !== 'Running'}
                  onClick={() => control('reload')}
                  className="flex-1 sm:flex-none"
                >
                  Reload
                </Button>
              </>
            )}
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={testConfig}
              disabled={
                loading ||
                nginx.status === 'Not found' ||
                nginx.status === 'Error'
              }
              size="sm"
              className="w-full sm:w-auto"
            >
              {loading ? 'Uji…' : 'Uji Konfigurasi (nginx -t)'}
            </Button>
            {configCheck && (
              <div className={`mt-3 p-4 rounded-lg border ${
                configCheck.valid
                  ? 'border-status-active-border bg-status-active-bg text-status-active-text'
                  : 'border-status-error-bg bg-status-error-bg text-status-error-text'
              }`}>
                <p className="text-sm font-medium">
                  {configCheck.valid ? 'Konfigurasi valid' : 'Konfigurasi tidak valid'}
                </p>
                <p className="mt-1 text-xs font-mono text-text-muted whitespace-pre-wrap">
                  {configCheck.output}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!nginx && !error && !loading && (
        <Card variant="elevated" className="p-6">
          <CardContent className="p-0">
            <p className="text-sm text-text-muted">
              Klik tombol Deteksi Nginx untuk memulai deteksi dari backend.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">PHP-CGI (FastCGI)</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {phpCgi ? (
            <span className="px-3 py-1.5 rounded-lg bg-status-active-bg text-status-active-text border border-status-active-border text-xs font-medium">
              PHP-CGI: {phpCgi.split('\\').pop() ?? phpCgi}
            </span>
          ) : (
            <Button variant="outline" onClick={detectPhp} size="sm">
              Deteksi PHP-CGI
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}