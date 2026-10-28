export type NginxStatus =
  | 'Installed'
  | 'Not found'
  | 'Running'
  | 'Stopped'
  | 'Error';

export interface NginxInfo {
  name: string;
  status: NginxStatus;
  version: string | null;
  path: string | null;
  config_path: string | null;
  error: string | null;
}

export interface NginxConfigCheck {
  valid: boolean;
  output: string;
  error: string | null;
}

export interface DetectNginxRequest {
  path?: string | null;
}

export interface NginxControlRequest {
  path: string;
  action: string;
}
