import { type VariantProps, cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-on-accent hover:bg-green-600 active:scale-[0.98]',
        secondary:
          'bg-secondary text-on-secondary hover:bg-slate-700 active:scale-[0.98]',
        ghost:
          'bg-transparent text-foreground hover:bg-muted active:scale-[0.98]',
        destructive:
          'bg-destructive text-on-destructive hover:bg-red-600 active:scale-[0.98]',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted active:scale-[0.98]',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-base',
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