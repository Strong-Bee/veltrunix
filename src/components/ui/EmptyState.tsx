interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

const DEFAULT_ICON = (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

export function EmptyState({
  title,
  description,
  action,
  icon = DEFAULT_ICON,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-surface-elevated text-text-muted mb-4">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-text-muted max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}