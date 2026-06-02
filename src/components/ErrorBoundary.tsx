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
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-6">
        <TerminalCard title="SYSTEM ERROR" className="max-w-md w-full">
          <div className="text-center py-6">
            <p className="text-lg mb-2">⚠️</p>
            <p className="text-sm text-white font-semibold">Intelligence Module Error</p>
            <p className="text-xs text-white/60 mt-1">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-3 py-1.5 rounded text-xs font-mono border border-[hsl(185_100%_55%/0.4)] text-primary hover:bg-[hsl(185_100%_55%/0.1)] transition-colors"
            >
              Retry
            </button>
          </div>
        </TerminalCard>
        </div>
      );
    }

    return this.props.children;
  }
}
