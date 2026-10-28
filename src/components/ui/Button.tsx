import { type VariantProps, cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:text-text-muted cursor-pointer select-none active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active',
        secondary:
          'bg-secondary text-on-secondary hover:bg-secondary-hover active:bg-secondary-active',
        ghost:
          'bg-transparent text-foreground hover:bg-surface-elevated active:bg-surface-border',
        outline:
          'border border-surface-border text-foreground hover:bg-surface-elevated active:bg-surface-border',
        destructive:
          'bg-destructive text-on-destructive hover:bg-destructive-hover active:bg-destructive-active',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  )
}