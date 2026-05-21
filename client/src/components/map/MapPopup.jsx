import { Popup } from 'react-leaflet';
import { getMarkerConfig } from '../../utils/mapUtils';

/**
 * MapPopup — Premium popup card shown when a marker is clicked.
 * Displays place name, type badge, day/time, description, cost, and Google Maps link.
 */
export default function MapPopup({ location }) {
    const config = getMarkerConfig(location.type);

    // Build Google Maps link
    const googleMapsUrl = location.mapsLink
        || `https://www.google.com/maps/search/${encodeURIComponent(location.name)}`;

    return (
        <Popup className="map-popup-card" closeButton={true} maxWidth={280} minWidth={220}>
            <div className="map-popup-inner">
                {/* Type badge */}
                <span
                    className="map-popup-type"
                    style={{
                        background: `${config.color}14`,
                        color: config.color,
                        border: `1px solid ${config.color}30`,
                    }}
                >
                    {config.emoji} {config.label}
                </span>

                {/* Name */}
                <h4 className="map-popup-name">{location.name}</h4>

                {/* Day + time */}
                <p className="map-popup-day">
                    {location.day > 0 ? `Day ${location.day}` : 'Entire Trip'}
                    {location.timeSlot && location.timeSlot !== 'All Day'
                        ? ` · ${location.timeSlot}`
                        : ''}
                </p>

                {/* Description */}
                {location.description && (
                    <p className="map-popup-desc">{location.description}</p>
                )}

                {/* Cost */}
                {location.estimatedCost && (
                    <span className="map-popup-cost">{location.estimatedCost}</span>
                )}

                {/* Rating for hotels */}
                {location.rating && (
                    <span className="map-popup-cost" style={{ marginLeft: 6 }}>
                        ⭐ {location.rating}
                    </span>
                )}

                {/* Google Maps button */}
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-popup-gmaps"
                    style={{ marginTop: 8 }}
                >
                    Open in Google Maps →
                </a>
            </div>
        </Popup>
    );
}
