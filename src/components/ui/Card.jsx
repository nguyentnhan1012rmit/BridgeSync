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
    md: 'p-5',
    lg: 'p-7',
  }

  return (
    <div
      className={`
        bg-surface-raised rounded-xl border border-border shadow-sm
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
