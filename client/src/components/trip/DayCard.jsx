/**
 * DayCard — Timeline-style day card with clickable activity places
 * Supports inline edit mode: Edit button in header, blue banner, and slot inputs
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

export default function DayCard({
    day,
    dayIndex,
    destination,
    canEdit,
    isEditing,
    editValues,
    isSaving,
    saveError,
    onStartEdit,
    onDiscard,
    onSaveEdit,
    onEditChange,
}) {
    const isEditingThisDay = isEditing;

    return (
        <div className="glass-card itinerary-card" style={{ overflow: 'hidden' }}>
            {/* Day Header */}
            <div style={{
                padding: '12px 20px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    {/* Edit Day button — always visible for owner, hidden when editing this day */}
                    {canEdit && !isEditingThisDay && (
                        <button
                            onClick={() => onStartEdit(dayIndex)}
                            className="edit-day-btn"
                            aria-label={`Edit day ${dayIndex + 1}`}
                        >
                            ✏️ Edit day
                        </button>
                    )}
                </div>
            </div>

            {/* ─── DAY NARRATIVE INTRO ─────────────────────────────── */}
            {day.narrative && !isEditingThisDay && (
                <div style={{
                    padding: '16px 20px 8px',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.05rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        margin: 0,
                    }}>
                        {day.narrative}
                    </p>
                </div>
            )}

            {/* ─── EDIT MODE BANNER ─────────────────────────────── */}
            {isEditingThisDay && (
                <div className="edit-banner">
                    <span className="edit-banner-label">
                        ✏️ Editing Day {dayIndex + 1}
                    </span>
                    <div className="edit-banner-actions">
                        <button
                            onClick={onDiscard}
                            disabled={isSaving}
                            className="btn-discard"
                        >
                            Discard
                        </button>
                        <button
                            onClick={onSaveEdit}
                            disabled={isSaving}
                            className="btn-save-all"
                        >
                            {isSaving && (
                                <span className="save-spinner" />
                            )}
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </div>
            )}

            {/* ─── SAVE ERROR ────────────────────────────────────── */}
            {isEditingThisDay && saveError && (
                <div className="edit-error">{saveError}</div>
            )}

            {/* ─── EDIT MODE: SLOT INPUTS ─────────────────────────  */}
            {isEditingThisDay && editValues && (
                <div style={{ padding: '16px 20px' }}>
                    {['morning', 'afternoon', 'evening', 'night'].map((slot) => {
                        // Only show slots that exist in the day's activities
                        const hasSlot = (day.activities || []).some(
                            (a) => (a.time || '').toLowerCase() === slot
                        );
                        if (!hasSlot || !editValues[slot]) return null;

                        const dotColor = TIME_COLORS[slot] || '#0d9488';

                        return (
                            <div key={slot} className="slot-edit-row">
                                <div className="slot-time-label" style={{ color: dotColor }}>
                                    <div style={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: dotColor, flexShrink: 0,
                                    }} />
                                    {slot}
                                </div>
                                <div className="slot-inputs">
                                    <input
                                        type="text"
                                        value={editValues[slot]?.title || ''}
                                        onChange={(e) => onEditChange(slot, 'title', e.target.value)}
                                        placeholder="Place or activity name"
                                        maxLength={100}
                                        className="input-field slot-title-input"
                                        aria-label={`${slot} activity name`}
                                        disabled={isSaving}
                                    />
                                    <input
                                        type="text"
                                        value={editValues[slot]?.description || ''}
                                        onChange={(e) => onEditChange(slot, 'description', e.target.value)}
                                        placeholder="Describe the activity"
                                        maxLength={400}
                                        className="input-field slot-desc-input"
                                        aria-label={`${slot} activity description`}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── VIEW MODE: ACTIVITIES TIMELINE ─────────────────  */}
            {!isEditingThisDay && (
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
                                            title="Opens in Google Maps"
                                            className="map-pill-btn"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                marginTop: 8,
                                                padding: '5px 12px',
                                                borderRadius: 20,
                                                background: 'rgba(99, 102, 241, 0.06)',
                                                border: '1.5px solid rgba(99, 102, 241, 0.15)',
                                                color: 'var(--color-primary)',
                                                fontSize: '0.76rem',
                                                fontWeight: 700,
                                                textDecoration: 'none',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                            onMouseDown={(e) => {
                                                e.currentTarget.style.transform = 'scale(0.97)';
                                            }}
                                            onMouseUp={(e) => {
                                                e.currentTarget.style.transform = 'scale(1) translateY(-1px)';
                                            }}
                                        >
                                            <i className="ti ti-map-pin" style={{ color: 'var(--wiz-teal)' }} />
                                            <span>{act.placeName || 'View on Maps'}</span>
                                            <i className="ti ti-external-link" style={{ fontSize: '0.7rem', opacity: 0.8 }} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Meals */}
            {day.meals && (
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-glass)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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
