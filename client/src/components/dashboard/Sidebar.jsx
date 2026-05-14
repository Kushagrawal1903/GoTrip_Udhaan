import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
    {
        label: 'Main',
        items: [
            { to: '/dashboard', icon: '📊', label: 'Dashboard' },
            { to: '/plan', icon: '✨', label: 'New Trip' },
            { to: '/dashboard/trips', icon: '🗺️', label: 'My Trips' },
            { to: '/dashboard/explore', icon: '🧭', label: 'Explore' },
        ],
    },
    {
        label: 'Tools',
        items: [
            { to: '/dashboard/packing-lists', icon: '🧳', label: 'Packing Lists' },
            { to: '/dashboard/collaborations', icon: '👥', label: 'Collaborations', badgeKey: 'collabs' },
            { to: '/dashboard/exports', icon: '📄', label: 'Exports' },
            { to: '/dashboard/stats', icon: '📈', label: 'Travel Stats' },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle, badges = {} }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Close user menu on click outside
    useEffect(() => {
        if (!userMenuOpen) return;
        const handler = () => setUserMenuOpen(false);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, [userMenuOpen]);

    const initials = (user?.name || 'U')
        .split(' ')
        .map(s => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            className="dashboard-sidebar"
            style={{
                width: collapsed ? 64 : 240,
                minWidth: collapsed ? 64 : 240,
                height: '100vh',
                position: 'sticky',
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                transition: 'width 0.25s ease, min-width 0.25s ease',
                overflow: 'hidden',
                zIndex: 50,
            }}
        >
            {/* Brand */}
            <div style={{
                padding: collapsed ? '18px 12px' : '18px 20px',
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: '1px solid var(--border-color)',
                minHeight: 64,
            }}>
                <img 
                    src="/GoTrip_Logo.jpeg" 
                    alt="GoTrip Logo" 
                    style={{
                        width: 32, 
                        height: 32, 
                        borderRadius: 8,
                        objectFit: 'cover',
                        flexShrink: 0,
                    }}
                />
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>GoTrip</span>
                        
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={onToggle}
                        aria-label="Collapse sidebar"
                        style={{
                            marginLeft: 'auto', width: 28, height: 28, borderRadius: 6,
                            border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-muted)', fontSize: '0.8rem',
                        }}
                    >◀</button>
                )}
                {collapsed && (
                    <button
                        onClick={onToggle}
                        aria-label="Expand sidebar"
                        style={{
                            position: 'absolute', right: -12, top: 20, width: 24, height: 24, borderRadius: '50%',
                            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-muted)', fontSize: '0.65rem', boxShadow: 'var(--shadow-sm)',
                            zIndex: 10,
                        }}
                    >▶</button>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
                {NAV_GROUPS.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: 16 }}>
                        {!collapsed && (
                            <div style={{
                                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.06em', color: 'var(--text-muted)',
                                padding: '4px 12px 8px', userSelect: 'none',
                            }}>{group.label}</div>
                        )}
                        {group.items.map(item => {
                            const active = isActive(item.to);
                            const badge = item.badgeKey && badges[item.badgeKey];
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    aria-label={item.label}
                                    title={collapsed ? item.label : undefined}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: collapsed ? '10px 0' : '9px 12px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        borderRadius: 8, marginBottom: 2,
                                        textDecoration: 'none',
                                        fontSize: '0.88rem', fontWeight: active ? 600 : 500,
                                        color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                                        background: active ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
                                        transition: 'all 0.15s ease',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{ fontSize: '1rem', flexShrink: 0, width: 24, textAlign: 'center' }} aria-hidden="true">{item.icon}</span>
                                    {!collapsed && <span>{item.label}</span>}
                                    {badge > 0 && (
                                        <span style={{
                                            marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9,
                                            background: 'var(--color-primary)', color: '#fff',
                                            fontSize: '0.65rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '0 5px',
                                        }}>{badge}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User section */}
            <div style={{
                borderTop: '1px solid var(--border-color)',
                padding: collapsed ? '12px 8px' : '12px 16px',
                position: 'relative',
            }}>
                <div
                    onClick={e => { e.stopPropagation(); setUserMenuOpen(v => !v); }}
                    role="button"
                    tabIndex={0}
                    aria-label="User menu"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px', borderRadius: 8, cursor: 'pointer',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #0d9488, #14b8a6)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                        overflow: 'hidden', border: user?.avatarUrl ? '1px solid var(--border-color)' : 'none',
                    }}>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : initials}
                    </div>
                    {!collapsed && (
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                                fontSize: '0.82rem', fontWeight: 600,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>Free Plan</div>
                        </div>
                    )}
                    {!collapsed && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    )}
                </div>

                {/* Dropdown */}
                {userMenuOpen && (
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            position: 'absolute', bottom: '100%', left: collapsed ? 8 : 16, right: collapsed ? 8 : 16,
                            marginBottom: 6, borderRadius: 10,
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 100,
                            minWidth: collapsed ? 160 : undefined,
                        }}
                    >
                        {[
                            { label: 'Profile', icon: '👤', action: () => navigate('/dashboard/profile') },
                            { label: 'Settings', icon: '⚙️', action: () => navigate('/dashboard/settings') },
                        ].map(item => (
                            <button
                                key={item.label}
                                onClick={() => { item.action(); setUserMenuOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                                    padding: '10px 14px', border: 'none', background: 'transparent',
                                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                                    color: 'var(--text-secondary)', textAlign: 'left',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span aria-hidden="true">{item.icon}</span> {item.label}
                            </button>
                        ))}
                        <div style={{ height: 1, background: 'var(--border-color)' }} />
                        <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                                padding: '10px 14px', border: 'none', background: 'transparent',
                                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                color: 'var(--color-danger)', textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span aria-hidden="true">🚪</span> Sign out
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
