/**
 * DayCard — Timeline-style day card with clickable activity places
 */

const TIME_COLORS = {
    morning: '#d97706',
    afternoon: '#0d9488',
    evening: '#7c3aed',
    night: '#4f46e5',
};

/**
 * Build a Google Maps search URL from a place name and destination
 */
function buildMapsLink(placeName, destination) {
    if (!placeName) return null;
    const query = destination ? `${placeName} ${destination}` : placeName;
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

export default function DayCard({ day, destination }) {
    return (
        <div className="glass-card itinerary-card" style={{ overflow: 'hidden' }}>
            {/* Day Header */}
            <div style={{
                padding: '12px 20px', // Reduced for mobile
                background: 'var(--color-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
            }}>
                <div>
                    <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#fff',
                    }}>
                        Day {day.day}
                    </span>
                    <span style={{
                        marginLeft: 10,
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 400,
                    }}>
                        {day.title}
                    </span>
                </div>
                {day.estimatedDayCost && (
                    <span style={{
                        padding: '3px 12px',
                        background: 'rgba(255,255,255,0.18)',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                    }}>
                        {day.estimatedDayCost}
                    </span>
                )}
            </div>

            {/* Activities Timeline */}
            <div style={{ padding: '16px 20px' }}>
                {day.activities?.map((act, i) => {
                    const timeKey = (act.time || '').toLowerCase();
                    const dotColor = TIME_COLORS[timeKey] || '#0d9488';
                    const mapsLink = act.mapsLink || (act.placeName ? buildMapsLink(act.placeName, destination) : null);

                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                gap: 14,
                                marginBottom: i < day.activities.length - 1 ? 18 : 0,
                                position: 'relative',
                            }}
                        >
                            {/* Timeline dot + line */}
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 18,
                            }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: dotColor,
                                    flexShrink: 0, marginTop: 5,
                                }} />
                                {i < day.activities.length - 1 && (
                                    <div style={{ width: 1.5, flex: 1, background: 'var(--border-color)', marginTop: 4 }} />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, paddingBottom: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                                    <span style={{
                                        fontSize: '0.78rem', fontWeight: 700,
                                        color: dotColor, textTransform: 'capitalize',
                                    }}>
                                        {act.time}
                                    </span>
                                    {act.estimatedCost && (
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: 'var(--text-muted)',
                                            background: 'var(--bg-glass)',
                                            padding: '2px 8px', borderRadius: 4,
                                            border: '1px solid var(--border-color)',
                                        }}>
                                            {act.estimatedCost}
                                        </span>
                                    )}
                                </div>

                                <p style={{
                                    fontSize: '0.88rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.55,
                                    marginTop: 3,
                                }}>
                                    {act.activity}
                                </p>

                                {/* Clickable place link */}
                                {mapsLink && (
                                    <a
                                        href={mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            marginTop: 6,
                                            padding: '4px 12px',
                                            borderRadius: 6,
                                            background: 'rgba(13, 148, 136, 0.08)',
                                            border: '1px solid rgba(13, 148, 136, 0.15)',
                                            color: 'var(--color-primary)',
                                            fontSize: '0.76rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {act.placeName || 'View on Maps'} →
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Meals */}
            {day.meals && (
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-glass)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // Narrower for mobile
                    gap: 12,
                }}>
                    {Object.entries(day.meals).map(([meal, detail]) => (
                        <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {meal}
                                </span>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                                    {detail}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
