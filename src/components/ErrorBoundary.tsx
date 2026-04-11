import { Component, ReactNode } from 'react';
import { TerminalCard } from '@/components/TerminalCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <TerminalCard title="SYSTEM ERROR">
          <div className="text-center py-6">
            <p className="text-lg mb-2">⚠️</p>
            <p className="text-sm text-foreground font-semibold">Intelligence Module Error</p>
            <p className="text-xs text-muted-foreground mt-1">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-3 py-1.5 rounded text-xs font-mono border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        </TerminalCard>
      );
    }

    return this.props.children;
  }
}
