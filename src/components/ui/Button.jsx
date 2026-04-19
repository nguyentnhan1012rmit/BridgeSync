const variants = {
  primary:
    'bg-gradient-to-r from-primary to-accent text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_oklch(0.65_0.25_300/0.3)]',
  secondary:
    'bg-white/5 border border-white/10 text-text-primary hover:bg-white/10 hover:border-white/20 backdrop-blur-md',
  accent:
    'bg-accent text-white hover:opacity-90 active:opacity-80 shadow-[0_0_15px_oklch(0.70_0.20_250/0.3)]',
  danger:
    'bg-gradient-to-r from-danger to-[#b91c1c] text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_oklch(0.65_0.22_25/0.3)]',
  ghost:
    'bg-transparent text-text-secondary hover:bg-white/5 hover:text-white',
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
