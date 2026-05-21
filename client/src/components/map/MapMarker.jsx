import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { getMarkerConfig } from '../../utils/mapUtils';
import MapPopup from './MapPopup';

/**
 * MapMarker — Custom premium marker with emoji icon, color-coded border, and day badge.
 * Uses Leaflet DivIcon for fully custom HTML markers (no default ugly blue pins).
 */
export default function MapMarker({ location, isActive, onClick }) {
    const config = getMarkerConfig(location.type);

    const icon = useMemo(() => {
        const dayBadge = location.day > 0
            ? `<span class="map-marker-day-badge">${location.day}</span>`
            : '';

        return L.divIcon({
            className: '', // Remove default leaflet-div-icon styles
            html: `
                <div class="map-marker-custom ${isActive ? 'active' : ''}" 
                     style="color: ${config.color}; border-color: ${config.color};"
                     title="${location.name}">
                    ${config.emoji}
                    ${dayBadge}
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -22],
        });
    }, [location.type, location.day, location.name, isActive, config.color, config.emoji]);

    return (
        <Marker
            position={[location.lat, location.lng]}
            icon={icon}
            eventHandlers={{
                click: () => onClick && onClick(location),
            }}
            zIndexOffset={isActive ? 1000 : location.type === 'hotel' ? 500 : 0}
        >
            <MapPopup location={location} />
        </Marker>
    );
}
