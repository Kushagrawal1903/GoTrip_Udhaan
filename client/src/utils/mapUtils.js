/**
 * Map Utilities — Haversine distance, insight calculations, route optimization
 * Pure functions, no side effects.
 */

/**
 * Calculate Haversine distance between two lat/lng points.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Estimate walking time in minutes for a given distance in km.
 * Assumes average walking speed of 5 km/h.
 * @param {number} distanceKm
 * @returns {number} Minutes
 */
export function estimateWalkingMinutes(distanceKm) {
    return Math.round((distanceKm / 5) * 60);
}

/**
 * Get the center point of a set of coordinates.
 * @param {Array<{lat: number, lng: number}>} points
 * @returns {{lat: number, lng: number}}
 */
export function getCenterPoint(points) {
    if (!points || points.length === 0) return { lat: 0, lng: 0 };
    if (points.length === 1) return { lat: points[0].lat, lng: points[0].lng };

    const sum = points.reduce(
        (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
        { lat: 0, lng: 0 }
    );
    return {
        lat: sum.lat / points.length,
        lng: sum.lng / points.length,
    };
}

/**
 * Get appropriate zoom level based on the spread of locations.
 * @param {Array<{lat: number, lng: number}>} points
 * @returns {number} Leaflet zoom level
 */
export function getOptimalZoom(points) {
    if (!points || points.length <= 1) return 14;

    let maxDist = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const d = haversineDistance(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
            if (d > maxDist) maxDist = d;
        }
    }

    // Map max distance to zoom level
    if (maxDist < 0.5) return 16;
    if (maxDist < 1) return 15;
    if (maxDist < 2) return 14;
    if (maxDist < 5) return 13;
    if (maxDist < 10) return 12;
    if (maxDist < 25) return 11;
    if (maxDist < 50) return 10;
    if (maxDist < 100) return 9;
    return 8;
}

/**
 * Calculate smart geographic insights from location data.
 * Returns an array of insight strings based on actual distance calculations.
 * @param {Array} locations - Normalized map locations
 * @param {number} totalDays - Total trip duration
 * @returns {Array<{text: string, icon: string, type: string}>}
 */
export function calculateInsights(locations, totalDays) {
    if (!locations || locations.length < 2) return [];

    const insights = [];
    const hotels = locations.filter(l => l.type === 'hotel');
    const attractions = locations.filter(l => l.type === 'attraction');
    const restaurants = locations.filter(l => l.type === 'restaurant');

    // ── Hotel centrality insight ──────────────────────────────
    if (hotels.length > 0 && attractions.length > 0) {
        const hotel = hotels[0];
        const attractionDistances = attractions.map(a =>
            haversineDistance(hotel.lat, hotel.lng, a.lat, a.lng)
        );
        const avgDistance = attractionDistances.reduce((s, d) => s + d, 0) / attractionDistances.length;
        const walkMins = estimateWalkingMinutes(avgDistance);

        if (avgDistance < 2) {
            insights.push({
                text: `Your hotel is centrally located — most attractions are within ${walkMins} min walking distance.`,
                icon: '🏨',
                type: 'positive',
            });
        } else if (avgDistance < 5) {
            insights.push({
                text: `Attractions average ${avgDistance.toFixed(1)} km from your hotel — short rides away.`,
                icon: '🏨',
                type: 'neutral',
            });
        } else {
            insights.push({
                text: `Attractions are spread ${avgDistance.toFixed(1)} km on average from your hotel — plan transport ahead.`,
                icon: '🚗',
                type: 'info',
            });
        }
    }

    // ── Day-by-day movement analysis ──────────────────────────
    const dayMovements = {};
    for (let day = 1; day <= totalDays; day++) {
        const dayLocs = locations.filter(l => l.day === day).sort((a, b) => a.order - b.order);
        if (dayLocs.length < 2) continue;

        let totalDayDistance = 0;
        for (let i = 0; i < dayLocs.length - 1; i++) {
            totalDayDistance += haversineDistance(
                dayLocs[i].lat, dayLocs[i].lng,
                dayLocs[i + 1].lat, dayLocs[i + 1].lng
            );
        }
        dayMovements[day] = totalDayDistance;
    }

    const dayEntries = Object.entries(dayMovements);
    if (dayEntries.length > 1) {
        const avgMovement = dayEntries.reduce((s, [, d]) => s + d, 0) / dayEntries.length;
        const busiestDay = dayEntries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
        const lightestDay = dayEntries.reduce((min, curr) => curr[1] < min[1] ? curr : min);

        if (busiestDay[1] > avgMovement * 1.3) {
            insights.push({
                text: `Day ${busiestDay[0]} involves the most movement (${busiestDay[1].toFixed(1)} km) — pace yourself.`,
                icon: '🚶',
                type: 'info',
            });
        }

        if (lightestDay[1] < avgMovement * 0.7 && estimateWalkingMinutes(lightestDay[1]) < 40) {
            insights.push({
                text: `Day ${lightestDay[0]} is very walkable — everything is within ${estimateWalkingMinutes(lightestDay[1])} min walk.`,
                icon: '👟',
                type: 'positive',
            });
        }
    }

    // ── Attraction clustering ─────────────────────────────────
    if (attractions.length >= 3) {
        let closeCount = 0;
        let totalPairs = 0;
        for (let i = 0; i < attractions.length; i++) {
            for (let j = i + 1; j < attractions.length; j++) {
                totalPairs++;
                const d = haversineDistance(
                    attractions[i].lat, attractions[i].lng,
                    attractions[j].lat, attractions[j].lng
                );
                if (d < 2) closeCount++;
            }
        }
        const clusterRatio = closeCount / totalPairs;
        if (clusterRatio > 0.5) {
            insights.push({
                text: 'Activities are clustered efficiently — less travel time between stops.',
                icon: '✨',
                type: 'positive',
            });
        } else if (clusterRatio < 0.2) {
            insights.push({
                text: 'Attractions are spread across the city — factor in travel time between them.',
                icon: '📍',
                type: 'info',
            });
        }
    }

    // ── Restaurant proximity insight ─────────────────────────
    if (restaurants.length > 0 && attractions.length > 0) {
        const nearbyFoodCount = restaurants.filter(r =>
            attractions.some(a => haversineDistance(r.lat, r.lng, a.lat, a.lng) < 1)
        ).length;

        if (nearbyFoodCount >= Math.ceil(restaurants.length * 0.6)) {
            insights.push({
                text: 'Great news — most food spots are near your activity areas.',
                icon: '🍽️',
                type: 'positive',
            });
        }
    }

    // ── Total trip coverage ──────────────────────────────────
    if (locations.length >= 4) {
        const allPoints = locations.map(l => ({ lat: l.lat, lng: l.lng }));
        let maxSpread = 0;
        for (let i = 0; i < allPoints.length; i++) {
            for (let j = i + 1; j < allPoints.length; j++) {
                const d = haversineDistance(allPoints[i].lat, allPoints[i].lng, allPoints[j].lat, allPoints[j].lng);
                if (d > maxSpread) maxSpread = d;
            }
        }

        if (maxSpread < 5) {
            insights.push({
                text: `Your entire trip fits within a ${maxSpread.toFixed(1)} km radius — compact and convenient.`,
                icon: '🗺️',
                type: 'positive',
            });
        } else if (maxSpread > 30) {
            insights.push({
                text: `Trip spans ${maxSpread.toFixed(0)} km — consider the distance when planning daily activities.`,
                icon: '🗺️',
                type: 'info',
            });
        }
    }

    return insights.slice(0, 4); // Max 4 insights to keep it clean
}

