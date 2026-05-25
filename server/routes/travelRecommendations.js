const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const { generateTravelRecommendations } = require('../services/travelRecommendationService');

const router = express.Router();

/**
 * Helper to check if a user is authorized for a trip
 */
async function findAuthorizedTrip(tripId, userId) {
    return await Trip.findOne({
        _id: tripId,
        $or: [
            { userId: userId },
            { 'collaborators.userId': userId, 'collaborators.status': { $in: ['accepted', 'pending'] } },
        ],
    });
}

/**
 * POST /api/trips/:tripId/generate-travel-recommendations
 * Asynchronously generates recommendations for all travelers with origins and updates the Trip document
 */
router.post('/:tripId/generate-travel-recommendations', auth, async (req, res, next) => {
    try {
        const { tripId } = req.params;

        const trip = await findAuthorizedTrip(tripId, req.userId);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or unauthorized.',
            });
        }

        // Check if trip actually has traveler origins
        const travelers = Array.isArray(trip.travelers) ? trip.travelers : [];
        const travelersWithOrigins = travelers.filter(t => t.origin && t.origin.trim().length > 0);

        if (travelersWithOrigins.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No travelers with origin cities defined for this trip.',
            });
        }

        const optimizeFor = trip.travelOptimizeFor || 'balanced';

        // Call Gemini service
        const data = await generateTravelRecommendations(trip, travelersWithOrigins, optimizeFor);

        // Update database
        trip.travelRecommendations = data.recommendations;
        trip.meetingPlan = data.meetingPlan;
        trip.hasOrigins = true;
        await trip.save();

        res.json({
            success: true,
            message: 'Travel recommendations generated successfully.',
            data: {
                travelRecommendations: trip.travelRecommendations,
                meetingPlan: trip.meetingPlan,
                travelOptimizeFor: trip.travelOptimizeFor
            }
        });
    } catch (error) {
        console.error('Error generating travel recommendations:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate travel recommendations.',
        });
    }
});

/**
 * PATCH /api/trips/:tripId/travel-optimize
 * Updates the travel optimization preference, clears old recommendations, and regenerates them
 */
router.patch('/:tripId/travel-optimize', auth, async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const { optimizeFor } = req.body;

        const validOptimizations = ['cheapest', 'fastest', 'balanced', 'comfort'];
        if (!optimizeFor || !validOptimizations.includes(optimizeFor)) {
            return res.status(400).json({
                success: false,
                message: `Invalid optimizeFor value. Must be one of: ${validOptimizations.join(', ')}`,
            });
        }

        const trip = await findAuthorizedTrip(tripId, req.userId);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or unauthorized.',
            });
        }

        const travelers = Array.isArray(trip.travelers) ? trip.travelers : [];
        const travelersWithOrigins = travelers.filter(t => t.origin && t.origin.trim().length > 0);

        if (travelersWithOrigins.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No travelers with origin cities defined for this trip.',
            });
        }

        // Set preference
        trip.travelOptimizeFor = optimizeFor;

        // Call Gemini service with new preference
        const data = await generateTravelRecommendations(trip, travelersWithOrigins, optimizeFor);

        // Update database
        trip.travelRecommendations = data.recommendations;
        trip.meetingPlan = data.meetingPlan;
        await trip.save();

        res.json({
            success: true,
            message: `Travel recommendations regenerated and optimized for ${optimizeFor}.`,
            data: {
                travelRecommendations: trip.travelRecommendations,
                meetingPlan: trip.meetingPlan,
                travelOptimizeFor: trip.travelOptimizeFor
            }
        });
    } catch (error) {
        console.error('Error optimizing travel recommendations:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to regenerate travel recommendations.',
        });
    }
});

module.exports = router;
