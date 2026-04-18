const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-light active:bg-primary-dark',
  secondary:
    'bg-surface-alt text-text-primary border border-border hover:border-border-hover hover:bg-border/30',
  accent:
    'bg-accent text-white hover:bg-accent-light active:bg-accent-dark',
  danger:
    'bg-danger text-white hover:opacity-90 active:opacity-80',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary',
}

const sizes = {
  sm: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-lg gap-2',
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
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        active:scale-[0.98]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2} />}
    </button>
  )
}
