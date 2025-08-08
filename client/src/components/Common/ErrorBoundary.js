import React from 'react';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and any error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-danger-100 dark:bg-danger-900 rounded-full flex items-center justify-center mb-6">
                <ExclamationTriangleIcon className="w-8 h-8 text-danger-600 dark:text-danger-400" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>

              {/* Error Message */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="btn-primary w-full"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="btn-outline w-full"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </button>

                <button
                  onClick={this.toggleDetails}
                  className="btn-outline w-full"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  {this.state.showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {/* Error Details */}
              {this.state.showDetails && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Error Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    {this.state.error && (
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Error:</p>
                        <p className="text-gray-600 dark:text-gray-400 font-mono break-all">
                          {this.state.error.toString()}
                        </p>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Stack Trace:</p>
                        <pre className="text-gray-600 dark:text-gray-400 font-mono text-xs overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Support Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If this problem continues, please contact our support team with the error details above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (WrappedComponent, fallbackComponent = null) => {
  return class extends React.Component {
    render() {
      if (fallbackComponent) {
        return (
          <ErrorBoundary fallback={fallbackComponent}>
            <WrappedComponent {...this.props} />
          </ErrorBoundary>
        );
      }
      
      return (
        <ErrorBoundary>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };
};

// Hook for handling async errors
export const useAsyncError = () => {
  const [, setError] = React.useState();
  return React.useCallback((e) => {
    setError(() => {
      throw e;
    });
  }, []);
};

export default ErrorBoundary;
