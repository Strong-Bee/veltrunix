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
      bg: enabled ? 'bg-green-500/10' : 'bg-slate-500/10',
      text: enabled ? 'text-green-400' : 'text-slate-400',
      border: enabled ? 'border-green-500/30' : 'border-slate-500/30',
      label: enabled ? 'Aktif' : 'Nonaktif',
      dot: enabled,
    }
  }

  const config: Record<string, { bg: string; text: string; border: string; label: string; dot: boolean }> = {
    Installed: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/30',
      label: 'Installed',
      dot: true,
    },
    'Not found': {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      label: 'Not found',
      dot: false,
    },
    Running: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/30',
      label: 'Running',
      dot: true,
    },
    Stopped: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'Stopped',
      dot: false,
    },
    Error: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
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