import React, { useState } from 'react';

// Maps transport modes to Tabler icon classnames
const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
        case 'flight': return 'ti ti-plane-departure';
        case 'train': return 'ti ti-train';
        case 'bus': return 'ti ti-bus';
        case 'car': return 'ti ti-car';
        default: return 'ti ti-arrows-left-right';
    }
};

const getModeColor = (mode) => {
    switch (mode?.toLowerCase()) {
        case 'flight': return '#3b82f6'; // Blue
        case 'train': return '#10b981'; // Emerald
        case 'bus': return '#f59e0b'; // Amber
        case 'car': return '#8b5cf6'; // Purple
        default: return '#64748b'; // Slate
    }
};

export default function TravelerRecommendationCard({ recommendation }) {
    const { travelerName, origin, destination, options, recommendedOption } = recommendation;
    const [expandedOptionIndex, setExpandedOptionIndex] = useState(0);

    // Filter to find matching option for the primary recommendation
    const primaryOptionIndex = options.findIndex(o => o.mode === recommendedOption) >= 0
        ? options.findIndex(o => o.mode === recommendedOption)
        : 0;

    return (
        <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden'
        }} className="traveler-recommendation-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <i className="ti ti-user" style={{ color: 'var(--color-primary)' }} />
                        {travelerName}
                    </h3>
                    <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500
                    }}>
                        From <span style={{ color: 'var(--text-primary)' }}>{origin}</span> to <span style={{ color: 'var(--text-primary)' }}>{destination}</span>
                    </p>
                </div>
            </div>

            {/* Options Tabs */}
            <div style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="recommendation-tabs">
                {options.map((option, idx) => {
                    const isRecommended = option.mode === recommendedOption;
                    const isSelected = expandedOptionIndex === idx;
                    const modeColor = getModeColor(option.mode);

                    return (
                        <button
                            key={idx}
                            onClick={() => setExpandedOptionIndex(idx)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 10,
                                background: isSelected 
                                    ? `rgba(${isRecommended ? '16, 185, 129' : '99, 102, 241'}, 0.08)`
                                    : 'var(--bg-surface)',
                                border: `1px solid ${isSelected 
                                    ? (isRecommended ? '#10b981' : 'var(--color-primary)') 
                                    : 'var(--border-color)'}`,
                                color: isSelected 
                                    ? (isRecommended ? '#10b981' : 'var(--text-primary)')
                                    : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: isSelected ? 700 : 500,
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <i className={getModeIcon(option.mode)} style={{ color: isSelected ? undefined : modeColor, fontSize: '0.95rem' }} />
                            <span>{option.mode.charAt(0).toUpperCase() + option.mode.slice(1)}</span>
                            {isRecommended && (
                                <span style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    borderRadius: 6,
                                    background: '#10b981',
                                    color: '#fff',
                                    fontWeight: 700,
                                    marginLeft: 2
                                }}>
                                    Best
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Option Content */}
            {options[expandedOptionIndex] && (
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    {/* Cost & Duration details */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: 12
                    }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Estimate</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                                {options[expandedOptionIndex].estimatedCost}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Travel Time</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                                {options[expandedOptionIndex].estimatedDuration}
                            </div>
                        </div>
                    </div>

                    {/* Details and Booking Hints */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                            <strong>Details:</strong> {options[expandedOptionIndex].details}
                        </div>
                        {options[expandedOptionIndex].bookingHint && (
                            <div style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                padding: '6px 10px',
                                borderRadius: 6,
                                borderLeft: '3px solid var(--wiz-teal)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }}>
                                <i className="ti ti-info-circle" style={{ color: 'var(--wiz-teal)', fontSize: '0.9rem' }} />
                                <span>{options[expandedOptionIndex].bookingHint}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
