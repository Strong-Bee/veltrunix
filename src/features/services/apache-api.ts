import { invoke } from '@tauri-apps/api/core'

export interface ApacheInfo {
  name: string
  status: 'Installed' | 'Not found' | 'Running' | 'Error'
  version: string | null
  path: string | null
  config_path: string | null
  error: string | null
}

export function detectApache(path?: string | null): Promise<ApacheInfo> {
  return invoke<ApacheInfo>('detect_apache_cmd', { path: path ?? null })
}

export function controlApache(path: string, action: 'start' | 'stop' | 'restart'): Promise<string> {
  return invoke<string>('control_apache_cmd', { path, action })
}
