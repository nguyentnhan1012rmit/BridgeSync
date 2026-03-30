const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-light active:bg-primary-dark shadow-sm',
  secondary:
    'bg-surface-alt text-text-primary border border-border hover:bg-border hover:border-border-hover',
  accent:
    'bg-accent text-white hover:bg-accent-light active:bg-accent-dark shadow-sm',
  danger:
    'bg-danger text-white hover:opacity-90 active:opacity-80',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
        cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  )
}
