interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return <div className="page-heading">
    <div className="page-heading-copy">
      <p className="page-kicker">VELTRUNIX WORKSPACE</p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </div>
    {action && <div className="page-heading-actions">{action}</div>}
  </div>
}
