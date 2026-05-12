import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle — Dark/Light mode toggle button with sun/moon icon
 */
export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease, transform 0.2s ease',
                color: 'var(--text-primary)',
            }}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}
