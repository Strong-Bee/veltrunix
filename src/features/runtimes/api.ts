import { invoke } from '@tauri-apps/api/core'

export interface RuntimeInfo {
  name: string
  status: 'Installed' | 'Not found' | 'Error'
  version: string | null
  path: string | null
  error: string | null
}

export async function detectRuntimes(): Promise<RuntimeInfo[]> {
  return invoke<RuntimeInfo[]>('detect_runtimes')
}

export async function detectRuntimeByName(name: string): Promise<RuntimeInfo> {
  return invoke<RuntimeInfo>('detect_runtime_by_name', { name })
}
