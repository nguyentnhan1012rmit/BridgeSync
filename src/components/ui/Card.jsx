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
        glass-panel rounded-xl
        ${paddings[padding]}
        ${hover ? 'stat-card cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
