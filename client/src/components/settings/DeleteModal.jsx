import { useState } from 'react';

/**
 * DeleteModal — Reusable danger confirmation modal for destructive actions
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {string} body - Description text or JSX
 * @param {string} confirmText - Text to type for confirmation
 * @param {string} buttonLabel - Text on the red confirm button
 * @param {boolean} requirePassword - Whether to show password field
 * @param {function} onConfirm - Called with { password } when confirmed
 * @param {boolean} loading - Whether deletion is in progress
 * @param {string} error - Error message to display
 */
export default function DeleteModal({
    isOpen, onClose, title, body, confirmText, buttonLabel,
    requirePassword = false, onConfirm, loading = false, error = '',
}) {
    const [typed, setTyped] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const canConfirm = typed === confirmText && (!requirePassword || password.length > 0) && !loading;

    const handleConfirm = () => {
        if (!canConfirm) return;
        onConfirm({ password });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !loading) {
            onClose();
        }
    };

    return (
        <div
            onKeyDown={handleKeyDown}
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16, animation: 'fadeIn 0.2s ease',
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                style={{
                    background: 'var(--bg-card)', borderRadius: 16,
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)',
                    width: '100%', maxWidth: 440, padding: 28,
                    animation: 'scaleIn 0.2s ease',
                }}
            >
                <h3 style={{
                    fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-danger)',
                    marginBottom: 12,
                }}>{title}</h3>

                <div style={{
                    fontSize: '0.85rem', color: 'var(--text-secondary)',
                    lineHeight: 1.6, marginBottom: 20,
                }}>{body}</div>

                {requirePassword && (
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                            Enter your password to confirm
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Your password"
                            autoFocus
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 10,
                                border: '1.5px solid var(--border-color)',
                                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                                fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Type <strong style={{ color: 'var(--color-danger)' }}>{confirmText}</strong> to confirm
                    </label>
                    <input
                        type="text"
                        value={typed}
                        onChange={e => setTyped(e.target.value)}
                        placeholder={confirmText}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: 10,
                            border: `1.5px solid ${typed === confirmText ? 'var(--color-danger)' : 'var(--border-color)'}`,
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                </div>

                {error && (
                    <div style={{
                        padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)',
                        fontSize: '0.8rem', marginBottom: 16,
                    }}>{error}</div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn-outline"
                        style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                    >Cancel</button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        style={{
                            padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600,
                            borderRadius: 10, border: 'none', cursor: canConfirm ? 'pointer' : 'not-allowed',
                            background: canConfirm ? 'var(--color-danger)' : 'var(--bg-glass)',
                            color: canConfirm ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        {loading && <span className="loading-dots" style={{ transform: 'scale(0.5)' }}><span /><span /><span /></span>}
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
