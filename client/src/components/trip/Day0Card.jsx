import React from 'react';

const getTransportModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
        case 'flight': return 'ti ti-plane';
        case 'train': return 'ti ti-train';
        case 'bus': return 'ti ti-bus';
        case 'car': return 'ti ti-car';
        default: return 'ti ti-route';
    }
};

export default function Day0Card({ meetingPlan }) {
    if (!meetingPlan || (!meetingPlan.meetPoint && !meetingPlan.suggestedArrivalWindow)) return null;

    const { suggestedArrivalWindow, meetPoint, coordinationNotes, travelersWithArrivals = [] } = meetingPlan;

    return (
        <div className="glass-card itinerary-card" style={{ overflow: 'hidden', borderLeft: '4px solid var(--wiz-teal)' }}>
            {/* Header */}
            <div style={{
                padding: '14px 20px',
                background: 'linear-gradient(90deg, var(--wiz-teal) 0%, var(--color-primary-dark) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
            }}>
                <div>
                    <span style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: '#fff',
                        letterSpacing: '0.02em'
                    }}>
                        ✈️ Day 0
                    </span>
                    <span style={{
                        marginLeft: 10,
                        fontSize: '0.86rem',
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 600,
                    }}>
                        Travel & Gathering Logistics
                    </span>
                </div>
                <div>
                    <span style={{
                        padding: '3px 12px',
                        background: 'rgba(255,255,255,0.18)',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                    }}>
                        Coordinated Day
                    </span>
                </div>
            </div>

            {/* Narrative Intro */}
            {coordinationNotes && (
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.25rem',
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        margin: 0,
                    }}>
                        "{coordinationNotes}"
                    </p>
                </div>
            )}

            {/* Grid of logistics details */}
            <div style={{ padding: 20 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                    marginBottom: 20
                }}>
                    <div style={{
                        padding: 14,
                        borderRadius: 10,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Gathering Point</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{meetPoint}</div>
                    </div>
                    <div style={{
                        padding: 14,
                        borderRadius: 10,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Arrival Target</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{suggestedArrivalWindow}</div>
                    </div>
                </div>

                {/* Timeline Breakdown list */}
                {travelersWithArrivals.length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 10 }}>
                            Traveler Timelines
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {travelersWithArrivals.map((arrival, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255,255,255,0.01)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'var(--wiz-teal)'
                                        }} />
                                        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {arrival.travelerName}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            padding: '2px 6px',
                                            borderRadius: 5,
                                            background: 'rgba(255,255,255,0.04)',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                            <i className={getTransportModeIcon(arrival.transportMode)} />
                                            {arrival.transportMode}
                                        </span>
                                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--wiz-teal)' }}>
                                            {arrival.estimatedArrival}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
