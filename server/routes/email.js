const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendTripEmail } = require('../services/emailService');

const router = express.Router();

/**
 * POST /api/email/send-trip
 * Send trip details to an email address via Resend.
 * Protected route — requires authentication.
 *
 * Request body:
 *   { email: string, tripId: string }
 */
router.post('/send-trip', auth, async (req, res, next) => {
    try {
        const { email, tripId } = req.body;

        // ─── Validate inputs ─────────────────────────────────────
        if (!email || !tripId) {
            return res.status(400).json({
                success: false,
                message: 'Email and trip ID are required.',
            });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.',
            });
        }

        // ─── Fetch trip and verify ownership ─────────────────────
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found.',
            });
        }

        // Authorization: only the trip owner can send it via email
        if (trip.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only send your own trips via email.',
            });
        }

        // ─── Fetch user name ────────────────────────────────────
        const user = await User.findById(req.userId).select('name');
        const userName = user?.name || 'Traveler';

        // ─── Map trip data ──────────────────────────────────────
        const destination = trip.destination || 'your destination';

        const duration = trip.duration
            ? `${trip.duration} Day${trip.duration > 1 ? 's' : ''}`
            : 'N/A';

        const budgetMap = {
            low: 'Budget-Friendly',
            moderate: 'Moderate',
            premium: 'Premium',
        };
        const estimatedCost = trip.tripData?.estimatedBudget || trip.tripData?.totalBudget || trip.tripData?.budget;
        const budget = estimatedCost
            ? String(estimatedCost)
            : budgetMap[trip.budget] || trip.budget || 'N/A';

        const travelStyleMap = {
            adventure: 'Adventure',
            relaxation: 'Relaxation',
            cultural: 'Cultural',
            family: 'Family',
            romantic: 'Romantic',
        };
        const travelStyle = travelStyleMap[trip.travelStyle] || trip.travelStyle || null;

        const travelers = trip.travelers || 1;

        // Ensure the trip has a shareId and is public
        const crypto = require('crypto');
        if (!trip.shareId) {
            trip.shareId = crypto.randomBytes(4).toString('hex');
        }
        trip.isPublic = true;
        await trip.save();

        const clientUrl = process.env.CLIENT_URL || 'https://mygotrip.online';
        const tripUrl = `${clientUrl}/share/${trip.shareId}`;

        // ─── Send via Resend ────────────────────────────────────
        await sendTripEmail({
            userName,
            recipientEmail: email,
            destination,
            duration,
            budget,
            travelStyle,
            travelers,
            tripUrl,
            tripId: trip._id.toString(),
        });

        res.json({
            success: true,
            message: 'Trip sent to your email successfully!',
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
});

module.exports = router;
