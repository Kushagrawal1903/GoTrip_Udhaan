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
                { 'collaborators.userId': req.userId, 'collaborators.status': 'accepted' },
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

module.exports = router;
