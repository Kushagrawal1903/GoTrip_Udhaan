const axios = require('axios');

/**
 * Geocoding Service — uses Nominatim (OpenStreetMap) for free geocoding.
 * Respects Nominatim's usage policy: max 1 request/second, User-Agent required.
 * 
 * Optimized for speed: single attempt per place with fast fallback to
 * destination center + deterministic offset.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const REQUEST_DELAY_MS = 1050; // Just over 1s to respect rate limits
const REQUEST_TIMEOUT_MS = 4000; // Short timeout — fail fast, use fallback

/**
 * Sleep helper for rate limiting
 * @param {number} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode a single place name to lat/lng using Nominatim.
 * Single attempt, no retries — designed to fail fast.
 * @param {string} placeName - Name of the place
 * @param {string} destination - Broader location context (city/region)
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodePlace(placeName, destination) {
    if (!placeName || typeof placeName !== 'string' || placeName.trim().length === 0) {
        return null;
    }

    // Single query with destination context for best results
    const query = destination
        ? `${placeName.trim()}, ${destination}`
        : placeName.trim();

    try {
        const response = await axios.get(NOMINATIM_BASE, {
            params: {
                q: query,
                format: 'json',
                limit: 1,
                addressdetails: 0,
            },
            headers: {
                'User-Agent': 'GoTripPro/1.0 (travel-planner-app)',
                'Accept-Language': 'en',
            },
            timeout: REQUEST_TIMEOUT_MS,
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);

            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lng };
            }
        }

        // If contextualized query failed, try bare name as fallback
        if (destination) {
            await sleep(REQUEST_DELAY_MS);
            const fallbackRes = await axios.get(NOMINATIM_BASE, {
                params: {
                    q: placeName.trim(),
                    format: 'json',
                    limit: 1,
                    addressdetails: 0,
                },
                headers: {
                    'User-Agent': 'GoTripPro/1.0 (travel-planner-app)',
                    'Accept-Language': 'en',
                },
                timeout: REQUEST_TIMEOUT_MS,
            });

            if (fallbackRes.data && fallbackRes.data.length > 0) {
                const result = fallbackRes.data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                if (!isNaN(lat) && !isNaN(lng)) {
                    return { lat, lng };
                }
            }
        }
    } catch (error) {
        // Fail silently — caller will use fallback coordinates
    }

    return null;
}

/**
 * Batch geocode multiple places with rate limiting.
 * Uses the destination's known coordinates as a fallback center for places
 * that can't be geocoded — applies small deterministic offsets so they don't stack.
 * 
 * Optimized: single geocode attempt per place, immediate fallback on failure.
 * 
 * @param {Array<{name: string, id: string}>} places - Array of places to geocode
 * @param {string} destination - Destination name for context
 * @param {{lat: number, lng: number} | null} destCoords - Known destination coordinates
 * @returns {Promise<Object>} Map of id → {lat, lng}
 */
async function batchGeocode(places, destination, destCoords = null) {
    const results = {};
    const uniquePlaces = [];
    const nameToIds = {};

    // Deduplicate by normalized name to minimize API calls
    for (const place of places) {
        const normalizedName = place.name.trim().toLowerCase();
        if (nameToIds[normalizedName]) {
            nameToIds[normalizedName].push(place.id);
        } else {
            nameToIds[normalizedName] = [place.id];
            uniquePlaces.push({ name: place.name, normalizedName });
        }
    }

    // Filter out generic/vague names that will never geocode
    const genericPatterns = /^(hotel\s+(spa|pool|suite|lounge|lobby|garden|lawns?|terrace|amenities|wellness|restaurant))/i;

    for (let i = 0; i < uniquePlaces.length; i++) {
        const place = uniquePlaces[i];

        // Skip generic place names — they'll always fail and waste time
        const isGeneric = genericPatterns.test(place.name);

        let coords = null;

        if (!isGeneric) {
            // Rate limit: wait between requests
            if (i > 0) {
                await sleep(REQUEST_DELAY_MS);
            }

            // Single fast geocode attempt — no retries
            try {
                const query = `${place.name.trim()}, ${destination}`;
                const response = await axios.get(NOMINATIM_BASE, {
                    params: {
                        q: query,
                        format: 'json',
                        limit: 1,
                        addressdetails: 0,
                    },
                    headers: {
                        'User-Agent': 'GoTripPro/1.0 (travel-planner-app)',
                        'Accept-Language': 'en',
                    },
                    timeout: REQUEST_TIMEOUT_MS,
                });

                if (response.data && response.data.length > 0) {
                    const result = response.data[0];
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coords = { lat, lng };
                    }
                }
            } catch (error) {
                // Fail silently — use fallback below
            }
        }

        // Fallback: use destination center + deterministic offset
        if (!coords && destCoords) {
            const hash = simpleHash(place.normalizedName);
            const latOffset = ((hash % 100) - 50) * 0.001;
            const lngOffset = (((hash >> 8) % 100) - 50) * 0.001;
            coords = {
                lat: destCoords.lat + latOffset,
                lng: destCoords.lng + lngOffset,
            };
        }

        if (coords) {
            // Assign to all IDs that share this name
            for (const id of nameToIds[place.normalizedName]) {
                results[id] = coords;
            }
        }
    }

    return results;
}

/**
 * Simple string hash for deterministic offset generation.
 * @param {string} str 
 * @returns {number}
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

module.exports = { geocodePlace, batchGeocode };
