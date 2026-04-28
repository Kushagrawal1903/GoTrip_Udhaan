const axios = require('axios');

/**
 * Google Places / Maps / Photo Service
 * Fetches place details, photos, and coordinates.
 * Uses Wikipedia REST API as reliable free fallback for images.
 */

const GOOGLE_API_BASE = 'https://maps.googleapis.com/maps/api';

/**
 * Check if the Google API key is valid (not placeholder)
 */
function hasValidGoogleKey() {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    return key && key !== 'your_google_maps_api_key_here' && key.length > 10;
}

/**
 * Fetch a destination image from Wikipedia REST API (more reliable than Action API)
 * @param {string} searchTerm - Name of the place
 * @returns {string|null} Image URL or null
 */
async function getWikipediaImage(searchTerm) {
    try {
        // Use Wikipedia REST API - returns structured page summary with images
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
        const res = await axios.get(url, {
            timeout: 6000,
            headers: { 'User-Agent': 'GoTripPro/1.0 (travel-planner-app)' },
        });

        // Try original image first (higher quality), then thumbnail
        if (res.data?.originalimage?.source) {
            return res.data.originalimage.source;
        }
        if (res.data?.thumbnail?.source) {
            // Get a larger version by modifying the thumbnail URL
            return res.data.thumbnail.source.replace(/\/\d+px-/, '/1200px-');
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Try multiple search variations to find a Wikipedia image
 * @param {string} primaryTerm - Primary search term
 * @param {string[]} fallbackTerms - Additional terms to try
 * @returns {string|null} Image URL or null
 */
async function findBestWikipediaImage(primaryTerm, fallbackTerms = []) {
    // Try primary term first
    const primary = await getWikipediaImage(primaryTerm);
    if (primary) return primary;

    // Try each fallback term
    for (const term of fallbackTerms) {
        const img = await getWikipediaImage(term);
        if (img) return img;
    }
    return null;
}

/**
 * Get place details including coordinates and photo
 * @param {string} placeName - Name of the place to search
 * @returns {Object} Place details with coordinates and photo URL
 */
async function getPlaceDetails(placeName) {
    const fallback = {
        name: placeName,
        coordinates: null,
        photoUrl: null,
        mapsLink: `https://www.google.com/maps/search/${encodeURIComponent(placeName)}`,
    };

    try {
        // Try Google Places API first
        if (hasValidGoogleKey()) {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            const searchUrl = `${GOOGLE_API_BASE}/place/textsearch/json`;
            const searchResponse = await axios.get(searchUrl, {
                params: { query: placeName, key: apiKey },
                timeout: 8000,
            });

            if (searchResponse.data.status === 'OK' && searchResponse.data.results.length) {
                const place = searchResponse.data.results[0];
                const location = place.geometry?.location;

                let photoUrl = null;
                if (place.photos?.length > 0) {
                    const photoRef = place.photos[0].photo_reference;
                    // Fetch the actual photo to verify it works (Google redirects to the real URL)
                    try {
                        const photoApiUrl = `${GOOGLE_API_BASE}/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${apiKey}`;
                        const photoRes = await axios.get(photoApiUrl, {
                            maxRedirects: 5,
                            timeout: 8000,
                            responseType: 'stream',
                        });
                        // If we get here, the photo URL works. Use the final redirected URL.
                        photoUrl = photoRes.request?.res?.responseUrl || photoApiUrl;
                        // Destroy the stream since we just need the URL
                        photoRes.data.destroy();
                    } catch {
                        console.log('Google Places photo fetch failed, trying Wikipedia...');
                    }
                }

                // If Google photo failed, try Wikipedia
                if (!photoUrl) {
                    photoUrl = await findBestWikipediaImage(placeName, [
                        `${placeName} tourism`,
                        `${placeName} city`,
                        `${placeName} India`,
                    ]);
                }

                return {
                    name: place.name || placeName,
                    coordinates: location ? { lat: location.lat, lng: location.lng } : null,
                    photoUrl,
                    mapsLink: `https://www.google.com/maps/search/${encodeURIComponent(place.name || placeName)}`,
                    placeId: place.place_id,
                };
            }
        }

        // Fallback: Wikipedia images with multiple search variations
        const wikiImage = await findBestWikipediaImage(placeName, [
            `${placeName} tourism`,
            `${placeName} city`,
            `${placeName} India`,
        ]);
        return { ...fallback, photoUrl: wikiImage };
    } catch (error) {
        console.error('Place details error:', error.message);
        try {
            const wikiImage = await findBestWikipediaImage(placeName, [`${placeName} India`]);
            return { ...fallback, photoUrl: wikiImage };
        } catch {
            return fallback;
        }
    }
}

/**
 * Get photo URL for a hotel
 * @param {string} hotelName - Name of the hotel
 * @param {string} destination - City/area name
 * @param {string} imageQuery - Optional search query from AI
 * @returns {string|null} Photo URL or null
 */
async function getHotelPhoto(hotelName, destination, imageQuery) {
    try {
        if (hasValidGoogleKey()) {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            const searchUrl = `${GOOGLE_API_BASE}/place/textsearch/json`;
            const searchResponse = await axios.get(searchUrl, {
                params: {
                    query: `${hotelName} hotel ${destination}`,
                    type: 'lodging',
                    key: apiKey,
                },
                timeout: 8000,
            });

            if (searchResponse.data.status === 'OK' && searchResponse.data.results.length) {
                const place = searchResponse.data.results[0];
                if (place.photos?.length > 0) {
                    const photoRef = place.photos[0].photo_reference;
                    try {
                        const photoApiUrl = `${GOOGLE_API_BASE}/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${apiKey}`;
                        const photoRes = await axios.get(photoApiUrl, {
                            maxRedirects: 5,
                            timeout: 8000,
                            responseType: 'stream',
                        });
                        const finalUrl = photoRes.request?.res?.responseUrl || photoApiUrl;
                        photoRes.data.destroy();
                        return finalUrl;
                    } catch {
                        // Photo fetch failed, continue to fallbacks
                    }
                }
            }
        }

        // Fallback: Wikipedia with multiple search strategies
        const wikiImage = await findBestWikipediaImage(hotelName, [
            `${hotelName} ${destination}`,
            `${hotelName} hotel`,
            imageQuery || '',
        ].filter(Boolean));

        return wikiImage;
    } catch (error) {
        console.error('Hotel photo error:', error.message);
        return null;
    }
}

/**
 * Get Google Maps Embed URL for a location
 * @param {string} query - Place name or address
 * @returns {string} Embed URL for iframe
 */
function getMapEmbedUrl(query) {
    if (hasValidGoogleKey()) {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        return `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(query)}&key=${apiKey}`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

module.exports = {
    getPlaceDetails,
    getHotelPhoto,
    getMapEmbedUrl,
};
