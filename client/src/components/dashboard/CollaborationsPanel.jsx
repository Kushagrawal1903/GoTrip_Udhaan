import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUS_STYLES = {
    accepted: { bg: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', label: 'Active' },
    pending:  { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', label: 'Pending' },
    declined: { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', label: 'Declined' },
};

function getInitialColor(name) {
    const colors = ['#0d9488', '#3b82f6', '#d97706', '#8b5cf6', '#ec4899', '#059669'];
    let hash = 0;
    for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export default function CollaborationsPanel({ userId }) {
    const { data: collabs = [], isLoading } = useQuery({
        queryKey: ['dashboard', 'collaborations', userId],
        queryFn: async () => {
            const res = await api.get('/dashboard/collaborations');
            return res.data.data;
        },
        enabled: !!userId,
    });

    return (
        <div style={{
            borderRadius: 12, border: '1px solid var(--border-color)',
            background: 'var(--bg-card)', overflow: 'hidden', marginTop: 16,
            marginBottom: 24, // Added bottom margin
        }}>
            <div style={{
                padding: '16px 18px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Collaborations</span>
                <Link to="/dashboard/collaborations" style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    View all →
                </Link>
            </div>

            {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} style={{ padding: '12px 18px', display: 'flex', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-glass)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ height: 12, width: '60%', background: 'var(--bg-glass)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
                            <div style={{ height: 10, width: '40%', background: 'var(--bg-glass)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        </div>
                    </div>
                ))
            ) : collabs.length === 0 ? (
                <div style={{ padding: '28px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }} aria-hidden="true">🤝</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        No collaborators yet.<br />Invite someone to plan together.
                    </p>
                </div>
            ) : (
                collabs.map((c, i) => {
                    const st = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
                    const initial = (c.collaboratorName || '?')[0].toUpperCase();
                    const color = getInitialColor(c.collaboratorName || '');
                    return (
                        <Link
                            key={i}
                            to={`/trip/${c.tripId}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 18px', textDecoration: 'none',
                                borderBottom: i < collabs.length - 1 ? '1px solid var(--border-color)' : 'none',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                background: color, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.78rem', fontWeight: 700,
                            }}>{initial}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>{c.collaboratorName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {c.tripDestination} · {c.role}
                                </div>
                            </div>
                            <span style={{
                                padding: '3px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700,
                                background: st.bg, color: st.color,
                            }}>{st.label}</span>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
