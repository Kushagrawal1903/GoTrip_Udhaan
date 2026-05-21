/**
 * MapFilters — Filter bar for days and categories
 */
export default function MapFilters({
    totalDays,
    dayFilter,
    setDayFilter,
    categoryFilter,
    setCategoryFilter
}) {
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    // Available categories (could be dynamic based on actual data in the future)
    const categories = [
        { id: 'all', label: 'All Places' },
        { id: 'attraction', label: '📍 Attractions' },
        { id: 'food', label: '🍽️ Food' },
        { id: 'stay', label: '🏨 Stays' },
    ];

    return (
        <div className="map-filters">
            {/* Day filters */}
            <button
                className={`map-filter-btn ${dayFilter === 0 ? 'active' : ''}`}
                onClick={() => setDayFilter(0)}
            >
                Entire Trip
            </button>
            {days.map(day => (
                <button
                    key={`day-${day}`}
                    className={`map-filter-btn ${dayFilter === day ? 'active' : ''}`}
                    onClick={() => setDayFilter(day)}
                >
                    Day {day}
                </button>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 4px', alignSelf: 'center' }} />

            {/* Category filters */}
            {categories.map(cat => (
                <button
                    key={`cat-${cat.id}`}
                    className={`map-filter-btn ${categoryFilter === cat.id ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat.id)}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}
