import { useCallback, useEffect, useState } from 'react'
import {
  detectPhp,
  startPhpCgi,
  stopPhpCgi,
  getPhpCgiStatus,
  listPhpCgiProcesses,
  stopAllPhpCgi,
  type PhpInfo,
  type PhcgiStatus,
  type PhcgiProcessInfo,
} from './api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'

const DEFAULT_PHP_PATH = 'C:\\php\\php.exe'
const DEFAULT_PHP_CGI_PATH = 'C:\\php\\php-cgi.exe'
const DEFAULT_FASTCGI_PORT = 9000
const DEFAULT_FASTCGI_ADDRESS = '127.0.0.1'

export default function PhpManager() {
  const [phpInfo, setPhpInfo] = useState<PhpInfo | null>(null)
  const [phpCgiStatus, setPhpCgiStatus] = useState<PhcgiStatus | null>(null)
  const [phpCgiProcesses, setPhpCgiProcesses] = useState<PhcgiProcessInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phpPath, setPhpPath] = useState(DEFAULT_PHP_PATH)
  const [phpCgiPath, setPhpCgiPath] = useState(DEFAULT_PHP_CGI_PATH)
  const [fastcgiPort, setFastcgiPort] = useState(String(DEFAULT_FASTCGI_PORT))
  const [fastcgiAddress, setFastcgiAddress] = useState(DEFAULT_FASTCGI_ADDRESS)

  const loadPhpInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const info = await detectPhp({ path: phpPath || undefined })
      setPhpInfo(info)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mendeteksi PHP.',
      )
    } finally {
      setLoading(false)
    }
  }, [phpPath])

  const loadPhpCgiStatus = useCallback(async () => {
    const port = parseInt(fastcgiPort, 10)
    if (isNaN(port)) return
    try {
      const status = await getPhpCgiStatus(port)
      setPhpCgiStatus(status)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mendapatkan status PHP-CGI.',
      )
    }
  }, [fastcgiPort])

  const loadPhpCgiProcesses = useCallback(async () => {
    try {
      const processes = await listPhpCgiProcesses()
      setPhpCgiProcesses(processes)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat daftar proses PHP-CGI.',
      )
    }
  }, [])

  useEffect(() => {
    loadPhpInfo()
    loadPhpCgiStatus()
    loadPhpCgiProcesses()

    // Refresh status PHP-CGI setiap 5 detik
    const interval = setInterval(() => {
      loadPhpCgiStatus()
      loadPhpCgiProcesses()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [loadPhpInfo, loadPhpCgiStatus, loadPhpCgiProcesses])

  const handleDetect = useCallback(async () => {
    await loadPhpInfo()
  }, [loadPhpInfo])

  const handleStartPhpCgi = useCallback(async () => {
    const port = parseInt(fastcgiPort, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      setError('Port FastCGI harus berupa angka antara 1 dan 65535.')
      return
    }
    if (!phpCgiPath) {
      setError('Path php-cgi.exe harus diisi.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const info = await startPhpCgi(phpCgiPath, port, fastcgiAddress)
      setPhpCgiProcesses((prev) => [...prev, info])
      await loadPhpCgiStatus()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memulai PHP-CGI.',
      )
    } finally {
      setLoading(false)
    }
  }, [phpCgiPath, fastcgiPort, fastcgiAddress, loadPhpCgiStatus])

  const handleStopPhpCgi = useCallback(async (port: number) => {
    setLoading(true)
    setError(null)
    try {
      await stopPhpCgi(port)
      await loadPhpCgiStatus()
      await loadPhpCgiProcesses()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghentikan PHP-CGI.',
      )
    } finally {
      setLoading(false)
    }
  }, [loadPhpCgiStatus, loadPhpCgiProcesses])

  const handleStopAllPhpCgi = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await stopAllPhpCgi()
      await loadPhpCgiStatus()
      await loadPhpCgiProcesses()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghentikan semua PHP-CGI.',
      )
    } finally {
      setLoading(false)
    }
  }, [loadPhpCgiStatus, loadPhpCgiProcesses])

  const isRunning = phpCgiStatus?.running ?? false
  const isPhpInstalled = phpInfo?.status === 'Installed'

  return (
    <div className="space-y-6">
      <PageHeader
        title="PHP Manager"
        description="Deteksi PHP, kelola proses php-cgi.exe (FastCGI), dan konfigurasikan port untuk integrasi Nginx pada Windows."
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Deteksi PHP */}
      <Card>
        <CardContent className="mt-0">
          <h3 className="text-sm font-semibold text-foreground mb-4">Deteksi PHP</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="label">Path PHP (php.exe)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="C:\\php\\php.exe"
                  value={phpPath}
                  onChange={(e) => setPhpPath(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetect}
                  disabled={loading}
                >
                  Deteksi
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Path ke executable php.exe untuk deteksi versi dan extensi.
              </p>
            </div>
            <div className="space-y-1">
              <label className="label">Path PHP-CGI</label>
              <Input
                type="text"
                placeholder="C:\\php\\php-cgi.exe"
                value={phpCgiPath}
                onChange={(e) => setPhpCgiPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Path ke php-cgi.exe untuk proses FastCGI.
              </p>
            </div>
            <div className="space-y-1">
              <label className="label">Status</label>
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={isPhpInstalled ? 'Installed' : 'Not found'}
                />
              </div>
            </div>
          </div>

          {phpInfo && (
            <div className="mt-6 border-t border-border pt-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">Informasi PHP</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Versi</p>
                  <p className="text-foreground font-mono">{phpInfo.version ?? '—'}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Path</p>
                  <p className="text-foreground font-mono truncate" title={phpInfo.path ?? ''}>
                    {phpInfo.path ?? '—'}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">php.ini</p>
                  <p className="text-foreground font-mono truncate" title={phpInfo.php_ini_path ?? ''}>
                    {phpInfo.php_ini_path ?? '—'}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Extensi</p>
                  <p className="text-foreground font-mono">
                    {phpInfo.extensions.length > 0 ? phpInfo.extensions.join(', ') : '—'}
                  </p>
                </div>
                {phpInfo.error && (
                  <div className="col-span-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-sm">
                    {phpInfo.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PHP-CGI FastCGI Manager */}
      <Card>
        <CardContent className="mt-0">
          <h3 className="text-sm font-semibold text-foreground mb-4">PHP-CGI FastCGI Manager</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <label className="label">FastCGI Port</label>
              <Input
                type="text"
                value={fastcgiPort}
                onChange={(e) => setFastcgiPort(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Port untuk php-cgi.exe -b</p>
            </div>
            <div className="space-y-1">
              <label className="label">Address</label>
              <Input
                type="text"
                value={fastcgiAddress}
                onChange={(e) => setFastcgiAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Alamat bind (default: 127.0.0.1)</p>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant={isRunning ? 'destructive' : 'primary'}
                size="sm"
                onClick={isRunning ? () => handleStopPhpCgi(parseInt(fastcgiPort, 10)) : handleStartPhpCgi}
                disabled={loading || !phpCgiPath}
              >
                {isRunning ? 'Stop PHP-CGI' : 'Start PHP-CGI'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopAllPhpCgi}
                disabled={loading}
              >
                Stop Semua
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Status PHP-CGI</p>
              <p className="text-lg font-mono text-foreground">
                {isRunning ? 'Berjalan' : 'Tidak berjalan'}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-medium mb-1">PID</p>
              <p className="text-lg font-mono text-foreground">
                {phpCgiStatus?.pid ?? '—'}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Alamat</p>
              <p className="text-lg font-mono text-foreground truncate" title={phpCgiStatus?.address ?? ''}>
                {phpCgiStatus?.address ?? '—'}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Port</p>
              <p className="text-lg font-mono text-foreground">
                {phpCgiStatus?.port ?? fastcgiPort}
              </p>
            </div>
          </div>

          {/* Daftar Proses */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">Daftar Proses PHP-CGI</h4>
            {phpCgiProcesses.length === 0 ? (
              <EmptyState
                title="Belum ada proses PHP-CGI"
                description="Klik 'Start PHP-CGI' untuk memulai proses FastCGI."
                action={
                  <Button variant="primary" size="sm" onClick={handleStartPhpCgi} disabled={loading || !phpCgiPath}>
                    Start PHP-CGI
                  </Button>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Port</th>
                    <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">PID</th>
                    <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Address</th>
                    <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {phpCgiProcesses.map((proc) => (
                    <tr key={`${proc.port}`} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <span className="text-sm font-mono text-foreground">{proc.port}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-mono text-muted-foreground">{proc.pid}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-mono text-muted-foreground truncate" title={proc.address}>
                          {proc.address}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStopPhpCgi(proc.port)}
                          disabled={loading}
                        >
                          Stop
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Health Check */}
          <div className="pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Health Check</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Health check memverifikasi bahwa port FastCGi merespon koneksi TCP.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPhpCgiStatus}
                disabled={loading}
              >
                Periksa Kesehatan
              </Button>
              {phpCgiStatus?.error && (
                <span className="text-xs text-red-400">{phpCgiStatus.error}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
