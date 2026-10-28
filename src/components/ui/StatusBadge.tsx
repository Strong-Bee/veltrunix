interface StatusBadgeProps {
  status:
    | 'Installed'
    | 'Not found'
    | 'Running'
    | 'Stopped'
    | 'Error'
    | 'Aktif'
    | 'Nonaktif'
    | boolean
  variant?: 'runtime' | 'nginx' | 'vhost'
  className?: string
}

const getConfig = (
  status: StatusBadgeProps['status'],
  variant: StatusBadgeProps['variant'],
) => {
  if (variant === 'vhost' || typeof status === 'boolean') {
    const enabled = status === 'Aktif' || status === true
    return {
      bg: enabled ? 'bg-status-active-bg' : 'bg-status-inactive-bg',
      text: enabled ? 'text-status-active-text' : 'text-status-inactive-text',
      border: enabled ? 'border-status-active-border' : 'border-status-inactive-border',
      label: enabled ? 'Aktif' : 'Nonaktif',
      dot: enabled,
    }
  }

  const config: Record<string, { bg: string; text: string; border: string; label: string; dot: boolean }> = {
    Installed: {
      bg: 'bg-status-installed-bg',
      text: 'text-status-installed-text',
      border: 'border-status-installed-border',
      label: 'Installed',
      dot: true,
    },
    'Not found': {
      bg: 'bg-status-notFound-bg',
      text: 'text-status-notFound-text',
      border: 'border-status-notFound-border',
      label: 'Not found',
      dot: false,
    },
    Running: {
      bg: 'bg-status-running-bg',
      text: 'text-status-running-text',
      border: 'border-status-running-border',
      label: 'Running',
      dot: true,
    },
    Stopped: {
      bg: 'bg-status-stopped-bg',
      text: 'text-status-stopped-text',
      border: 'border-status-stopped-border',
      label: 'Stopped',
      dot: false,
    },
    Error: {
      bg: 'bg-status-error-bg',
      text: 'text-status-error-text',
      border: 'border-status-error-border',
      label: 'Error',
      dot: false,
    },
  }

  return config[String(status)] || config['Not found']
}

export function StatusBadge({
  status,
  variant,
  className,
}: StatusBadgeProps) {
  const c = getConfig(status, variant)
  const label = typeof status === 'boolean' ? (status ? 'Aktif' : 'Nonaktif') : c.label

  return (
    <span
      className={`status-badge ${c.bg} ${c.text} ${c.border} ${className ?? ''}`}
    >
      {c.dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      )}
      {label}
    </span>
  )
}