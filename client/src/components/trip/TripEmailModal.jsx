import { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaTimes, FaPaperPlane } from 'react-icons/fa';

/**
 * TripEmailModal — Premium modal for sending trip details via email.
 * Matches the existing GoTrip design system (CSS custom properties, glass cards).
 * Mirrors WhatsAppModal.jsx architecture.
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen       - Whether the modal is visible
 * @param {Function} props.onClose      - Close callback
 * @param {Function} props.onSend       - Submit callback (receives email string)
 * @param {boolean}  props.sending      - Loading state
 * @param {string}   props.error        - Error message to display
 * @param {string}   props.success      - Success message to display
 * @param {string}   props.destination  - Trip destination for display
 * @param {string}   props.defaultEmail - Logged-in user's email (auto-filled)
 */
export default function TripEmailModal({ isOpen, onClose, onSend, sending, error, success, destination, defaultEmail }) {
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const inputRef = useRef(null);
    const modalRef = useRef(null);

    // Pre-fill with user email and focus when modal opens
    useEffect(() => {
        if (isOpen) {
            setEmail(defaultEmail || '');
            setLocalError('');
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, defaultEmail]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === modalRef.current) onClose();
    };

    // Validate and submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        const trimmed = email.trim();

        if (!trimmed) {
            setLocalError('Please enter an email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            setLocalError('Please enter a valid email address.');
            return;
        }

        onSend(trimmed);
    };

    if (!isOpen) return null;

    const displayError = localError || error;

    return (
        <div
            ref={modalRef}
            onClick={handleBackdropClick}
            className="animate-fade-in"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(6px)',
                padding: 16,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Send trip via email"
        >
            <div
                className="animate-scale-in"
                style={{
                    width: '100%',
                    maxWidth: 440,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                }}
            >
                {/* ─── Header ─────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d7377 100%)',
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaEnvelope size={22} color="#fff" />
                        <div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: '#fff',
                                lineHeight: 1.3,
                            }}>
                                Receive Trip via Email
                            </h3>
                            {destination && (
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.78rem',
                                    color: 'rgba(255,255,255,0.85)',
                                    marginTop: 2,
                                }}>
                                    📍 {destination}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={sending}
                        aria-label="Close modal"
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            color: '#fff',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* ─── Body ───────────────────────────────── */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {/* Success state */}
                    {success && (
                        <div style={{
                            background: 'rgba(22, 163, 74, 0.08)',
                            border: '1px solid rgba(22, 163, 74, 0.2)',
                            borderRadius: 10,
                            padding: '14px 16px',
                            marginBottom: 18,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            animation: 'fadeInUp 0.3s ease',
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>✅</span>
                            <div>
                                <p style={{
                                    margin: 0,
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    color: 'var(--color-success)',
                                }}>
                                    {success}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.78rem',
                                    color: 'var(--text-muted)',
                                    marginTop: 2,
                                }}>
                                    Check your inbox for the trip details
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {displayError && !success && (
                        <div style={{
                            background: 'rgba(220, 38, 38, 0.06)',
                            border: '1px solid rgba(220, 38, 38, 0.15)',
                            borderRadius: 10,
                            padding: '12px 14px',
                            marginBottom: 16,
                            fontSize: '0.82rem',
                            color: 'var(--color-danger)',
                            fontWeight: 500,
                        }}>
                            ⚠️ {displayError}
                        </div>
                    )}

                    {!success && (
                        <>
                            <label
                                htmlFor="trip-email-input"
                                style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                Email Address
                            </label>

                            <input
                                ref={inputRef}
                                id="trip-email-input"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setLocalError('');
                                }}
                                placeholder="you@example.com"
                                disabled={sending}
                                autoComplete="email"
                                className="input-field"
                                style={{
                                    width: '100%',
                                    borderRadius: 10,
                                    marginBottom: 8,
                                }}
                            />

                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: 20,
                                lineHeight: 1.5,
                            }}>
                                We'll send a beautiful trip summary with your itinerary highlights to this email.
                            </p>

                            {/* ─── Action buttons ──────────────── */}
                            <div style={{
                                display: 'flex',
                                gap: 10,
                                justifyContent: 'flex-end',
                            }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={sending}
                                    className="btn-outline"
                                    style={{
                                        padding: '10px 22px',
                                        fontSize: '0.88rem',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending || !email.trim()}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        padding: '10px 24px',
                                        background: sending
                                            ? 'linear-gradient(135deg, #0b8a7f 0%, #0f766e 100%)'
                                            : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.88rem',
                                        border: 'none',
                                        borderRadius: 10,
                                        cursor: sending || !email.trim() ? 'not-allowed' : 'pointer',
                                        opacity: sending || !email.trim() ? 0.7 : 1,
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 10px rgba(13, 148, 136, 0.3)',
                                        minWidth: 130,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!sending && email.trim()) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(13, 148, 136, 0.3)';
                                    }}
                                >
                                    {sending ? (
                                        <>
                                            <span style={{
                                                width: 16,
                                                height: 16,
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTopColor: '#fff',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite',
                                                display: 'inline-block',
                                            }} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane size={13} />
                                            Send Trip
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Close button after success */}
                    {success && (
                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-primary"
                                style={{
                                    padding: '10px 32px',
                                    fontSize: '0.88rem',
                                }}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </form>

                {/* ─── Footer branding ────────────────────── */}
                <div style={{
                    padding: '12px 24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                }}>
                    <FaEnvelope size={12} color="var(--color-primary)" />
                    <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                    }}>
                        Powered by GoTrip Email Delivery
                    </span>
                </div>
            </div>
        </div>
    );
}
