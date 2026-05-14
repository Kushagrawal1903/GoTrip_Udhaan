import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from '../layout/ThemeToggle';

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/dashboard/trips': 'My Trips',
    '/dashboard/stats': 'Travel Stats',
    '/dashboard/packing-lists': 'Packing Lists',
    '/dashboard/collaborations': 'Collaborations',
    '/dashboard/exports': 'Exports',
    '/dashboard/explore': 'Explore',
    '/dashboard/profile': 'My Profile',
    '/dashboard/settings': 'Settings',
};

export default function TopBar({ searchQuery, onSearchChange, onMobileMenuToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const title = PAGE_TITLES[location.pathname] || 'Dashboard';
    
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        document.title = `${title} — GoTrip`;
    }, [title]);

    // Close search on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowMobileSearch(false);
            }
        }
        if (showMobileSearch) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMobileSearch]);

    return (
        <div style={{
            height: 64, minHeight: 64,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 16px', // Reduced padding for mobile
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky', top: 0, zIndex: 40,
        }}>
            {/* Mobile Search Popup */}
            {showMobileSearch && (
                <div ref={searchRef} style={{
                    position: 'absolute', top: 68, left: 16, right: 16,
                    background: 'var(--bg-secondary)',
                    borderRadius: 14, border: '1px solid var(--border-color)',
                    padding: '10px', boxShadow: 'var(--shadow-xl)',
                    zIndex: 100,
                    animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            fontSize: '0.9rem', color: 'var(--text-muted)', pointerEvents: 'none',
                        }} aria-hidden="true">🔍</span>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search trips, destinations…"
                            value={searchQuery}
                            onChange={e => onSearchChange(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px 12px 40px',
                                borderRadius: 10, border: '1.5px solid var(--color-primary)',
                                background: 'var(--bg-glass)', color: 'var(--text-primary)',
                                fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Mobile hamburger */}
            <button
                className="mobile-menu-toggle"
                onClick={onMobileMenuToggle}
                aria-label="Toggle menu"
                style={{
                    display: 'none', width: 36, height: 36, borderRadius: 8,
                    border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                    cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', color: 'var(--text-primary)',
                }}
            >☰</button>

            {/* Page title */}
            <h1 className="topbar-title" style={{
                fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)',
                letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>{title}</h1>

            {/* Search bar — hidden on mobile */}
            <div className="search-container-desktop" style={{
                flex: 1, maxWidth: 420, marginLeft: 24,
                position: 'relative',
            }}>
                <span style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: '0.85rem', color: 'var(--text-muted)', pointerEvents: 'none',
                }} aria-hidden="true">🔍</span>
                <input
                    type="text"
                    placeholder="Search trips, destinations…"
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    aria-label="Search trips and destinations"
                    style={{
                        width: '100%', padding: '9px 14px 9px 36px',
                        borderRadius: 10, border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-glass)', color: 'var(--text-primary)',
                        fontSize: '0.85rem', fontFamily: 'inherit',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                />
            </div>

            <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                {/* Mobile Search Toggle */}
                <button
                    className="mobile-search-toggle"
                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                    aria-label="Toggle search"
                    style={{
                        display: 'none', // Shown via CSS
                        width: 36, height: 36, borderRadius: 8,
                        border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                        cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', color: 'var(--text-primary)',
                    }}
                >🔍</button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile Toggle */}
                <button
                    onClick={() => navigate('/dashboard/profile')}
                    aria-label="Profile"
                    title="Profile"
                    style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                >👤</button>

                {/* Settings Toggle */}
                <button
                    onClick={() => navigate('/dashboard/settings')}
                    aria-label="Settings"
                    title="Settings"
                    style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                >⚙️</button>

                {/* Notifications */}
                <NotificationDropdown userId={user?.id} />

                {/* CTA — hidden on mobile as it's in bottom nav */}
                <button
                    onClick={() => navigate('/plan')}
                    className="btn-primary btn-primary-desktop"
                    style={{
                        padding: '9px 18px', fontSize: '0.82rem', fontWeight: 600,
                        gap: 6,
                    }}
                >
                    <span aria-hidden="true">✨</span> Plan New Trip
                </button>
            </div>
        </div>
    );
}