/**
 * Generate route points for a specific day, ordered by activity sequence.
 * @param {Array} locations - All locations
 * @param {number} day - Day number (1-indexed), 0 for all days
 * @returns {Array<[number, number]>} Array of [lat, lng] for polyline
 */
export function getDayRoute(locations, day) {
    let dayLocs;
    if (day === 0) {
        // All days: sort by day then order
        dayLocs = [...locations].sort((a, b) => a.day - b.day || a.order - b.order);
    } else {
        dayLocs = locations
            .filter(l => l.day === day)
            .sort((a, b) => a.order - b.order);
    }

    // Add hotel as start point if available
    const hotels = locations.filter(l => l.type === 'hotel');
    if (hotels.length > 0 && day > 0) {
        const hotel = hotels[0];
        // Prepend hotel if not already first
        if (dayLocs.length > 0 && dayLocs[0].type !== 'hotel') {
            dayLocs.unshift(hotel);
        }
    }

    return dayLocs.map(l => [l.lat, l.lng]);
}

/**
 * Nearest-neighbor TSP approximation for route optimization.
 * @param {Array} locations - Locations to optimize (single day)
 * @returns {Array} Reordered locations
 */
export function optimizeRoute(locations) {
    if (locations.length <= 2) return locations;

    const unvisited = [...locations];
    const route = [unvisited.shift()]; // Start from first location

    while (unvisited.length > 0) {
        const current = route[route.length - 1];
        let nearestIdx = 0;
        let nearestDist = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const d = haversineDistance(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
            if (d < nearestDist) {
                nearestDist = d;
                nearestIdx = i;
            }
        }

        route.push(unvisited.splice(nearestIdx, 1)[0]);
    }

    return route;
}

/**
 * Get the marker configuration for a location type.
 * @param {string} type
 * @returns {{emoji: string, color: string, label: string}}
 */
export function getMarkerConfig(type) {
    const configs = {
        hotel: { emoji: '🏨', color: '#6366f1', label: 'Hotel' },
        attraction: { emoji: '📍', color: '#0d9488', label: 'Attraction' },
        restaurant: { emoji: '🍽️', color: '#d97706', label: 'Restaurant' },
        transport: { emoji: '✈️', color: '#64748b', label: 'Transport' },
        shopping: { emoji: '🛍️', color: '#ec4899', label: 'Shopping' },
    };
    return configs[type] || configs.attraction;
}
