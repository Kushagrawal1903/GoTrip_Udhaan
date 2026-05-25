import React from 'react';

// Maps meet point types to Tabler icons
const getMeetPointIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'airport': return 'ti ti-plane-landing';
        case 'station': return 'ti ti-train';
        case 'hotel': return 'ti ti-building-skyscraper';
        default: return 'ti ti-map-pin-filled';
    }
};

const getTransportModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
        case 'flight': return 'ti ti-plane';
        case 'train': return 'ti ti-train';
        case 'bus': return 'ti ti-bus';
        case 'car': return 'ti ti-car';
        default: return 'ti ti-route';
    }
};

export default function MeetingPlanCard({ meetingPlan }) {
    if (!meetingPlan || (!meetingPlan.meetPoint && !meetingPlan.suggestedArrivalWindow)) return null;

    const { suggestedArrivalWindow, meetPoint, meetPointType, coordinationNotes, travelersWithArrivals = [] } = meetingPlan;

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1px solid rgba(13, 148, 136, 0.2)',
            borderRadius: 16,
            padding: '24px 28px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
        }} className="meeting-plan-card">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(13, 148, 136, 0.15)',
                    color: 'var(--wiz-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                }}>
                    <i className="ti ti-users-group" />
                </div>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em'
                    }}>
                        Group Coordination Hub
                    </h3>
                    <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '0.85rem',
                        color: 'var(--wiz-teal)',
                        fontWeight: 600
                    }}>
                        Day 0 arrival and gathering logistics
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16
            }}>
                {/* Arrival Window */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: 16,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10
                }}>
                    <i className="ti ti-clock-filled" style={{ color: 'var(--wiz-teal)', fontSize: '1.2rem', marginTop: 2 }} />
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Arrival Window</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                            {suggestedArrivalWindow}
                        </div>
                    </div>
                </div>

                {/* Gathering Spot */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: 16,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10
                }}>
                    <i className={getMeetPointIcon(meetPointType)} style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginTop: 2 }} />
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Meetup Point</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                            {meetPoint}
                        </div>
                    </div>
                </div>
            </div>

            {/* Coordination Notes */}
            {coordinationNotes && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed var(--border-color)',
                    padding: 16,
                    borderRadius: 12,
                    fontSize: '0.86rem',
                    lineHeight: '1.5',
                    color: 'var(--text-secondary)'
                }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                        💡 Coordination Strategy:
                    </strong>
                    {coordinationNotes}
                </div>
            )}

            {/* Individual Arrivals */}
            {travelersWithArrivals.length > 0 && (
                <div>
                    <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                    }}>
                        Timeline Breakdown
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}>
                        {travelersWithArrivals.map((arrival, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 10
                                }}
                            >
                                <span style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}>
                                    <i className="ti ti-circle-filled" style={{ color: 'var(--wiz-teal)', fontSize: '0.45rem' }} />
                                    {arrival.travelerName}
                                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {/* Mode badge */}
                                    <span style={{
                                        fontSize: '0.72rem',
                                        padding: '3px 8px',
                                        borderRadius: 6,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        <i className={getTransportModeIcon(arrival.transportMode)} />
                                        {arrival.transportMode}
                                    </span>

                                    {/* Arrival time */}
                                    <span style={{
                                        fontSize: '0.84rem',
                                        fontWeight: 700,
                                        color: 'var(--wiz-teal)'
                                    }}>
                                        {arrival.estimatedArrival}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
