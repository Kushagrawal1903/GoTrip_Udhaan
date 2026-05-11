const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const { generatePackingList } = require('../services/geminiPacking');

const router = express.Router();

/**
 * POST /api/packing-list/generate
 * Generate a packing list for a saved trip using Gemini AI.
 * If one already exists, returns the cached version.
 */
router.post('/generate', auth, async (req, res, next) => {
    try {
        const { tripId } = req.body;

        if (!tripId) {
            return res.status(400).json({
                success: false,
                message: 'Trip ID is required.',
            });
        }

        // Find trip — owner or accepted collaborator
        const trip = await Trip.findOne({
            _id: tripId,
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

        // Rate limit: return cached version if already generated
        if (trip.packingList && trip.packingList.categories && trip.packingList.categories.length > 0) {
            return res.json({
                success: true,
                data: { packingList: trip.packingList },
                cached: true,
            });
        }

        // Generate packing list via Gemini
        const packingData = await generatePackingList({
            destination: trip.destination,
            duration: trip.duration,
            travelers: trip.travelers || 1,
            style: trip.travelStyle,
            itinerary: trip.tripData?.itinerary || [],
        });

        // Save to trip document
        trip.packingList = {
            categories: packingData.categories,
            weatherNote: packingData.weatherNote || '',
            proTip: packingData.proTip || '',
            generatedAt: new Date(),
        };
        await trip.save();

        res.json({
            success: true,
            data: { packingList: trip.packingList },
            cached: false,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/packing-list/:tripId/toggle
 * Toggle the checked state of a single packing item.
 */
router.patch('/:tripId/toggle', auth, async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const { categoryIndex, itemIndex, checked } = req.body;

        if (categoryIndex === undefined || itemIndex === undefined || checked === undefined) {
            return res.status(400).json({
                success: false,
                message: 'categoryIndex, itemIndex, and checked are required.',
            });
        }

        // Find trip — owner or accepted collaborator
        const trip = await Trip.findOne({
            _id: tripId,
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

        if (!trip.packingList || !trip.packingList.categories) {
            return res.status(400).json({
                success: false,
                message: 'No packing list exists for this trip.',
            });
        }

        // Validate indices
        if (categoryIndex < 0 || categoryIndex >= trip.packingList.categories.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category index.',
            });
        }

        const category = trip.packingList.categories[categoryIndex];
        if (itemIndex < 0 || itemIndex >= category.items.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item index.',
            });
        }

        // Update the specific item
        const updatePath = `packingList.categories.${categoryIndex}.items.${itemIndex}.checked`;
        await Trip.updateOne(
            { _id: tripId },
            { $set: { [updatePath]: Boolean(checked) } }
        );

        res.json({
            success: true,
            data: {
                categoryIndex,
                itemIndex,
                checked: Boolean(checked),
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
