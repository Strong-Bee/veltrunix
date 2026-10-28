import { type VariantProps, cva } from 'class-variance-authority'

export const cardVariants = cva(
  'rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, children }: CardProps) {
  return (
    <div className={cardVariants({ variant, className })}>
      {children}
    </div>
  )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function CardHeader({
  className,
  title,
  description,
}: CardHeaderProps) {
  return (
    <div className={className}>
      {title && <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>}
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={className}>{children}</div>
}