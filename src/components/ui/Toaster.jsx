import { Toaster as SonnerToaster } from 'sonner'

export default function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'oklch(0.18 0.02 260 / 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid oklch(1 0 0 / 0.1)',
          color: 'oklch(0.98 0 0)',
          fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
          fontSize: '0.875rem',
          boxShadow: '0 20px 30px -5px oklch(0 0 0 / 0.5)',
        },
        className: 'bridgesync-toast',
      }}
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
    />
  )
}
