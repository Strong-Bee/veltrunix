export type RuntimeStatus = 'Installed' | 'Not found' | 'Error';

export interface RuntimeInfo {
  name: string;
  status: RuntimeStatus;
  version: string | null;
  path: string | null;
  error: string | null;
}

export interface RuntimeTypeConfig {
  key: string;
  label: string;
}

export const RUNTIME_TYPES: RuntimeTypeConfig[] = [
  { key: 'php', label: 'PHP' },
  { key: 'node', label: 'Node.js' },
  { key: 'npm', label: 'npm' },
  { key: 'composer', label: 'Composer' },
  { key: 'git', label: 'Git' },
];
