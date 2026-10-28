import { invoke } from '@tauri-apps/api/core'

export interface NginxInfo {
  name: string
  status: 'Installed' | 'Not found' | 'Running' | 'Stopped' | 'Error'
  version: string | null
  path: string | null
  config_path: string | null
  error: string | null
}

export interface NginxConfigCheck {
  valid: boolean
  output: string
  error: string | null
}

export interface DetectNginxRequest {
  path?: string | null
}

export interface NginxControlRequest {
  path: string
  action: string
  [key: string]: unknown
}

export async function detectNginx(
  req?: DetectNginxRequest
): Promise<NginxInfo> {
  return invoke<NginxInfo>('detect_nginx_cmd', { path: req?.path ?? null })
}

export async function getNginxStatus(path: string): Promise<NginxInfo> {
  return invoke<NginxInfo>('get_nginx_status_cmd', { path })
}

export async function checkNginxConfig(
  path: string
): Promise<NginxConfigCheck> {
  return invoke<NginxConfigCheck>('check_nginx_config_cmd', { path })
}

export async function controlNginx(
  req: NginxControlRequest
): Promise<string> {
  return invoke<string>('control_nginx_cmd', req)
}

export async function detectPhpCgi(): Promise<string | null> {
  return invoke<string | null>('detect_php_cgi_cmd')
}
