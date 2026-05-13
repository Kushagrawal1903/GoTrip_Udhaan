import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp, FaTimes, FaPaperPlane } from 'react-icons/fa';

/**
 * WhatsAppModal — Premium modal for sending trip details via WhatsApp.
 * Matches the existing GoTrip design system (CSS custom properties, glass cards).
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen    - Whether the modal is visible
 * @param {Function} props.onClose   - Close callback
 * @param {Function} props.onSend    - Submit callback (receives phoneNumber string)
 * @param {boolean}  props.sending   - Loading state
 * @param {string}   props.error     - Error message to display
 * @param {string}   props.success   - Success message to display
 * @param {string}   props.destination - Trip destination for display
 */
export default function WhatsAppModal({ isOpen, onClose, onSend, sending, error, success, destination }) {
    const [phone, setPhone] = useState('');
    const [localError, setLocalError] = useState('');
    const inputRef = useRef(null);
    const modalRef = useRef(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhone('');
            setLocalError('');
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

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

        const cleaned = phone.replace(/[^0-9]/g, '');

        if (!cleaned) {
            setLocalError('Please enter your WhatsApp number.');
            return;
        }

        if (cleaned.length < 10) {
            setLocalError('Phone number is too short. Please enter a valid number.');
            return;
        }

        if (cleaned.length > 15) {
            setLocalError('Phone number is too long. Please check and try again.');
            return;
        }

        onSend(cleaned);
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
            aria-label="Send trip on WhatsApp"
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
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaWhatsapp size={24} color="#fff" />
                        <div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: '#fff',
                                lineHeight: 1.3,
                            }}>
                                Receive Trip on WhatsApp
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
                                    Check your WhatsApp for the trip details
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
                                htmlFor="whatsapp-phone-input"
                                style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                WhatsApp Number
                            </label>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0,
                                marginBottom: 8,
                            }}>
                                {/* Country code prefix */}
                                <div style={{
                                    padding: '13px 14px',
                                    background: 'var(--bg-glass)',
                                    border: '1.5px solid var(--border-color)',
                                    borderRight: 'none',
                                    borderRadius: '10px 0 0 10px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    minWidth: 56,
                                    textAlign: 'center',
                                    userSelect: 'none',
                                }}>
                                    +91
                                </div>
                                <input
                                    ref={inputRef}
                                    id="whatsapp-phone-input"
                                    type="tel"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        setLocalError('');
                                    }}
                                    placeholder="Enter WhatsApp Number"
                                    disabled={sending}
                                    autoComplete="tel"
                                    className="input-field"
                                    style={{
                                        borderRadius: '0 10px 10px 0',
                                        flex: 1,
                                    }}
                                />
                            </div>

                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: 20,
                                lineHeight: 1.5,
                            }}>
                                We'll send your complete trip itinerary to this number via WhatsApp.
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
                                    disabled={sending || !phone.trim()}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        padding: '10px 24px',
                                        background: sending
                                            ? 'linear-gradient(135deg, #20b858 0%, #128C7E 100%)'
                                            : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.88rem',
                                        border: 'none',
                                        borderRadius: 10,
                                        cursor: sending || !phone.trim() ? 'not-allowed' : 'pointer',
                                        opacity: sending || !phone.trim() ? 0.7 : 1,
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 10px rgba(37, 211, 102, 0.3)',
                                        minWidth: 130,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!sending && phone.trim()) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(37, 211, 102, 0.3)';
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
                    <FaWhatsapp size={13} color="#25D366" />
                    <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                    }}>
                        Powered by Meta WhatsApp Business API
                    </span>
                </div>
            </div>
        </div>
    );
}
