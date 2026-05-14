import { useState } from 'react';

/**
 * ToggleRow — Reusable toggle switch row for settings pages
 * @param {string} label - Toggle label
 * @param {string} description - Optional description below label
 * @param {boolean} checked - Current toggle state
 * @param {function} onChange - Callback with new boolean value
 * @param {boolean} disabled - Whether toggle is disabled
 */
export default function ToggleRow({ label, description, checked, onChange, disabled = false }) {
    const [saved, setSaved] = useState(false);

    const handleToggle = () => {
        if (disabled) return;
        onChange(!checked);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 0', borderBottom: '1px solid var(--border-color)',
            gap: 12, minHeight: 44,
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.88rem', fontWeight: 500,
                    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>{label}</div>
                {description && (
                    <div style={{
                        fontSize: '0.75rem', color: 'var(--text-muted)',
                        marginTop: 2, lineHeight: 1.4,
                    }}>{description}</div>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {saved && (
                    <span style={{
                        fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600,
                        animation: 'fadeIn 0.3s ease',
                    }}>Saved</span>
                )}
                <button
                    role="switch"
                    aria-checked={checked}
                    aria-label={label}
                    onClick={handleToggle}
                    disabled={disabled}
                    style={{
                        position: 'relative', width: 42, height: 24, borderRadius: 12,
                        background: checked ? 'var(--color-primary)' : 'var(--bg-glass)',
                        border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--border-color)'}`,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease', padding: 0,
                        opacity: disabled ? 0.5 : 1,
                    }}
                >
                    <span style={{
                        position: 'absolute', top: 2, left: checked ? 20 : 2,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s ease',
                    }} />
                </button>
            </div>
        </div>
    );
}
