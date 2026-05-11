import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * JoinTrip — handles /join/:shareToken route for accepting collaboration invites
 */
export default function JoinTrip() {
    const { shareToken } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            // Redirect to login with return path
            navigate(`/login?redirect=/join/${shareToken}`, { replace: true });
            return;
        }

        const joinTrip = async () => {
            try {
                const role = searchParams.get('role') || 'viewer';
                const res = await api.get(`/collaborate/join/${shareToken}?role=${role}`);
                const tripId = res.data.data?.tripId;
                setStatus('success');
                setMessage(res.data.message || 'You have joined the trip!');

                // Redirect to trip detail page after a short delay
                setTimeout(() => {
                    navigate(`/trip/${tripId}`, { replace: true });
                }, 1500);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Failed to join trip. The invite link may be invalid or expired.');
            }
        };

        joinTrip();
    }, [shareToken, isAuthenticated, authLoading, navigate, searchParams]);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', padding: '40px 24px',
        }}>
            <div className="glass-card animate-fade-in-up" style={{
                padding: '48px 40px', textAlign: 'center', maxWidth: 440,
            }}>
                {status === 'loading' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'floatBob 2s ease-in-out infinite' }}>🤝</div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>Joining Trip...</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Setting up your collaboration access.
                        </p>
                        <div className="loading-dots" style={{ marginTop: 20 }}>
                            <span /><span /><span />
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 8, color: '#16a34a' }}>
                            {message}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Redirecting to the trip...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>❌</div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 8, color: '#dc2626' }}>
                            Unable to Join
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                            {message}
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/dashboard')}
                            style={{ padding: '12px 28px' }}
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
