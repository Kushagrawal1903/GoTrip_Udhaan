import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page — Full-screen split layout
 */
export default function Register() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (isAuthenticated) return <Navigate to="/plan" replace />;

    const passwordStrength = () => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (score <= 1) return { level: 1, label: 'Weak', color: '#dc2626' };
        if (score <= 3) return { level: 2, label: 'Medium', color: '#d97706' };
        return { level: 3, label: 'Strong', color: '#16a34a' };
    };

    const strength = passwordStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return;
        setLoading(true);
        setError('');
        try {
            await register({ name, email, password });
            navigate('/plan');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
        }}>
            {/* Left — Brand Panel */}
            <div style={{
                flex: '1 1 50%',
                background: '#111827',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '60px 48px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
                    <h1 style={{
                        fontWeight: 800,
                        fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                        color: '#fff',
                        marginBottom: 12,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                    }}>
                        Start your journey
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                        marginBottom: 32,
                    }}>
                        Create a free account and unlock AI-powered travel planning with personalized itineraries, real hotel recommendations, and detailed budget breakdowns.
                    </p>

                    {/* Features list */}
                    <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
                        {[
                            'AI-generated day-by-day plans',
                            'Real hotels with ratings',
                            'Budget breakdown in ₹',
                            'Google Maps integration',
                            'Save & export as PDF',
                        ].map(f => (
                            <p key={f} style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.85rem',
                                marginBottom: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}>
                                <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>✓</span> {f}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Register Form */}
            <div style={{
                flex: '1 1 50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: 'var(--bg-primary)',
                overflowY: 'auto',
            }}>
                <div className="animate-slide-right" style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{
                            fontWeight: 700,
                            fontSize: '1.6rem',
                            marginBottom: 6,
                            letterSpacing: '-0.01em',
                        }}>
                            Create Account
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Free forever · No credit card required
                        </p>
                    </div>

                    {error && (
                        <div className="animate-scale-in" style={{
                            padding: '12px 16px',
                            background: 'rgba(220, 38, 38, 0.08)',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            borderRadius: 10,
                            color: '#dc2626',
                            fontSize: '0.88rem',
                            marginBottom: 18,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                                minLength={2}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div style={{ marginBottom: 6 }}>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        {/* Password Strength Meter */}
                        {password && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{
                                    height: 3,
                                    borderRadius: 2,
                                    background: 'var(--border-color)',
                                    overflow: 'hidden',
                                    marginBottom: 4,
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(strength.level / 3) * 100}%`,
                                        background: strength.color,
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}

                        <div style={{ marginBottom: 22 }}>
                            <label className="label">Confirm Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                                style={{
                                    borderColor: confirmPassword && password !== confirmPassword
                                        ? 'rgba(220, 38, 38, 0.5)'
                                        : confirmPassword && password === confirmPassword
                                            ? 'rgba(22, 163, 74, 0.5)'
                                            : undefined,
                                }}
                            />
                            {password && confirmPassword && password !== confirmPassword && (
                                <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>
                                    Passwords do not match
                                </p>
                            )}
                            {password && confirmPassword && password === confirmPassword && (
                                <p style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: 4 }}>
                                    ✓ Passwords match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || (password !== confirmPassword) || !name || !email}
                            style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: 24,
                        color: 'var(--text-muted)',
                        fontSize: '0.88rem',
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
        @media (max-width: 900px) {
          div[style*="flex: 1 1 50%"]:first-child {
            display: none !important;
          }
          div[style*="flex: 1 1 50%"]:last-child {
            flex: 1 !important;
          }
        }
      `}</style>
        </div>
    );
}
