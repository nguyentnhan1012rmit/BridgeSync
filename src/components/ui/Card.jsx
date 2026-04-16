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
        bg-surface-raised rounded-2xl border border-border
        shadow-sm
        ${paddings[padding]}
        ${hover ? 'stat-card hover:border-border-hover cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
