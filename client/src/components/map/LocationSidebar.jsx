import { getMarkerConfig } from '../../utils/mapUtils';

/**
 * LocationSidebar — Scrollable list of locations currently visible on map
 */
export default function LocationSidebar({ locations, activeLocationId, onLocationClick }) {
    if (!locations || locations.length === 0) return null;

    return (
        <div className="location-sidebar">
            <div className="location-sidebar-header">
                Places to Explore
                <span className="location-sidebar-count">{locations.length}</span>
            </div>
            
            <div className="location-sidebar-list">
                {locations.map((loc) => {
                    const config = getMarkerConfig(loc.type);
                    const isActive = activeLocationId === loc.id;
                    
                    return (
                        <div
                            key={loc.id}
                            className={`location-card ${isActive ? 'active' : ''}`}
                            onClick={() => onLocationClick(loc)}
                        >
                            <div 
                                className="location-card-icon"
                                style={{ 
                                    color: config.color,
                                    borderColor: isActive ? config.color : 'transparent',
                                    background: isActive ? `${config.color}15` : 'var(--bg-glass)'
                                }}
                            >
                                {config.emoji}
                            </div>
                            
                            <div className="location-card-info">
                                <div className="location-card-name" title={loc.name}>
                                    {loc.name}
                                </div>
                                <div className="location-card-meta">
                                    {loc.day > 0 && (
                                        <span className="location-card-day">Day {loc.day}</span>
                                    )}
                                    {loc.timeSlot && loc.timeSlot !== 'All Day' && (
                                        <span className="location-card-time">• {loc.timeSlot}</span>
                                    )}
                                </div>
                                {loc.description && (
                                    <div className="location-card-desc" title={loc.description}>
                                        {loc.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
