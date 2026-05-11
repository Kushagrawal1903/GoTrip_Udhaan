import { useNavigate } from 'react-router-dom';

const ACTIONS = [
    { icon: '✨', label: 'Generate Itinerary', sub: 'AI-powered trip planning', to: '/plan', color: '#3b82f6' },
    { icon: '🧳', label: 'Smart Packing List', sub: 'Weather-aware lists', to: '/dashboard/packing-lists', color: '#0d9488' },
    { icon: '📄', label: 'Export to PDF', sub: 'Professional travel docs', to: '/dashboard/exports', color: '#d97706' },
    { icon: '👥', label: 'Invite Collaborator', sub: 'Plan trips together', to: '/dashboard/collaborations', color: '#8b5cf6' },
];

export default function QuickActions() {
    const navigate = useNavigate();

    return (
        <div style={{
            borderRadius: 12, border: '1px solid var(--border-color)',
            background: 'var(--bg-card)', overflow: 'hidden',
        }}>
            <div style={{
                padding: '16px 18px', borderBottom: '1px solid var(--border-color)',
                fontWeight: 700, fontSize: '0.9rem',
            }}>Quick Actions</div>
            {ACTIONS.map((a, i) => (
                <div
                    key={i}
                    onClick={() => navigate(a.to)}
                    role="button"
                    tabIndex={0}
                    aria-label={a.label}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '13px 18px', cursor: 'pointer',
                        borderBottom: i < ACTIONS.length - 1 ? '1px solid var(--border-color)' : 'none',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <span style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: `${a.color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0,
                    }} aria-hidden="true">{a.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.sub}</div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} aria-hidden="true">→</span>
                </div>
            ))}
        </div>
    );
}
