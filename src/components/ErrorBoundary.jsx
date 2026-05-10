import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button, Card } from '@/components/ui'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Application error boundary caught an error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <Card className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-11 h-11 rounded-full bg-danger/10 text-danger flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Something went wrong</h1>
            <p className="text-sm text-text-muted mt-1">
              BridgeSync hit an unexpected UI error. Reloading usually restores the session.
            </p>
          </div>
          <Button icon={RotateCcw} onClick={this.handleReload}>
            Reload
          </Button>
        </Card>
      </div>
    )
  }
}
