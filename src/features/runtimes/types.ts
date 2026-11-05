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
  { key: 'python', label: 'Python' },
  { key: 'mysql', label: 'MySQL Client' },
  { key: 'mariadb', label: 'MariaDB Client' },
  { key: 'postgresql', label: 'PostgreSQL (psql)' },
  { key: 'redis', label: 'Redis Server' },
  { key: 'docker', label: 'Docker CLI' },
  { key: 'go', label: 'Go' },
  { key: 'java', label: 'Java' },
  { key: 'rust', label: 'Rust' },
  { key: 'sqlite', label: 'SQLite CLI' },
];
