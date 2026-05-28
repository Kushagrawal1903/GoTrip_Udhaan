import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';

export default function DashboardLayout() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('gotrip-sidebar-collapsed') === 'true'; } catch { return false; }
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        try { localStorage.setItem('gotrip-sidebar-collapsed', String(collapsed)); } catch {}
    }, [collapsed]);

    // Close mobile sidebar on resize to desktop
    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="dashboard-container">
            {/* Desktop sidebar */}
            <div className="sidebar-desktop">
                <Sidebar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(v => !v)}
                />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <>
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                            zIndex: 60, cursor: 'pointer',
                        }}
                    />
                    <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 70 }}>
                        <Sidebar
                            collapsed={false}
                            onToggle={() => setMobileOpen(false)}
                        />
                    </div>
                </>
            )}

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onMobileMenuToggle={() => setMobileOpen(v => !v)}
                />
                <div className="dashboard-main-content" style={{
                    flex: 1, overflowY: 'auto',
                    padding: '24px 28px',
                    animation: 'fadeIn 0.2s ease',
                }}>
                    <Suspense fallback={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
                            <div className="loading-dots"><span /><span /><span /></div>
                        </div>
                    }>
                        <Outlet context={{ searchQuery }} />
                    </Suspense>
                </div>
            </div>

            <div className="mobile-bottom-nav" style={{
                position: 'fixed', 
                bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', 
                left: 12, right: 12, height: 64,
                background: 'var(--bg-glass-nav)', 
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                display: 'none', alignItems: 'center', justifyContent: 'space-around',
                zIndex: 100, padding: '0 10px',
                boxShadow: 'var(--shadow-lg)',
            }}>
                {[
                    { icon: '🏠', label: 'Home', to: '/dashboard' },
                    { icon: '🗺️', label: 'Trips', to: '/dashboard/trips' },
                    { icon: '✨', label: 'New Trip', to: '/plan', special: true },
                    { icon: '👥', label: 'Collab', to: '/dashboard/collaborations' },
                    { icon: '👤', label: 'Menu', action: () => setMobileOpen(true) },
                ].map(item => {
                    const isActive = location.pathname === item.to;
                    return (
                        <Link
                            key={item.label}
                            to={item.to || '#'}
                            onClick={item.action ? (e) => { e.preventDefault(); item.action(); } : undefined}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                textDecoration: 'none', 
                                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)', 
                                fontSize: '0.68rem', fontWeight: 700,
                                padding: '8px 12px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                position: 'relative',
                            }}
                        >
                            <span style={{ 
                                fontSize: item.special ? '1.5rem' : '1.25rem',
                                marginTop: item.special ? -8 : 0,
                                background: item.special ? 'var(--color-primary)' : 'transparent',
                                color: item.special ? '#fff' : 'inherit',
                                width: item.special ? 48 : 'auto',
                                height: item.special ? 48 : 'auto',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: item.special ? '50%' : '0',
                                boxShadow: item.special ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
                            }} aria-hidden="true">{item.icon}</span>
                            {!item.special && item.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
