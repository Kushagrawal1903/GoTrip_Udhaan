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
        const { destination, duration, budget, travelStyle, travelers } = req.body;

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
        const travelersNum = parseInt(travelers) || 1;
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
        const { destination, duration, budget, travelStyle, travelers, tripData, destinationImage, coordinates } = req.body;

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
            travelers: parseInt(travelers) || 1,
            tripData,
            destinationImage,
            coordinates,
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

module.exports = router;
