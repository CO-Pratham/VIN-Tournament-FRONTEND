import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-400">
                The application encountered an error and couldn't load properly.
              </p>
            </div>

            <div className="bg-gray-700 rounded p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">Error Details:</h3>
              <pre className="text-red-400 text-sm overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div className="bg-gray-700 rounded p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">Stack Trace:</h3>
                <pre className="text-gray-300 text-xs overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack ||
                    "No stack trace available"}
                </pre>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                If this problem persists, please check the browser console for
                more details.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
