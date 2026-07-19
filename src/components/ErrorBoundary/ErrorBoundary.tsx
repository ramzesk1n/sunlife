import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="font-display text-3xl md:text-4xl font-light text-gold-dark uppercase tracking-wider mb-4">
              Что-то пошло не так
            </h1>
            <p className="text-text-muted text-base md:text-lg mb-8">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-dark text-cream font-display uppercase tracking-wider rounded-2xl hover:bg-gold-darker transition-all duration-300"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
