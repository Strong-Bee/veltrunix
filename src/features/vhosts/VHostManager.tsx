import { useCallback, useEffect, useState } from 'react'
import { VirtualHost } from './types'
import {
  createVhost,
  deleteVhost,
  detectNginx,
  updateVhost,
} from './api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'

function generateNginxConfig(
  domain: string,
  root: string,
  port: number,
  phpEnabled: boolean,
  phpFastcgiPort: number | null,
  phpFastcgiAddress: string | null,
): string {
  const fastcgiPort = phpFastcgiPort ?? 9000
  const fastcgiAddress = phpFastcgiAddress ?? '127.0.0.1'

  const phpBlock = phpEnabled
    ? `
        location ~ \\.php$ {
            fastcgi_pass   ${fastcgiAddress}:${fastcgiPort};
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
            fastcgi_param  PATH_INFO        $fastcgi_script_name;
            include        fastcgi_params;
        }
  `
    : ''

  return `server {
    listen ${port};
    server_name ${domain};
    root "${root}";
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
${phpBlock}
}`
}

export default function VHostManager() {
  const [vhosts, setVhosts] = useState<VirtualHost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{
    domain: string
    root: string
    port: string
    php_enabled: boolean
    php_fastcgi_port: string
    php_fastcgi_address: string
  }>({
    domain: '',
    root: '',
    port: '80',
    php_enabled: false,
    php_fastcgi_port: '9000',
    php_fastcgi_address: '127.0.0.1',
  })
  const [editing, setEditing] = useState<VirtualHost | null>(null)
  const [previewConfig, setPreviewConfig] = useState<string | null>(null)
  const [nginxPath, setNginxPath] = useState<string | null>(null)

  const loadVhosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await (window as any).__TAURI__?.invoke?.('list_vhosts_cmd') ?? []
      setVhosts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat virtual host.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVhosts()

    // Deteksi path Nginx untuk validasi konfigurasi
    detectNginx({ path: null })
      .then((info: any) => {
        if (info.path) {
          setNginxPath(info.path)
        }
      })
      .catch(() => {
        // Abaikan error deteksi, backend akan mencoba deteksi sendiri
      })
  }, [loadVhosts])

  const handleAddVhost = useCallback(() => {
    setEditing(null)
    setForm({
      domain: '',
      root: '',
      port: '80',
      php_enabled: false,
      php_fastcgi_port: '9000',
      php_fastcgi_address: '127.0.0.1',
    })
    setPreviewConfig(null)
    setShowForm(true)
  }, [])

  const updatePreview = useCallback(() => {
    setPreviewConfig(
      generateNginxConfig(
        form.domain,
        form.root,
        parseInt(form.port, 10) || 80,
        form.php_enabled,
        parseInt(form.php_fastcgi_port, 10) || 9000,
        form.php_fastcgi_address || '127.0.0.1',
      ),
    )
  }, [form])

  useEffect(() => {
    if (showForm) {
      updatePreview()
    }
  }, [showForm, form, updatePreview])

  const create = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const port = parseInt(form.port, 10)
      if (isNaN(port) || port < 1 || port > 65535) {
        setError('Port harus berupa angka antara 1 dan 65535.')
        setLoading(false)
        return
      }
      const fastcgiPort = parseInt(form.php_fastcgi_port, 10)
      if (form.php_enabled && (isNaN(fastcgiPort) || fastcgiPort < 1 || fastcgiPort > 65535)) {
        setError('Port FastCGI harus berupa angka antara 1 dan 65535.')
        setLoading(false)
        return
      }
      const data = await createVhost({
        domain: form.domain,
        root: form.root,
        port,
        php_enabled: form.php_enabled,
        php_fastcgi_port: form.php_enabled ? fastcgiPort : null,
        php_fastcgi_address: form.php_enabled
          ? form.php_fastcgi_address || '127.0.0.1'
          : null,
        nginx_path: nginxPath ?? undefined,
      })
      setVhosts((prev) => [...prev, data])
      setShowForm(false)
      setForm({
        domain: '',
        root: '',
        port: '80',
        php_enabled: false,
        php_fastcgi_port: '9000',
        php_fastcgi_address: '127.0.0.1',
      })
      setPreviewConfig(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal membuat virtual host.',
      )
    } finally {
      setLoading(false)
    }
  }, [form, nginxPath])

  const update = useCallback(async () => {
    if (!editing) return
    setLoading(true)
    setError(null)
    try {
      const port = form.port ? parseInt(form.port, 10) : editing.port
      const fastcgiPort = parseInt(form.php_fastcgi_port, 10)
      if (form.php_enabled && (isNaN(fastcgiPort) || fastcgiPort < 1 || fastcgiPort > 65535)) {
        setError('Port FastCGI harus berupa angka antara 1 dan 65535.')
        setLoading(false)
        return
      }
      const data = await updateVhost({
        name: editing.name,
        domain: form.domain || editing.domain,
        root: form.root || editing.root,
        port: isNaN(port) ? editing.port : port,
        php_enabled: form.php_enabled,
        php_fastcgi_port: form.php_enabled ? fastcgiPort : null,
        php_fastcgi_address: form.php_enabled
          ? form.php_fastcgi_address || '127.0.0.1'
          : null,
        enabled: true,
        nginx_path: nginxPath ?? undefined,
      })
      setVhosts((prev) =>
        prev.map((v) => (v.name === data.name ? data : v))
      )
      setEditing(null)
      setShowForm(false)
      setForm({
        domain: '',
        root: '',
        port: '80',
        php_enabled: false,
        php_fastcgi_port: '9000',
        php_fastcgi_address: '127.0.0.1',
      })
      setPreviewConfig(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memperbarui virtual host.',
      )
    } finally {
      setLoading(false)
    }
  }, [editing, form, nginxPath])

  const remove = useCallback(async (name: string) => {
    if (!window.confirm(`Hapus virtual host "${name}"?`)) return
    setLoading(true)
    setError(null)
    try {
      await deleteVhost({ name })
      setVhosts((prev) => prev.filter((v) => v.name !== name))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghapus virtual host.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleEnable = useCallback(async (vhost: VirtualHost) => {
    setLoading(true)
    setError(null)
    try {
      const data = await updateVhost({
        name: vhost.name,
        domain: vhost.domain,
        root: vhost.root,
        port: vhost.port,
        php_enabled: vhost.php_enabled,
        php_fastcgi_port: vhost.php_fastcgi_port,
        php_fastcgi_address: vhost.php_fastcgi_address,
        enabled: !vhost.enabled,
        nginx_path: nginxPath ?? undefined,
      })
      setVhosts((prev) =>
        prev.map((v) => (v.name === data.name ? data : v))
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mengubah status virtual host.',
      )
    } finally {
      setLoading(false)
    }
  }, [nginxPath])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Virtual Host Manager"
        description="Buat, edit, aktifkan, dan nonaktifkan konfigurasi server block Nginx untuk domain lokal (mis. myproject.test)."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setForm({
                domain: '',
                root: '',
                port: '80',
                php_enabled: false,
                php_fastcgi_port: '9000',
                php_fastcgi_address: '127.0.0.1',
              })
              setPreviewConfig(null)
              setShowForm(true)
            }}
          >
            {editing ? 'Batal Edit' : 'Tambah Virtual Host'}
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="mt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                editing ? update() : create()
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">Domain</label>
                  <Input
                    type="text"
                    placeholder="myproject.test"
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="label">Root Direktori</label>
                  <Input
                    type="text"
                    placeholder="C:\\projek\\myproject\\public"
                    value={form.root}
                    onChange={(e) => setForm({ ...form, root: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">Port</label>
                  <Input
                    type="text"
                    value={form.port}
                    onChange={(e) => setForm({ ...form, port: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.php_enabled}
                    onChange={(e) =>
                      setForm({ ...form, php_enabled: e.target.checked })
                    }
                    className="rounded text-green-500 focus:ring-green-500"
                  />
                  <label className="text-sm text-foreground">Aktifkan PHP (FastCGI)</label>
                </div>
              </div>

              {form.php_enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label">FastCGI Port</label>
                    <Input
                      type="text"
                      value={form.php_fastcgi_port}
                      onChange={(e) => setForm({ ...form, php_fastcgi_port: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Port php-cgi.exe (default: 9000)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="label">FastCGI Address</label>
                    <Input
                      type="text"
                      placeholder="127.0.0.1"
                      value={form.php_fastcgi_address}
                      onChange={(e) => setForm({ ...form, php_fastcgi_address: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alamat bind php-cgi.exe
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {editing ? 'Simpan Perubahan' : 'Buat Virtual Host'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    setForm({
                      domain: '',
                      root: '',
                      port: '80',
                      php_enabled: false,
                      php_fastcgi_port: '9000',
                      php_fastcgi_address: '127.0.0.1',
                    })
                    setPreviewConfig(null)
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>

            {previewConfig && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Preview Konfigurasi Nginx</h3>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <pre className="p-4 font-mono text-xs overflow-x-auto bg-background border border-border rounded-lg">
                      {previewConfig}
                    </pre>
                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      Konfigurasi akan divalidasi dengan `nginx -t` sebelum disimpan.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-4">
        {vhosts.length === 0 ? (
          <EmptyState
            title="Belum ada virtual host"
            description="Klik 'Tambah Virtual Host' untuk memulai."
            action={
              <Button variant="primary" size="sm" onClick={handleAddVhost}>
                Tambah Virtual Host
              </Button>
            }
          />
        ) : (
          <Card>
            <CardContent className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Domain</th>
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Root</th>
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Port</th>
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">PHP</th>
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">FastCGI</th>
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vhosts.map((vhost) => (
                      <tr key={vhost.name} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <span className="font-medium text-foreground">{vhost.domain}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-muted-foreground truncate max-w-xs" title={vhost.root}>
                            {vhost.root}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-mono text-foreground">{vhost.port}</span>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs ${vhost.php_enabled ? 'text-green-400' : 'text-muted-foreground'}`}>
                            {vhost.php_enabled ? 'Aktif' : '—'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs font-mono ${vhost.php_enabled ? 'text-blue-400' : 'text-muted-foreground'}`}>
                            {vhost.php_enabled && vhost.php_fastcgi_port && vhost.php_fastcgi_address
                              ? `${vhost.php_fastcgi_address}:${vhost.php_fastcgi_port}`
                              : '—'}
                          </span>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={vhost.enabled ? 'Aktif' : 'Nonaktif'} variant="vhost" />
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleEnable(vhost)}
                              disabled={loading}
                              className="px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                                vhost.enabled
                                  ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                                  : 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                              }"
                            >
                              {vhost.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => {
                                setEditing(vhost)
                                setForm({
                                  domain: vhost.domain,
                                  root: vhost.root,
                                  port: vhost.port.toString(),
                                  php_enabled: vhost.php_enabled,
                                  php_fastcgi_port: vhost.php_fastcgi_port?.toString() || '9000',
                                  php_fastcgi_address: vhost.php_fastcgi_address || '127.0.0.1',
                                })
                                setPreviewConfig(
                                  generateNginxConfig(
                                    vhost.domain,
                                    vhost.root,
                                    vhost.port,
                                    vhost.php_enabled,
                                    vhost.php_fastcgi_port,
                                    vhost.php_fastcgi_address,
                                  ),
                                )
                                setShowForm(true)
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(vhost.name)}
                              disabled={loading}
                              className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
