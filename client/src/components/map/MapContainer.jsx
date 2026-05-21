import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { useTheme } from '../../context/ThemeContext';
import MapMarker from './MapMarker';
import RouteLayer from './RouteLayer';
import { getOptimalZoom } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

/**
 * Controller to handle programmatic map changes (fitting bounds, zooming to active marker)
 */
function MapController({ locations, activeLocationId, center, destination, isFullscreen }) {
    const map = useMap();
    const initialFitDone = useRef(false);

    useEffect(() => {
        if (!locations || locations.length === 0) return;

        // If there's an active location, fly to it
        if (activeLocationId) {
            const activeLoc = locations.find(l => l.id === activeLocationId);
            if (activeLoc) {
                map.flyTo([activeLoc.lat, activeLoc.lng], 16, { duration: 0.8 });
                return;
            }
        }

        // Only do initial bounds fitting once, unless the locations array completely changes
        if (!initialFitDone.current && locations && locations.length > 0) {
            const points = locations.map(l => [l.lat, l.lng]);
            if (points.length >= 2) {
                map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
            } else if (points.length === 1) {
                map.setView(points[0], 14);
            }
            initialFitDone.current = true;
        } else if (!initialFitDone.current && center) {
            // Optional: fallback to center but don't mark as permanently done 
            // until we get actual locations
            map.setView([center.lat, center.lng], 12);
        }
    }, [locations, activeLocationId, center, map]);

    // Invalidate size on mount and on fullscreen toggle to fix Leaflet rendering issues
    useEffect(() => {
        const timeout = setTimeout(() => {
            map.invalidateSize();
            
            // Re-center map if fullscreen toggled to ensure pins stay in view
            if (locations && locations.length > 0) {
                const points = locations.map(l => [l.lat, l.lng]);
                if (points.length >= 2) {
                    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
                } else if (points.length === 1) {
                    map.setView(points[0], 14);
                }
            }
        }, 150); // slight delay to allow CSS transition to finish
        return () => clearTimeout(timeout);
    }, [map, isFullscreen, locations]);

    return null;
}

/**
 * MapContainer — Main wrapper for react-leaflet components.
 * Handles tile layer (light/dark) and rendering markers/routes.
 */
export default function MapContainer({ 
    locations, 
    center, 
    destination,
    dayFilter,
    activeLocationId,
    onLocationClick,
    onPopupClose,
    isFullscreen
}) {
    const { isDark } = useTheme();

    // Default center if nothing is provided
    const defaultCenter = center || { lat: 20, lng: 77 };
    const initialZoom = locations.length > 0 ? getOptimalZoom(locations) : 12;

    // Tile URLs
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    return (
        <div className="map-container-wrapper">
            <LeafletMapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={initialZoom}
                scrollWheelZoom={true}
                zoomControl={true}
                attributionControl={true}
            >
                <TileLayer
                    url={isDark ? darkTiles : lightTiles}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    maxZoom={19}
                />

                <MapController 
                    locations={locations}
                    activeLocationId={activeLocationId}
                    center={center}
                    destination={destination}
                    isFullscreen={isFullscreen}
                />

                <RouteLayer 
                    locations={locations} 
                    dayFilter={dayFilter} 
                    optimize={false} // Can enable TSP optimization here if needed
                />

                {locations.map(loc => (
                    <MapMarker
                        key={loc.id}
                        location={loc}
                        isActive={activeLocationId === loc.id}
                        onClick={onLocationClick}
                    />
                ))}

            </LeafletMapContainer>
        </div>
    );
}
