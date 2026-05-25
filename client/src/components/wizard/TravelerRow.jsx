import React from 'react';

// Generates a deterministic pastel HSL color based on an index
const getAvatarColor = (index) => {
    const hue = (index * 137.5) % 360; // Use golden ratio spacing
    return `hsl(${hue}, 65%, 75%)`;
};

// Extract initials from name
const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function TravelerRow({ traveler, index, destination, onUpdate, onRemove }) {
    const isCreator = traveler.role === 'creator';
    const avatarBg = getAvatarColor(index);
    const initials = getInitials(traveler.name);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 1fr auto',
            gap: 12,
            alignItems: 'center',
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
            marginBottom: 10
        }} className="traveler-row-grid">
            {/* Deterministic Pastel Avatar */}
            <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: avatarBg,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid rgba(0,0,0,0.05)',
                userSelect: 'none',
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4)'
            }}>
                {initials}
            </div>

            {/* Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input
                    type="text"
                    value={traveler.name}
                    onChange={(e) => onUpdate(traveler.id, 'name', e.target.value)}
                    placeholder={isCreator ? "Your Name" : `Traveler ${index + 1} Name`}
                    maxLength={40}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    required
                />
            </div>

            {/* Origin City Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input
                    type="text"
                    value={traveler.origin}
                    onChange={(e) => onUpdate(traveler.id, 'origin', e.target.value)}
                    placeholder="Starting city (optional)"
                    maxLength={60}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                {traveler.origin && traveler.origin.trim() && destination && (
                    <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-primary)',
                        opacity: 0.85,
                        display: 'block',
                        marginTop: 2,
                        fontWeight: 500
                    }}>
                        ✈️ We'll recommend how to reach {destination}
                    </span>
                )}
            </div>

            {/* Remove Button */}
            <div>
                <button
                    type="button"
                    onClick={() => onRemove(traveler.id)}
                    disabled={isCreator}
                    aria-label={`Remove traveler ${index + 1}`}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        background: isCreator ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                        color: isCreator ? 'var(--text-muted)' : '#ef4444',
                        cursor: isCreator ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isCreator ? 0.3 : 0.8,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!isCreator) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.opacity = '1';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isCreator) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                            e.currentTarget.style.opacity = '0.8';
                        }
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
