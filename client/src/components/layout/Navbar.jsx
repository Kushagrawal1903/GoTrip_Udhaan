import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar — Scroll-aware full-width navigation
 * Transparent on home hero, solid on scroll, solid on other pages
 */
export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showSolid = !isHome || scrolled;

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            padding: '0 32px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: showSolid ? 'var(--bg-secondary)' : 'transparent',
            borderBottom: showSolid ? '1px solid var(--border-color)' : 'none',
            transition: 'all 0.3s ease',
            boxShadow: showSolid ? 'var(--shadow-sm)' : 'none',
        }}>
            {/* Logo */}
            <Link to="/" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                textDecoration: 'none',
            }}>
                <span style={{
                    fontWeight: 800,
                    fontSize: '1.3rem',
                    color: isHome && !scrolled ? '#fff' : 'var(--color-primary)',
                    letterSpacing: '-0.02em',
                    transition: 'color 0.3s',
                }}>
                    GoTrip
                </span>
            </Link>

            {/* Center Links */}
            {isAuthenticated && (
                <div style={{
                    display: 'flex', gap: 4,
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                }}>
                    {[
                        { to: '/plan', label: 'Plan Trip' },
                        { to: '/dashboard', label: 'My Trips' },
                    ].map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: 8,
                                    fontSize: '0.88rem',
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? '#fff' : (isHome && !scrolled ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'),
                                    background: isActive ? 'var(--color-primary)' : 'transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ThemeToggle />

                {isAuthenticated ? (
                    <>
                        <span style={{
                            fontSize: '0.85rem',
                            color: isHome && !scrolled ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: showSolid ? 'var(--bg-glass)' : 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.3s',
                        }}>
                            {user?.name?.split(' ')[0]}
                        </span>
                        <button
                            onClick={logout}
                            style={{
                                padding: '8px 18px',
                                border: '1.5px solid var(--color-danger)',
                                background: 'transparent',
                                color: 'var(--color-danger)',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.target.style.background = 'var(--color-danger)'; e.target.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--color-danger)'; }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            style={{
                                padding: '8px 20px',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                color: isHome && !scrolled ? '#fff' : 'var(--text-primary)',
                                textDecoration: 'none',
                                transition: 'color 0.3s',
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            style={{
                                padding: '9px 24px',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                borderRadius: 8,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
