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
};

export default function TopBar({ searchQuery, onSearchChange, onMobileMenuToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const title = PAGE_TITLES[location.pathname] || 'Dashboard';

    useEffect(() => {
        document.title = `${title} — GoTrip`;
    }, [title]);

    return (
        <div style={{
            height: 64, minHeight: 64,
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '0 28px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky', top: 0, zIndex: 40,
        }}>
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
            <h1 style={{
                fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)',
                letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>{title}</h1>

            {/* Search bar */}
            <div style={{
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <NotificationDropdown userId={user?.id} />

                {/* CTA */}
                <button
                    onClick={() => navigate('/plan')}
                    className="btn-primary"
                    style={{
                        padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    }}
                >
                    <span aria-hidden="true">✨</span> Plan New Trip
                </button>
            </div>
        </div>
    );
}
