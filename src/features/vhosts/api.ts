import { invoke } from '@tauri-apps/api/core'

export interface VirtualHost {
  name: string
  domain: string
  root: string
  port: number
  php_enabled: boolean
  php_fastcgi_port: number | null
  php_fastcgi_address: string | null
  enabled: boolean
  config_path: string | null
  error: string | null
}

export interface CreateVHostRequest {
  domain: string
  root: string
  port: number
  php_enabled: boolean
  php_fastcgi_port?: number | null
  php_fastcgi_address?: string | null
  nginx_path?: string | null
  [key: string]: unknown
}

export interface UpdateVHostRequest {
  name: string
  domain?: string
  root?: string
  port?: number
  php_enabled?: boolean
  php_fastcgi_port?: number | null
  php_fastcgi_address?: string | null
  enabled?: boolean
  nginx_path?: string | null
  [key: string]: unknown
}

export interface DeleteVHostRequest {
  name: string
  [key: string]: unknown
}

export interface DetectNginxRequest {
  path?: string | null
}

export interface NginxInfo {
  name: string
  status: 'Installed' | 'Not found' | 'Running' | 'Stopped' | 'Error'
  version: string | null
  path: string | null
  config_path: string | null
  error: string | null
}

export async function listVhosts(): Promise<VirtualHost[]> {
  return invoke<VirtualHost[]>('list_vhosts_cmd')
}

export async function createVhost(
  req: CreateVHostRequest
): Promise<VirtualHost> {
  return invoke<VirtualHost>('create_vhost_cmd', req)
}

export async function updateVhost(
  req: UpdateVHostRequest
): Promise<VirtualHost> {
  return invoke<VirtualHost>('update_vhost_cmd', req)
}

export async function deleteVhost(
  req: DeleteVHostRequest
): Promise<void> {
  return invoke<void>('delete_vhost_cmd', req)
}

export async function detectNginx(
  req?: DetectNginxRequest
): Promise<NginxInfo> {
  return invoke<NginxInfo>('detect_nginx_cmd', { path: req?.path ?? null })
}
