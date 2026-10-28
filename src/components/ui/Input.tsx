export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  const base =
    'flex h-input w-full rounded-md border border-surface-border bg-surface-base px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50'
  return (
    <input
      className={base + (className ? ` ${className}` : '')}
      {...props}
    />
  )
}