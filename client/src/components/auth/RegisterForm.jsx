import { useState } from 'react';
import GlassCard from '../ui/GlassCard';

/**
 * RegisterForm — name, email, and password registration form
 */
export default function RegisterForm({ onSubmit, loading = false, error = '' }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return; // HTML validation will handle the mismatch message
        }

        onSubmit({ name, email, password });
    };

    return (
        <GlassCard hover={false} style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🌍</div>
                <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    marginBottom: 6,
                }}>
                    Create Account
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Start planning your dream trips
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
                <div style={{ marginBottom: 16 }}>
                    <label className="label">Full Name</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                        minLength={2}
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

                <div style={{ marginBottom: 16 }}>
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

                <div style={{ marginBottom: 24 }}>
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
                    />
                    {password && confirmPassword && password !== confirmPassword && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>
                            Passwords do not match
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || (password !== confirmPassword)}
                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
        </GlassCard>
    );
}
