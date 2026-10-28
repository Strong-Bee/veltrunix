export interface VirtualHost {
  name: string;
  domain: string;
  root: string;
  port: number;
  php_enabled: boolean;
  php_fastcgi_port: number | null;
  php_fastcgi_address: string | null;
  enabled: boolean;
  config_path: string | null;
  error: string | null;
}

export interface CreateVHostRequest {
  domain: string;
  root: string;
  port: number;
  php_enabled: boolean;
  php_fastcgi_port?: number | null;
  php_fastcgi_address?: string | null;
  nginx_path?: string | null;
}

export interface UpdateVHostRequest {
  name: string;
  domain?: string;
  root?: string;
  port?: number;
  php_enabled?: boolean;
  php_fastcgi_port?: number | null;
  php_fastcgi_address?: string | null;
  enabled?: boolean;
  nginx_path?: string | null;
}

export interface DeleteVHostRequest {
  name: string;
}
