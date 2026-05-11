import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_STYLES = {
    accepted: { bg: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', label: 'Active' },
    pending:  { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', label: 'Pending' },
};

export default function Collaborations() {
    const { user } = useAuth();
    const { data: collabs = [], isLoading } = useQuery({
        queryKey: ['dashboard', 'collaborations', 'full', user?.id],
        queryFn: async () => {
            const res = await api.get('/dashboard/collaborations');
            return res.data.data;
        },
        enabled: !!user?.id,
    });

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                Trips you're collaborating on or have shared with others.
            </p>
            {isLoading ? (
                <div className="loading-dots" style={{ textAlign: 'center', padding: '40px' }}><span /><span /><span /></div>
            ) : collabs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '2px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">👥</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>No collaborations yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Share a trip to start planning together.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {collabs.map((c, i) => {
                        const st = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
                        return (
                            <Link
                                key={i}
                                to={`/trip/${c.tripId}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                                    borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                    textDecoration: 'none', transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                    background: 'var(--color-primary)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.85rem', fontWeight: 700,
                                }}>{(c.collaboratorName || '?')[0].toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{c.collaboratorName}</div>
                                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                        {c.tripDestination} · {c.role} · {c.type === 'outgoing' ? 'You invited' : 'Invited you'}
                                    </div>
                                </div>
                                <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
