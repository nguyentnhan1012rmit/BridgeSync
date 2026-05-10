import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <Card className="max-w-md w-full text-center space-y-5">
        <div className="text-6xl font-bold text-primary/20 tracking-tighter">404</div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Page not found
          </h1>
          <p className="text-sm text-text-muted mt-1">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
