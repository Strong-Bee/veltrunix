export interface PhpInfo {
  name: string;
  status: 'Installed' | 'Not found' | 'Running' | 'Stopped' | 'Error';
  version: string | null;
  path: string | null;
  php_ini_path: string | null;
  extensions: string[];
  error: string | null;
}

export interface DetectPhpRequest {
  path?: string | null;
}

export interface PhpControlRequest {
  path: string;
  action: string;
  port?: number;
  [key: string]: unknown;
}

export interface PhcgiProcessInfo {
  port: number;
  pid: number;
  address: string;
}

export interface PhcgiStatus {
  running: boolean;
  port: number | null;
  pid: number | null;
  address: string | null;
  error: string | null;
}

export async function detectPhp(
  req?: DetectPhpRequest
): Promise<PhpInfo> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<PhpInfo>('detect_php_cmd', { path: req?.path ?? null });
}

export async function checkPhpPort(port: number): Promise<boolean> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<boolean>('check_php_port_cmd', { port });
}

export async function startPhpCgi(
  path: string,
  port: number,
  address: string
): Promise<PhcgiProcessInfo> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<PhcgiProcessInfo>('start_php_cgi_cmd', { path, port, address });
}

export async function stopPhpCgi(port: number): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('stop_php_cgi_cmd', { port });
}

export async function getPhpCgiStatus(port: number): Promise<PhcgiStatus> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<PhcgiStatus>('get_php_cgi_status_cmd', { port });
}

export async function listPhpCgiProcesses(): Promise<PhcgiProcessInfo[]> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<PhcgiProcessInfo[]>('list_php_cgi_processes_cmd');
}

export async function stopAllPhpCgi(): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('stop_all_php_cgi_cmd');
}

export async function controlPhpCgi(
  req: PhpControlRequest
): Promise<string> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<string>('control_php_cgi_cmd', req);
}
