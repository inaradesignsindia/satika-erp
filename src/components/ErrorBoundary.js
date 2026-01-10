import React from 'react';

/**
 * ErrorBoundary Component
 * Catches React component errors and prevents the entire app from crashing
 * Provides users with a friendly error message and recovery options
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console in development
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // You could also log the error to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              padding: '30px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '20px',
              }}
            >
              ⚠️
            </div>
            <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Error Details:</p>
                <p style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p style={{ margin: '0', color: '#666', whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#999', fontSize: '12px', margin: '0' }}>
                Error Count: {this.state.errorCount}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
