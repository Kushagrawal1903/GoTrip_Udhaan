import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const HOME_LINKS = ['How It Works', 'Features', 'Passport', 'Popular Trips', 'Pricing'];

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const isHome = location.pathname === '/';

    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setScrolled(currentScrollY > 40);
            setHidden(currentScrollY > lastScrollY && currentScrollY > 200);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const showSolid = !isHome || scrolled;
    const navClass = `navbar-responsive ${isHome ? 'nav-home' : ''} ${isHome && scrolled ? 'nav-glass' : ''}`;
    const planningPath = isAuthenticated ? '/plan' : '/register';

    return (
        <nav className={navClass} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 100,
            width: '100%',
            padding: '0 32px',
            height: isHome ? 74 : 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isHome
                ? 'rgba(5, 13, 23, 0.62)'
                : (showSolid ? 'var(--bg-secondary)' : 'transparent'),
            borderBottom: isHome
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : (showSolid ? '1px solid var(--border-color)' : 'none'),
            backdropFilter: isHome ? 'blur(18px)' : 'none',
            WebkitBackdropFilter: isHome ? 'blur(18px)' : 'none',
            transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            boxShadow: isHome ? '0 1px 24px rgba(0, 0, 0, 0.18)' : (showSolid ? 'var(--shadow-sm)' : 'none'),
            transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        }}>
            <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                flexShrink: 0,
            }}>
                <span style={{
                    fontWeight: 800,
                    fontSize: isHome ? '1.8rem' : '1.45rem',
                    letterSpacing: 0,
                    transition: 'color 0.3s',
                    color: '#fff',
                    lineHeight: 1,
                }}>
                    Go<span style={{ color: '#f59e0b' }}>Trip</span>
                </span>
            </Link>

            {isAuthenticated && (
                <div className="nav-center-desktop" style={{
                    display: 'flex',
                    gap: 4,
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
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
                                    color: isActive ? '#fff' : (isHome ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'),
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

            {!isAuthenticated && isHome && (
                <div className="nav-center-desktop" style={{
                    display: 'flex',
                    gap: 38,
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}>
                    {HOME_LINKS.map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                            style={{
                                color: 'rgba(255,255,255,0.78)',
                                fontSize: '0.95rem',
                                fontWeight: 650,
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                                letterSpacing: 0,
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(event) => { event.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(event) => { event.currentTarget.style.color = 'rgba(255,255,255,0.78)'; }}
                        >
                            {item}
                        </a>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isAuthenticated ? (
                    <>
                        <span style={{
                            fontSize: '0.8rem',
                            color: isHome ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: showSolid ? 'var(--bg-glass)' : 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.3s',
                            whiteSpace: 'nowrap',
                        }}>
                            {user?.name?.split(' ')[0]}
                        </span>

                        <ThemeToggle />

                        <button
                            className="nav-user-desktop"
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
                            onMouseEnter={(event) => {
                                event.currentTarget.style.background = 'var(--color-danger)';
                                event.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.background = 'transparent';
                                event.currentTarget.style.color = 'var(--color-danger)';
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        {!isHome && <ThemeToggle />}
                        <Link
                            to="/login"
                            style={{
                                padding: '8px 18px',
                                fontWeight: 600,
                                fontSize: isHome ? '0.95rem' : '0.88rem',
                                color: isHome ? '#fff' : 'var(--text-primary)',
                                textDecoration: 'none',
                                transition: 'color 0.3s',
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to={planningPath}
                            style={{
                                padding: isHome ? '13px 24px' : '10px 24px',
                                background: isHome ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' : 'var(--color-primary)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: isHome ? '0.95rem' : '0.85rem',
                                borderRadius: isHome ? 12 : 10,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                boxShadow: isHome ? '0 8px 26px rgba(234, 88, 12, 0.34), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                border: isHome ? '1px solid rgba(255,255,255,0.16)' : 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {isHome ? <>Start Planning <FiZap aria-hidden="true" /></> : 'Get Started'}
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
