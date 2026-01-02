// frontend/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '16px',
                    margin: '20px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{
                        margin: '0 0 12px 0',
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#991b1b'
                    }}>
                        Something went wrong
                    </h2>
                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: '16px',
                        color: '#7f1d1d',
                        lineHeight: '1.6'
                    }}>
                        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                    </p>
                    {this.state.error && (
                        <details style={{
                            marginBottom: '24px',
                            padding: '16px',
                            background: 'white',
                            borderRadius: '8px',
                            textAlign: 'left',
                            fontSize: '14px',
                            color: '#374151'
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
                                Error Details
                            </summary>
                            <pre style={{
                                margin: '8px 0 0 0',
                                padding: '12px',
                                background: '#f9fafb',
                                borderRadius: '6px',
                                overflow: 'auto',
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 32px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
