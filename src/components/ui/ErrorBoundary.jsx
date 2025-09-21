import React from "react";
import { FaExclamationTriangle, FaRefresh, FaHome, FaBug } from "react-icons/fa";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Here you could also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      
      // Use custom fallback if provided
      if (Fallback) {
        return <Fallback error={this.state.error} onRetry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="bg-white/5 border border-red-500/30 rounded-xl p-8">
              <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-6" />
              
              <h1 className="text-2xl font-bold text-red-400 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>

              {showDetails && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
                    <FaBug className="inline mr-2" />
                    Error Details
                  </summary>
                  <div className="bg-black/50 p-4 rounded-lg text-xs text-red-300 font-mono">
                    <p className="mb-2"><strong>Error:</strong> {this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <FaRefresh />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <FaHome />
                  Go Home
                </button>
              </div>

              {this.state.retryCount > 0 && (
                <p className="text-gray-500 text-sm mt-4">
                  Retry attempts: {this.state.retryCount}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Error Fallback Component
export const SimpleErrorFallback = ({ error, onRetry }) => (
  <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 text-center">
    <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h3>
    <p className="text-gray-400 text-sm mb-4">
      {error?.message || "An unexpected error occurred"}
    </p>
    <button
      onClick={onRetry}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
    >
      Try Again
    </button>
  </div>
);

// Network Error Component
export const NetworkError = ({ onRetry, message }) => (
  <div className="bg-orange-600/20 border border-orange-600/30 rounded-lg p-6 text-center">
    <div className="text-4xl mb-4">📡</div>
    <h3 className="text-lg font-semibold text-orange-400 mb-2">Connection Error</h3>
    <p className="text-gray-400 text-sm mb-4">
      {message || "Please check your internet connection and try again."}
    </p>
    <button
      onClick={onRetry}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition"
    >
      Retry
    </button>
  </div>
);

// 404 Error Component
export const NotFoundError = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-6">
    <div className="text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-pink-400 mb-4">Page Not Found</h1>
      <p className="text-gray-400 text-lg mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <FaHome />
          Go Home
        </button>
      </div>
    </div>
  </div>
);

export default ErrorBoundary;