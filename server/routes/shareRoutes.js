const express = require('express');
const Trip = require('../models/Trip');

const router = express.Router();

/**
 * GET /api/share/:shareId
 * Publicly viewable route for shared trips.
 * No authentication required. Only works if isPublic === true.
 */
router.get('/:shareId', async (req, res, next) => {
    try {
        const { shareId } = req.params;

        // Find the trip using the public share ID
        const trip = await Trip.findOne({ shareId });

        // Check if trip exists and is marked as public
        if (!trip || !trip.isPublic) {
            return res.status(404).json({
                success: false,
                message: 'This trip is no longer available or the link is invalid.',
            });
        }

        // Return a sanitized version of the trip, excluding private data (like collaborator emails, full user info)
        // Note: For simplicity and since there's no auth, we'll return what's necessary to render the UI
        const safeTrip = {
            _id: trip._id,
            destination: trip.destination,
            duration: trip.duration,
            budget: trip.budget,
            travelStyle: trip.travelStyle,
            travelers: trip.travelers,
            tripData: trip.tripData,
            destinationImage: trip.destinationImage,
            coordinates: trip.coordinates,
            packingList: trip.packingList,
            createdAt: trip.createdAt,
            // DO NOT include comments or full collaborators list for public view
        };

        res.json({
            success: true,
            data: { trip: safeTrip },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
