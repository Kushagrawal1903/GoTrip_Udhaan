/**
 * ErrorAlert — displays error messages with retry option
 */
export default function ErrorAlert({ message, onRetry = null }) {
    return (
        <div className="animate-fade-in" style={{
            padding: '20px 24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            maxWidth: 600,
            margin: '20px auto',
        }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
                <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>
                    Something went wrong
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {message || 'An unexpected error occurred. Please try again.'}
                </p>
            </div>
            {onRetry && (
                <button onClick={onRetry} className="btn-outline" style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    flexShrink: 0,
                }}>
                    Retry
                </button>
            )}
        </div>
    );
}
