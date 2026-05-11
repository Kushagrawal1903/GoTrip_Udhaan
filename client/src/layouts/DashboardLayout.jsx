import { useState, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';

export default function DashboardLayout() {
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
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
                <div style={{
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

            {/* Mobile bottom nav */}
            <div className="mobile-bottom-nav" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, height: 60,
                background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)',
                display: 'none', alignItems: 'center', justifyContent: 'space-around',
                zIndex: 50, padding: '0 8px',
            }}>
                {[
                    { icon: '📊', label: 'Home', to: '/dashboard' },
                    { icon: '✨', label: 'New', to: '/plan' },
                    { icon: '🗺️', label: 'Trips', to: '/dashboard/trips' },
                    { icon: '👥', label: 'Collab', to: '/dashboard/collaborations' },
                    { icon: '👤', label: 'Profile', action: () => setMobileOpen(true) },
                ].map(item => (
                    <a
                        key={item.label}
                        href={item.to || '#'}
                        onClick={item.action ? (e) => { e.preventDefault(); item.action(); } : undefined}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600,
                            padding: '6px 12px',
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }} aria-hidden="true">{item.icon}</span>
                        {item.label}
                    </a>
                ))}
            </div>
        </div>
    );
}
