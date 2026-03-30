export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        bg-surface-raised rounded-xl border border-border shadow-sm
        ${paddings[padding]}
        ${hover ? 'hover:shadow-md hover:border-border-hover transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
