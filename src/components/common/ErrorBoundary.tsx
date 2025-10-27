import React from "react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log to console so Lovable logs can pick it up
    console.error("ErrorBoundary caught: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-xl w-full border border-destructive rounded-lg p-6 bg-card shadow">
            <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">{String(this.state.error)}</pre>
            <p className="text-xs text-muted-foreground mt-2">Check console for details.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
