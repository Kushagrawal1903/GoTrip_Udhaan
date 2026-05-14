const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const { generatePDF } = require('../services/pdfGenerator');

const router = express.Router();

/**
 * POST /api/export/pdf/:tripId
 * Generate and download a professional PDF for a saved trip.
 */
router.post('/pdf/:tripId', auth, async (req, res, next) => {
    try {
        const { tripId } = req.params;

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

        if (!trip.tripData) {
            return res.status(400).json({
                success: false,
                message: 'Trip has no itinerary data.',
            });
        }

        // Ensure the trip has a shareId and is public so the PDF link works
        const crypto = require('crypto');
        let shouldSave = false;
        if (!trip.shareId) {
            trip.shareId = crypto.randomBytes(4).toString('hex');
            shouldSave = true;
        }
        if (!trip.isPublic) {
            trip.isPublic = true;
            shouldSave = true;
        }
        if (shouldSave) {
            await trip.save();
        }

        // Generate PDF buffer
        const pdfBuffer = await generatePDF(trip);

        // Sanitize destination for filename
        const safeDest = (trip.destination || 'trip').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
        const filename = `GoTrip-${safeDest}.pdf`;

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
