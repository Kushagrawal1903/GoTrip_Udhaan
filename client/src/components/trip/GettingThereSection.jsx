import React, { useState, useEffect } from 'react';
import OptimizeForDropdown from './OptimizeForDropdown';

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
        case 'flight': return '#0284c7'; // Sky Blue
        case 'train': return '#10b981'; // Emerald
        case 'bus': return '#f59e0b'; // Amber
        case 'car': return '#8b5cf6'; // Purple
        default: return '#64748b'; // Slate
    }
};

// Maps meet point types to Tabler icons
const getMeetPointIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'airport': return 'ti ti-plane-landing';
        case 'station': return 'ti ti-train';
        case 'hotel': return 'ti ti-building-skyscraper';
        default: return 'ti ti-map-pin';
    }
};

// Deterministic pastel color for avatars based on index
const getAvatarColor = (index) => {
    const hue = (index * 137.5) % 360;
    return `hsl(${hue}, 70%, 88%)`;
};

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Parses a time string (e.g. "2:40 PM", "11:30 AM") into minutes from midnight for sorting
const parseTime = (timeStr) => {
    if (!timeStr) return 9999; // put empty/unparsable times at the end
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 9999;
    let [_, hours, minutes, ampm] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

export default function GettingThereSection({
    trip,
    loading,
    error,
    optimizeTravel
}) {
    const [activeTab, setActiveTab] = useState('group'); // 'group' or 'travelers'
    const [selectedTravelerId, setSelectedTravelerId] = useState('');
    const [selectedModeIndex, setSelectedModeIndex] = useState(0);

    if (!trip || !trip.hasOrigins) return null;

    const recommendations = Array.isArray(trip.travelRecommendations) ? trip.travelRecommendations : [];
    const meetingPlan = trip.meetingPlan;
    const optimizeFor = trip.travelOptimizeFor || 'balanced';

    // Auto-select traveler on mount/change
    useEffect(() => {
        if (recommendations.length > 0 && !selectedTravelerId) {
            setSelectedTravelerId(recommendations[0].travelerId);
        }
    }, [recommendations, selectedTravelerId]);

    // Reset mode index when traveler changes
    useEffect(() => {
        setSelectedModeIndex(0);
    }, [selectedTravelerId]);

    const activeTraveler = recommendations.find(r => r.travelerId === selectedTravelerId) || recommendations[0];

    // Timeline sorting
    const travelersWithArrivals = meetingPlan?.travelersWithArrivals || [];
    const sortedArrivals = [...travelersWithArrivals].sort((a, b) => parseTime(a.estimatedArrival) - parseTime(b.estimatedArrival));

    return (
        <section style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            marginBottom: 32,
            padding: '20px 0',
            borderBottom: '1px solid var(--border-color)'
        }} className="getting-there-section">
            
            {/* Control Center Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                paddingBottom: 4
            }}>
                <div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <i className="ti ti-route-2" style={{ color: 'var(--wiz-teal)', fontSize: '1.6rem' }} />
                        Smart Logistics Hub
                    </h2>
                    <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)'
                    }}>
                        Unified group arrivals timeline and optimized individual itineraries.
                    </p>
                </div>

                {/* Optimization dropdown */}
                {recommendations.length > 0 && (
                    <OptimizeForDropdown
                        value={optimizeFor}
                        onChange={optimizeTravel}
                        loading={loading}
                    />
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: '1.1rem' }} />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading Skeleton */}
            {loading && recommendations.length === 0 ? (
                <div style={{
                    height: 350,
                    borderRadius: 16,
                    background: 'linear-gradient(90deg, var(--bg-glass) 25%, var(--border-color) 50%, var(--bg-glass) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite linear'
                }} />
            ) : (
                <div className="glass-card" style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    background: 'var(--bg-glass)'
                }}>
                    
                    {/* Navigation Tabs (Segmented Control) */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(0, 0, 0, 0.08)',
                        padding: 6,
                        borderBottom: '1px solid var(--border-color)',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 8
                    }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                onClick={() => setActiveTab('group')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: activeTab === 'group' ? 'var(--bg-card)' : 'transparent',
                                    color: activeTab === 'group' ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: activeTab === 'group' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="ti ti-users-group" />
                                Group Plan & Timeline
                            </button>
                            <button
                                onClick={() => setActiveTab('travelers')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: activeTab === 'travelers' ? 'var(--bg-card)' : 'transparent',
                                    color: activeTab === 'travelers' ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: activeTab === 'travelers' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="ti ti-plane" />
                                Individual Routes
                            </button>
                        </div>
                        {loading && (
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--wiz-teal)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                paddingRight: 10,
                                fontWeight: 600
                            }}>
                                <i className="ti ti-rotate" style={{ animation: 'spin 1.5s infinite linear' }} />
                                Optimizing...
                            </span>
                        )}
                    </div>

                    {/* Tab 1: Group Plan & Timeline */}
                    {activeTab === 'group' && meetingPlan && (
                        <div style={{
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20
                        }}>
                            
                            {/* Summary Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 16
                            }}>
                                {/* Meetup Point */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid var(--border-color)',
                                    padding: 16,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 12
                                }}>
                                    <div style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 10,
                                        background: 'rgba(13, 148, 136, 0.12)',
                                        color: 'var(--wiz-teal)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        flexShrink: 0
                                    }}>
                                        <i className={getMeetPointIcon(meetingPlan.meetPointType)} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Meetup Location</div>
                                        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                                            {meetingPlan.meetPoint}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrival Window */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid var(--border-color)',
                                    padding: 16,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 12
                                }}>
                                    <div style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 10,
                                        background: 'rgba(99, 102, 241, 0.12)',
                                        color: 'rgba(99, 102, 241, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        flexShrink: 0
                                    }}>
                                        <i className="ti ti-clock" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Target Arrival Window</div>
                                        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                                            {meetingPlan.suggestedArrivalWindow}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Strategy Block */}
                            {meetingPlan.coordinationNotes && (
                                <div style={{
                                    background: 'rgba(13, 148, 136, 0.03)',
                                    borderLeft: '4px solid var(--wiz-teal)',
                                    padding: '16px 20px',
                                    borderRadius: '0 12px 12px 0',
                                    fontSize: '0.86rem',
                                    lineHeight: '1.55',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                                        💡 Group Coordination Advice:
                                    </strong>
                                    {meetingPlan.coordinationNotes}
                                </div>
                            )}

                            {/* Chronological Arrival Timeline */}
                            {sortedArrivals.length > 0 && (
                                <div>
                                    <h4 style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '0.9rem',
                                        fontWeight: 800,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                    }}>
                                        Arrival Timeline & Order
                                    </h4>

                                    <div style={{
                                        position: 'relative',
                                        paddingLeft: 20,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 16
                                    }}>
                                        {/* Timeline line */}
                                        <div style={{
                                            position: 'absolute',
                                            left: 7,
                                            top: 8,
                                            bottom: 8,
                                            width: 2,
                                            background: 'linear-gradient(to bottom, var(--wiz-teal), var(--color-primary-dark))',
                                            opacity: 0.3
                                        }} />

                                        {sortedArrivals.map((arrival, idx) => {
                                            const color = getModeColor(arrival.transportMode);
                                            const icon = getModeIcon(arrival.transportMode);
                                            return (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    position: 'relative',
                                                    flexWrap: 'wrap',
                                                    gap: 12
                                                }}>
                                                    {/* Dot */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: -19,
                                                        top: 8,
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        background: 'var(--bg-card)',
                                                        border: `3px solid var(--wiz-teal)`,
                                                        boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.15)',
                                                        zIndex: 2
                                                    }} />

                                                    {/* Traveler Info */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            background: getAvatarColor(idx),
                                                            color: '#334155',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.74rem',
                                                            fontWeight: 700
                                                        }}>
                                                            {getInitials(arrival.travelerName)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                                {arrival.travelerName}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.72rem',
                                                                color: 'var(--text-muted)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                marginTop: 2
                                                            }}>
                                                                <i className={icon} style={{ color }} />
                                                                <span>via {arrival.transportMode}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Arrival Time Badge */}
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: 8,
                                                        background: 'rgba(13, 148, 136, 0.08)',
                                                        color: 'var(--wiz-teal)',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        border: '1px solid rgba(13, 148, 136, 0.15)'
                                                    }}>
                                                        🕒 Arrives ~ {arrival.estimatedArrival}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Tab 2: Individual Routes */}
                    {activeTab === 'travelers' && recommendations.length > 0 && activeTraveler && (
                        <div style={{ display: 'flex' }} className="individual-routes-container">
                            
                            {/* Left Navigation: Travelers list */}
                            <div style={{
                                width: 220,
                                borderRight: '1px solid var(--border-color)',
                                background: 'rgba(0, 0, 0, 0.03)',
                                padding: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                flexShrink: 0
                            }} className="travelers-sidebar">
                                <div style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    paddingLeft: 6,
                                    marginBottom: 4,
                                    letterSpacing: '0.04em'
                                }}>
                                    Select Traveler
                                </div>
                                {recommendations.map((rec, idx) => {
                                    const isSelected = rec.travelerId === selectedTravelerId;
                                    return (
                                        <button
                                            key={rec.travelerId}
                                            onClick={() => setSelectedTravelerId(rec.travelerId)}
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: 8,
                                                border: 'none',
                                                background: isSelected ? 'var(--bg-card)' : 'transparent',
                                                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                textAlign: 'left',
                                                fontSize: '0.82rem',
                                                fontWeight: isSelected ? 700 : 500,
                                                transition: 'all 0.2s',
                                                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                                            }}
                                            onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                            onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <div style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '50%',
                                                background: getAvatarColor(idx),
                                                color: '#334155',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.68rem',
                                                fontWeight: 700
                                            }}>
                                                {getInitials(rec.travelerName)}
                                            </div>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {rec.travelerName}
                                            </div>
                                            {rec.recommendedOption && (
                                                <i className={getModeIcon(rec.recommendedOption)} style={{ fontSize: '0.78rem', opacity: 0.6 }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Panel: Detailed route options */}
                            <div style={{
                                flex: 1,
                                padding: 24,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20
                            }} className="travelers-content-panel">
                                
                                {/* Info Row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--border-color)',
                                    paddingBottom: 12,
                                    flexWrap: 'wrap',
                                    gap: 12
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            Route for {activeTraveler.travelerName}
                                        </h3>
                                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                            Departing from: <strong style={{ color: 'var(--text-primary)' }}>{activeTraveler.origin}</strong> → Destination: <strong style={{ color: 'var(--text-primary)' }}>{activeTraveler.destination}</strong>
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        color: '#10b981',
                                        border: '1px solid rgba(16, 185, 129, 0.15)',
                                        fontWeight: 700
                                    }}>
                                        👍 Recommended Mode: {activeTraveler.recommendedOption?.toUpperCase()}
                                    </span>
                                </div>

                                {/* Mode Comparison Tabs */}
                                <div style={{
                                    display: 'flex',
                                    gap: 8,
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none'
                                }} className="mode-tabs">
                                    {activeTraveler.options.map((option, idx) => {
                                        const isSelected = selectedModeIndex === idx;
                                        const isBest = option.mode === activeTraveler.recommendedOption;
                                        const color = getModeColor(option.mode);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedModeIndex(idx)}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: 10,
                                                    background: isSelected ? 'var(--bg-card)' : 'rgba(255,255,255,0.01)',
                                                    border: `1.5px solid ${isSelected ? 'var(--wiz-teal)' : 'var(--border-color)'}`,
                                                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <i className={getModeIcon(option.mode)} style={{ color: isSelected ? 'var(--wiz-teal)' : color, fontSize: '0.9rem' }} />
                                                {option.label || option.mode.toUpperCase()}
                                                {isBest && (
                                                    <span style={{
                                                        fontSize: '0.62rem',
                                                        padding: '1px 5px',
                                                        borderRadius: 4,
                                                        background: '#10b981',
                                                        color: '#fff',
                                                        fontWeight: 700
                                                    }}>
                                                        BEST
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Selected Mode Details */}
                                {activeTraveler.options[selectedModeIndex] && (
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.01)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 12,
                                        padding: 20,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 16
                                    }}>
                                        
                                        {/* Cost and Duration Panel */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                            gap: 16,
                                            borderBottom: '1px solid var(--border-color)',
                                            paddingBottom: 16
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Estimated Cost</div>
                                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <i className="ti ti-currency-rupee" style={{ color: 'var(--wiz-teal)' }} />
                                                    {activeTraveler.options[selectedModeIndex].estimatedCost}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Travel Duration</div>
                                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <i className="ti ti-hourglass-high" style={{ color: '#0284c7' }} />
                                                    {activeTraveler.options[selectedModeIndex].estimatedDuration}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Option Details */}
                                        <div style={{ fontSize: '0.86rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>✨ Recommended Route Strategy:</strong>
                                            {activeTraveler.options[selectedModeIndex].details}
                                        </div>

                                        {/* Booking Hint */}
                                        {activeTraveler.options[selectedModeIndex].bookingHint && (
                                            <div style={{
                                                fontSize: '0.78rem',
                                                color: 'var(--text-secondary)',
                                                background: 'rgba(13, 148, 136, 0.03)',
                                                padding: '10px 14px',
                                                borderRadius: 8,
                                                borderLeft: '3px solid var(--wiz-teal)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <i className="ti ti-info-circle-filled" style={{ color: 'var(--wiz-teal)', fontSize: '1rem', flexShrink: 0 }} />
                                                <span>{activeTraveler.options[selectedModeIndex].bookingHint}</span>
                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {/* Disclaimer Footer */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '14px 20px',
                        background: 'rgba(0,0,0,0.06)',
                        borderTop: '1px solid var(--border-color)',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.45'
                    }}>
                        <i className="ti ti-info-square-rounded" style={{ color: 'var(--wiz-teal)', fontSize: '0.95rem', marginTop: 2, flexShrink: 0 }} />
                        <span>
                            <strong>Disclaimer:</strong> Travel routes, estimated durations, and costs are AI-generated based on typical seasonal averages. Please verify schedules and book tickets directly through official operators.
                        </span>
                    </div>

                </div>
            )}

            {/* Mobile / Responsive CSS */}
            <style>{`
                @media (max-width: 680px) {
                    .individual-routes-container {
                        flex-direction: column !important;
                    }
                    .travelers-sidebar {
                        width: 100% !important;
                        border-right: none !important;
                        border-bottom: 1px solid var(--border-color) !important;
                        flex-direction: row !important;
                        overflow-x: auto !important;
                        padding: 10px 16px !important;
                        scrollbar-width: none !important;
                    }
                    .travelers-sidebar::-webkit-scrollbar {
                        display: none;
                    }
                    .travelers-sidebar > div {
                        display: none !important; /* Hide select traveler label on mobile */
                    }
                    .travelers-sidebar button {
                        padding: 6px 12px !important;
                        white-space: nowrap !important;
                    }
                    .travelers-content-panel {
                        padding: 16px !important;
                    }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </section>
    );
}
