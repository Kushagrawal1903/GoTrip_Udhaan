const STAT_ICONS = ['🌏', '📍', '📅', '👥'];
const STAT_COLORS = ['#0d9488', '#3b82f6', '#d97706', '#8b5cf6'];

export default function StatCard({ index = 0, label, value, subtext, subtextColor }) {
    return (
        <div className="dashboard-stat-card" style={{
            padding: '20px', borderRadius: 12,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: 6,
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${STAT_COLORS[index]}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.95rem',
                }} aria-hidden="true">{STAT_ICONS[index]}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {label}
                </span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {value}
            </div>
            <div style={{
                fontSize: '0.76rem', fontWeight: 600,
                color: subtextColor || 'var(--text-muted)',
            }}>
                {subtext}
            </div>
        </div>
    );
}
