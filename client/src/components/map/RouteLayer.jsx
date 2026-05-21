import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { getDayRoute, optimizeRoute } from '../../utils/mapUtils';

/**
 * RouteLayer — Renders polyline routes between locations for a specific day.
 * Includes optional TSP approximation for route optimization.
 */
export default function RouteLayer({ locations, dayFilter, optimize }) {
    const map = useMap();

    // If dayFilter is 0 (Entire Trip), we don't show the noisy multi-day route by default
    // unless there are very few locations.
    if (dayFilter === 0 && locations.length > 8) return null;

    let routeLocs = [];
    if (dayFilter === 0) {
        // Simple sequential route for all days
        routeLocs = [...locations]
            .filter(l => l.day > 0) // exclude hotel only
            .sort((a, b) => a.day - b.day || a.order - b.order);
    } else {
        // Route for specific day
        routeLocs = locations
            .filter(l => l.day === dayFilter)
            .sort((a, b) => a.order - b.order);
        
        // Prepend hotel if exists
        const hotels = locations.filter(l => l.type === 'hotel');
        if (hotels.length > 0 && routeLocs.length > 0 && routeLocs[0].type !== 'hotel') {
            routeLocs.unshift(hotels[0]);
        }
    }

    if (routeLocs.length < 2) return null;

    // Apply optimization if requested
    if (optimize && dayFilter !== 0) {
        routeLocs = optimizeRoute(routeLocs);
    }

    const routePoints = routeLocs.map(l => [l.lat, l.lng]);

    // Fit map bounds to route if day filter changed
    useEffect(() => {
        if (routePoints.length >= 2) {
            // Add a small delay to let markers render first
            const timeout = setTimeout(() => {
                map.fitBounds(routePoints, { padding: [40, 40], maxZoom: 15 });
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [dayFilter, map]); // Only fit bounds on day filter change, not every location change

    return (
        <Polyline
            positions={routePoints}
            pathOptions={{
                color: 'var(--color-primary)',
                weight: 3,
                opacity: 0.6,
                dashArray: '8, 8',
                lineCap: 'round',
                lineJoin: 'round',
            }}
        />
    );
}
