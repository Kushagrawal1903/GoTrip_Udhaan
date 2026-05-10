import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Login Page — Full-screen split layout
 */
export default function Login() {
    const { login, loginWithGoogle, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (isAuthenticated) return <Navigate to="/plan" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
            navigate('/plan');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                        Welcome back
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                        marginBottom: 32,
                    }}>
                        Sign in to access your AI-powered trip plans, saved itineraries, and personalized travel recommendations.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['Gemma 3 AI', 'Google Maps', 'INR Budget'].map(t => (
                            <span key={t} style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.4)',
                                fontWeight: 500,
                                padding: '6px 14px',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 6,
                            }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Login Form */}
            <div style={{
                flex: '1 1 50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: 'var(--bg-primary)',
            }}>
                <div className="animate-slide-right" style={{ width: '100%', maxWidth: 380 }}>
                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h2 style={{
                            fontWeight: 700,
                            fontSize: '1.6rem',
                            marginBottom: 6,
                            letterSpacing: '-0.01em',
                        }}>
                            Sign In
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Enter your credentials to continue
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="animate-scale-in" style={{
                            padding: '12px 16px',
                            background: 'rgba(220, 38, 38, 0.08)',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            borderRadius: 10,
                            color: '#dc2626',
                            fontSize: '0.88rem',
                            marginBottom: 20,
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ margin: '0 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    await loginWithGoogle(credentialResponse.credential);
                                    navigate('/plan');
                                } catch (err) {
                                    setError(err.response?.data?.message || 'Google Login failed.');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                setError('Google Login failed.');
                            }}
                            theme="filled_black"
                            shape="circle"
                        />
                    </div>

                    {/* Footer */}
                    <p style={{
                        textAlign: 'center',
                        marginTop: 24,
                        color: 'var(--text-muted)',
                        fontSize: '0.88rem',
                    }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>

            {/* Responsive: hide left panel on mobile */}
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
