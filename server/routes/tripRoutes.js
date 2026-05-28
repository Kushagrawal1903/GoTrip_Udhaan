const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const { generateTrip } = require('../services/geminiService');
const { getPlaceDetails, getHotelPhoto } = require('../services/googleService');

const router = express.Router();

/**
 * POST /api/trips/generate
 * Generate a new trip itinerary using AI
 * Protected route — requires authentication
 */
router.post('/generate', auth, async (req, res, next) => {
    try {
        const { destination, duration, budget, travelStyle, travelers, selectedVibes, customTripIntent } = req.body;

        // Validate required inputs
        if (!destination || !duration || !budget || !travelStyle) {
            return res.status(400).json({
                success: false,
                message: 'Please provide destination, duration, budget, and travel style.',
            });
        }

        // Validate duration range
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 30) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be between 1 and 30 days.',
            });
        }

        // Validate travelers count (default to 1 for backward compatibility)
        const travelersNum = Array.isArray(travelers) ? travelers.length : (parseInt(travelers) || 1);
        if (travelersNum < 1 || travelersNum > 10) {
            return res.status(400).json({
                success: false,
                message: 'Number of travelers must be between 1 and 10.',
            });
        }

        // Validate budget tier
        const validBudgets = ['low', 'moderate', 'premium'];
        if (!validBudgets.includes(budget.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Budget must be one of: low, moderate, premium.',
            });
        }

        // Validate travel style
        const validStyles = ['adventure', 'relaxation', 'cultural', 'family', 'romantic'];
        if (!validStyles.includes(travelStyle.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Travel style must be one of: adventure, relaxation, cultural, family, romantic.',
            });
        }

        // Generate trip using Gemini AI
        const tripData = await generateTrip({
            destination,
            duration: durationNum,
            budget: budget.toLowerCase(),
            travelStyle: travelStyle.toLowerCase(),
            travelers: travelersNum,
            travelersArray: Array.isArray(travelers) ? travelers : [],
            hasOrigins: Array.isArray(travelers) && travelers.some(t => t.origin && t.origin.trim().length > 0),
            optimizeFor: req.body.optimizeFor || 'balanced',
            selectedVibes: Array.isArray(selectedVibes) ? selectedVibes : [],
            customTripIntent: typeof customTripIntent === 'string' ? customTripIntent.slice(0, 500) : '',
        });

        // Fetch place details (coordinates, image) from Google Places API
        const placeDetails = await getPlaceDetails(destination);

        // Fetch hotel photos in parallel
        if (tripData.hotels && tripData.hotels.length > 0) {
            const hotelPhotoPromises = tripData.hotels.map(async (hotel) => {
                const photoUrl = await getHotelPhoto(hotel.name, destination, hotel.imageQuery);
                return { ...hotel, imageUrl: photoUrl };
            });
            tripData.hotels = await Promise.all(hotelPhotoPromises);
        }

        res.json({
            success: true,
            data: {
                tripData,
                placeDetails,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trips/save
 * Save a generated trip to the database
 * Protected route — requires authentication
 */
router.post('/save', auth, async (req, res, next) => {
    try {
        const { destination, duration, budget, travelStyle, travelers, tripData, destinationImage, coordinates, hasOrigins, travelOptimizeFor, tripPreferences } = req.body;

        if (!destination || !tripData) {
            return res.status(400).json({
                success: false,
                message: 'Trip data is required to save.',
            });
        }

        const trip = await Trip.create({
            userId: req.userId,
            destination,
            duration,
            budget,
            travelStyle,
            travelers: Array.isArray(travelers) ? travelers : (parseInt(travelers) || 1),
            tripData,
            destinationImage,
            coordinates,
            hasOrigins: hasOrigins || false,
            travelOptimizeFor: travelOptimizeFor || 'balanced',
            tripPreferences: tripPreferences || {},
        });

        res.status(201).json({
            success: true,
            message: 'Trip saved successfully!',
            data: { trip },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/trips
 * Get all saved trips for the authenticated user (owned + collaborated)
 */
router.get('/', auth, async (req, res, next) => {
    try {
        const trips = await Trip.find({
            $or: [
                { userId: req.userId },
                { 'collaborators.userId': req.userId, 'collaborators.status': 'accepted' },
            ],
        })
            .sort({ createdAt: -1 })
            .select('-tripData -comments'); // Exclude heavy fields for list view

        res.json({
            success: true,
            data: { trips },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/trips/:id
 * Get a single saved trip by ID (owner or accepted collaborator)
 */
router.get('/:id', auth, async (req, res, next) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            $or: [
                { userId: req.userId },
                { 'collaborators.userId': req.userId, 'collaborators.status': { $in: ['accepted', 'pending'] } },
            ],
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found.',
            });
        }

        res.json({
            success: true,
            data: { trip },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/trips/:id
 * Delete a saved trip by ID
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const trip = await Trip.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found.',
            });
        }

        res.json({
            success: true,
            message: 'Trip deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trips/:id/share
 * Enables public sharing for a trip and returns the secure shareId
 */
router.post('/:id/share', auth, async (req, res, next) => {
    try {
        const crypto = require('crypto');
        
        // Find trip — owner only
        const trip = await Trip.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or unauthorized.',
            });
        }

        // Enable public sharing and ensure a shareId exists
        trip.isPublic = true;
        if (!trip.shareId) {
            trip.shareId = crypto.randomBytes(4).toString('hex'); // 8 char hex string
        }

        await trip.save();

        res.json({
            success: true,
            message: 'Trip is now public.',
            data: {
                shareId: trip.shareId,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/trips/:tripId/itinerary/slot
 * Edit a single time-slot activity within a day of the itinerary
 * Protected route — only the trip owner can edit
 */
router.patch('/:tripId/itinerary/slot', auth, async (req, res, next) => {
    try {
        const { dayIndex, slot, title, description } = req.body;

        // ── Validate slot name ──────────────────────────────
        const validSlots = ['morning', 'afternoon', 'evening', 'night'];
        if (!validSlots.includes(slot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid slot. Must be one of: ${validSlots.join(', ')}`,
            });
        }

        // ── Validate title & description ────────────────────
        if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Title is required and must be 1–100 characters.',
            });
        }
        if (!description || typeof description !== 'string' || description.trim().length === 0 || description.trim().length > 400) {
            return res.status(400).json({
                success: false,
                message: 'Description is required and must be 1–400 characters.',
            });
        }

        // ── Find trip — owner only ──────────────────────────
        const trip = await Trip.findOne({
            _id: req.params.tripId,
            userId: req.userId,
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or unauthorized.',
            });
        }

        // ── Validate dayIndex ───────────────────────────────
        const itinerary = trip.tripData?.itinerary;
        if (!itinerary || !Array.isArray(itinerary)) {
            return res.status(400).json({
                success: false,
                message: 'Trip has no itinerary data.',
            });
        }

        const dayIdx = parseInt(dayIndex);
        if (isNaN(dayIdx) || dayIdx < 0 || dayIdx >= itinerary.length) {
            return res.status(400).json({
                success: false,
                message: `dayIndex must be between 0 and ${itinerary.length - 1}.`,
            });
        }

        // ── Find the matching activity by time slot ─────────
        const day = itinerary[dayIdx];
        if (!day.activities || !Array.isArray(day.activities)) {
            return res.status(400).json({
                success: false,
                message: 'Day has no activities array.',
            });
        }

        const activityIndex = day.activities.findIndex(
            (a) => (a.time || '').toLowerCase() === slot
        );

        if (activityIndex === -1) {
            return res.status(400).json({
                success: false,
                message: `No "${slot}" activity found in day ${dayIdx + 1}.`,
            });
        }

        // ── Update the activity fields ──────────────────────
        day.activities[activityIndex].placeName = title.trim();
        day.activities[activityIndex].activity = description.trim();

        // Required for Mongoose to detect changes in Mixed type fields
        trip.markModified('tripData');
        await trip.save();

        return res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trips/:tripId/share-analytics
 * Track share card events (download, whatsapp, link copy, native share)
 * Protected route — requires authentication
 */
router.post('/:tripId/share-analytics', auth, async (req, res, next) => {
    try {
        const { platform } = req.body;

        const validPlatforms = ['download', 'whatsapp', 'link', 'native'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                message: `Platform must be one of: ${validPlatforms.join(', ')}`,
            });
        }

        await Trip.findByIdAndUpdate(req.params.tripId, {
            $inc: {
                'shares.total': 1,
                [`shares.byPlatform.${platform}`]: 1,
            },
            $set: { 'shares.lastSharedAt': new Date() },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/trips/:tripId/public
 * Returns limited trip data for public card page — NO auth required.
 */
router.get('/:tripId/public', async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .select('destination duration travelers travelStyle budget tripData destinationImage coordinates createdAt')
            .lean();

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found.',
            });
        }

        res.json({ success: true, data: { trip } });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trips/:id/map-data
 * Extract all places from trip data, geocode them, and return normalized map locations.
 * Caches geocoded coordinates in trip.tripData._mapCache to avoid repeated lookups.
 * Protected route — owner or accepted collaborator.
 */
router.post('/:id/map-data', auth, async (req, res, next) => {
    try {
        const { batchGeocode } = require('../services/geocodeService');

        const trip = await Trip.findOne({
            _id: req.params.id,
            $or: [
                { userId: req.userId },
                { 'collaborators.userId': req.userId, 'collaborators.status': 'accepted' },
            ],
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found.',
            });
        }

        const tripData = trip.tripData;
        if (!tripData) {
            return res.json({ success: true, data: { locations: [] } });
        }

        // ── Extract all places from trip data ─────────────────────
        const places = [];
        let orderCounter = 0;

        // Hotels
        if (tripData.hotels && Array.isArray(tripData.hotels)) {
            tripData.hotels.forEach((hotel, idx) => {
                if (hotel.name) {
                    places.push({
                        id: `hotel-${idx}`,
                        name: hotel.name,
                        type: 'hotel',
                        day: 0, // hotels span entire trip
                        order: orderCounter++,
                        timeSlot: 'All Day',
                        description: hotel.description || '',
                        estimatedCost: hotel.priceRange || '',
                        mapsLink: hotel.mapsLink || '',
                        category: 'stay',
                        source: 'hotel',
                        rating: hotel.rating || null,
                    });
                }
            });
        }

        // Itinerary activities
        if (tripData.itinerary && Array.isArray(tripData.itinerary)) {
            tripData.itinerary.forEach((day, dayIdx) => {
                if (day.activities && Array.isArray(day.activities)) {
                    day.activities.forEach((act, actIdx) => {
                        if (act.placeName) {
                            // Determine type from activity context
                            const actType = classifyActivity(act.placeName, act.activity || '', act.time || '');
                            places.push({
                                id: `act-${dayIdx}-${actIdx}`,
                                name: act.placeName,
                                type: actType,
                                day: dayIdx + 1,
                                order: orderCounter++,
                                timeSlot: act.time || '',
                                description: act.activity || '',
                                estimatedCost: act.estimatedCost || '',
                                mapsLink: act.mapsLink || '',
                                category: actType,
                                source: 'activity',
                            });
                        }
                    });
                }

                // Meals — extract restaurant names
                if (day.meals) {
                    Object.entries(day.meals).forEach(([mealType, detail], mealIdx) => {
                        if (detail && typeof detail === 'string') {
                            // Format: "Restaurant Name — ₹XXX per person"
                            const restaurantName = detail.split('—')[0].split('–')[0].split('-')[0].trim();
                            if (restaurantName && restaurantName.length > 2) {
                                places.push({
                                    id: `meal-${dayIdx}-${mealIdx}`,
                                    name: restaurantName,
                                    type: 'restaurant',
                                    day: dayIdx + 1,
                                    order: orderCounter++,
                                    timeSlot: mealType.charAt(0).toUpperCase() + mealType.slice(1),
                                    description: detail,
                                    estimatedCost: '',
                                    mapsLink: '',
                                    category: 'food',
                                    source: 'meal',
                                });
                            }
                        }
                    });
                }
            });
        }

        if (places.length === 0) {
            console.log('[MAP-DATA] No places extracted from trip', req.params.id);
            return res.json({ success: true, data: { locations: [] } });
        }

        console.log(`[MAP-DATA] Trip ${req.params.id} (${trip.destination}): extracted ${places.length} places`);

        // ── Check cache ───────────────────────────────────────────
        const existingCache = tripData._mapCache || {};
        const uncachedPlaces = places.filter(p => !existingCache[p.id]);

        let geocodedCoords = { ...existingCache };

        // Helper: check if coordinates object has valid numeric lat/lng
        const hasValidCoords = (c) => c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng);

        console.log(`[MAP-DATA] Cache: ${Object.keys(existingCache).length} entries, ${uncachedPlaces.length} uncached`);

        // Only geocode uncached places
        if (uncachedPlaces.length > 0) {
            // trip.coordinates is a Mongoose subdocument { lat: null, lng: null }
            // which is truthy even when empty — must check actual values
            let destCoords = hasValidCoords(trip.coordinates) ? { lat: trip.coordinates.lat, lng: trip.coordinates.lng } : null;

            console.log(`[MAP-DATA] trip.coordinates valid? ${!!destCoords}`, destCoords);

            if (!destCoords && trip.destination) {
                const { geocodePlace } = require('../services/geocodeService');
                destCoords = await geocodePlace(trip.destination, '');
                console.log(`[MAP-DATA] Geocoded destination "${trip.destination}":`, destCoords);
                
                // If we found destination coords, save them to the trip to avoid future lookups
                if (destCoords) {
                    trip.coordinates = destCoords;
                }
            }

            console.log(`[MAP-DATA] Starting batchGeocode for ${uncachedPlaces.length} places with destCoords:`, destCoords);

            const newCoords = await batchGeocode(
                uncachedPlaces.map(p => ({ name: p.name, id: p.id })),
                trip.destination,
                destCoords
            );

            console.log(`[MAP-DATA] batchGeocode returned ${Object.keys(newCoords).length} results`);

            geocodedCoords = { ...geocodedCoords, ...newCoords };

            // Save cache to trip document
            trip.tripData._mapCache = geocodedCoords;
            trip.markModified('tripData');
            await trip.save();
        }

        // ── Build normalized locations ────────────────────────────
        const locations = places
            .map(place => {
                const coords = geocodedCoords[place.id];
                if (!coords || !hasValidCoords(coords)) return null;

                return {
                    ...place,
                    lat: coords.lat,
                    lng: coords.lng,
                };
            })
            .filter(Boolean);

        console.log(`[MAP-DATA] Final: ${locations.length}/${places.length} locations with valid coordinates`);

        // Build a valid center for the response
        const tripCenter = hasValidCoords(trip.coordinates)
            ? { lat: trip.coordinates.lat, lng: trip.coordinates.lng }
            : (locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : null);

        res.json({
            success: true,
            data: {
                locations,
                center: tripCenter,
                destination: trip.destination,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Classify an activity into a map marker type based on keywords.
 * @param {string} placeName
 * @param {string} description
 * @param {string} timeSlot
 * @returns {string}
 */
function classifyActivity(placeName, description, timeSlot) {
    const combined = `${placeName} ${description}`.toLowerCase();

    // Food/Restaurant indicators
    if (/restaurant|cafe|coffee|dining|eat|food|bakery|bistro|dhaba|street food|cuisine/i.test(combined)) {
        return 'restaurant';
    }
    // Transport indicators
    if (/airport|station|terminal|metro|bus stand|railway|junction/i.test(combined)) {
        return 'transport';
    }
    // Shopping indicators
    if (/mall|market|bazaar|shopping|souvenir|store|shop/i.test(combined)) {
        return 'shopping';
    }
    // Default to attraction
    return 'attraction';
}

module.exports = router;
