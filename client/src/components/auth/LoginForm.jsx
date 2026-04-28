import { useState } from 'react';
import GlassCard from '../ui/GlassCard';

/**
 * LoginForm — email and password login form
 */
export default function LoginForm({ onSubmit, loading = false, error = '' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <GlassCard hover={false} style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✈️</div>
                <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    marginBottom: 6,
                }}>
                    Welcome Back
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Sign in to access your trips
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 10,
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    marginBottom: 20,
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}

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
                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </GlassCard>
    );
}
