import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STYLE_THEMES = {
    adventure: { bg: 'linear-gradient(135deg, #065f46, #059669)', emoji: '🏔️', color: '#059669' },
    relaxation: { bg: 'linear-gradient(135deg, #0e7490, #14b8a6)', emoji: '🏖️', color: '#0d9488' },
    cultural: { bg: 'linear-gradient(135deg, #92400e, #d97706)', emoji: '🏛️', color: '#d97706' },
    family: { bg: 'linear-gradient(135deg, #1e40af, #3b82f6)', emoji: '🎡', color: '#3b82f6' },
    romantic: { bg: 'linear-gradient(135deg, #9d174d, #ec4899)', emoji: '🌹', color: '#ec4899' },
};
const DEFAULT_THEME = { bg: 'linear-gradient(135deg, #374151, #6b7280)', emoji: '✈️', color: '#6b7280' };

const TripCard = React.memo(function TripCard({ trip, onExportPDF }) {
    const navigate = useNavigate();
    const [exporting, setExporting] = useState(false);
    const theme = STYLE_THEMES[trip.style] || DEFAULT_THEME;

    const handleExport = async (e) => {
        e.stopPropagation();
        setExporting(true);
        try {
            await onExportPDF(trip._id, trip.destination);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div
            onClick={() => navigate(`/trip/${trip._id}`)}
            role="button"
            tabIndex={0}
            aria-label={`View trip to ${trip.destination}`}
            style={{
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
            {/* Card header — styled background */}
            <div style={{
                height: 80, background: theme.bg, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} aria-hidden="true">
                <span style={{ fontSize: '2rem', opacity: 0.7 }}>{theme.emoji}</span>
                {trip.destinationImage && (
                    <img
                        src={trip.destinationImage}
                        alt=""
                        aria-hidden="true"
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover', opacity: 0.35,
                        }}
                    />
                )}
            </div>

            {/* Card body */}
            <div style={{ padding: '14px 16px' }}>
                <div style={{
                    fontWeight: 700, fontSize: '0.95rem', marginBottom: 8,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: 'var(--text-primary)',
                }}>{trip.destination}</div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    <span>📅 {trip.duration} days</span>
                    <span>👤 {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{
                        padding: '3px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700,
                        background: `${theme.color}12`, color: theme.color, textTransform: 'capitalize',
                    }}>{trip.style}</span>
                    {trip.hasPackingList && (
                        <span style={{
                            padding: '3px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600,
                            background: 'rgba(13, 148, 136, 0.08)', color: '#0d9488',
                        }}>🧳 Packed</span>
                    )}
                    {trip.collaboratorCount > 0 && (
                        <span style={{
                            padding: '3px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600,
                            background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6',
                        }}>👥 {trip.collaboratorCount}</span>
                    )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {[
                        { label: 'View', icon: '👁️', action: () => navigate(`/trip/${trip._id}`) },
                        { label: exporting ? '...' : 'PDF', icon: '📄', action: handleExport },
                        { label: 'Share', icon: '🔗', action: (e) => { e.stopPropagation(); navigate(`/trip/${trip._id}?collab=1`); } },
                    ].map(btn => (
                        <button
                            key={btn.label}
                            onClick={e => { e.stopPropagation(); btn.action(e); }}
                            disabled={btn.label === '...'}
                            aria-label={btn.label}
                            style={{
                                flex: 1, padding: '7px 4px', borderRadius: 6,
                                border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                color: 'var(--text-secondary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: 4,
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                            <span aria-hidden="true">{btn.icon}</span> {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default TripCard;
