const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendTripWhatsApp, sanitizePhoneNumber, isValidPhoneNumber } = require('../services/whatsappService');

const router = express.Router();

/**
 * POST /api/whatsapp/send-trip
 * Send trip details to a WhatsApp number via Meta Cloud API.
 * Protected route — requires authentication.
 *
 * Request body:
 *   { phoneNumber: string, tripId: string }
 */
router.post('/send-trip', auth, async (req, res, next) => {
    try {
        const { phoneNumber, tripId } = req.body;

        // ─── Validate inputs ─────────────────────────────────────
        if (!phoneNumber || !tripId) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and trip ID are required.',
            });
        }

        // Sanitize phone number
        const cleanPhone = sanitizePhoneNumber(phoneNumber);

        if (!isValidPhoneNumber(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid WhatsApp phone number.',
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

        // Authorization: only the trip owner can send it via WhatsApp
        if (trip.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only send your own trips via WhatsApp.',
            });
        }

        // ─── Fetch user name ────────────────────────────────────
        const user = await User.findById(req.userId).select('name');
        const userName = user?.name || 'Traveler';

        // ─── Map trip data ──────────────────────────────────────
        const destination = trip.destination || 'your destination';

        // Duration: stored as a number (days) in the schema
        const duration = trip.duration ? `${trip.duration} Day${trip.duration > 1 ? 's' : ''}` : 'N/A';

        // Budget: stored as tier (low/moderate/premium) — map to display-friendly text
        const budgetMap = {
            low: 'Budget-Friendly',
            moderate: 'Moderate',
            premium: 'Premium',
        };
        // Check tripData for estimated cost first, fall back to tier label
        const estimatedCost = trip.tripData?.estimatedBudget || trip.tripData?.totalBudget || trip.tripData?.budget;
        const budget = estimatedCost
            ? String(estimatedCost)
            : budgetMap[trip.budget] || trip.budget || 'N/A';

        // Build the trip URL
        const clientUrl = process.env.CLIENT_URL || 'https://gotrip.vercel.app';
        const tripUrl = `${clientUrl}/trip/${trip._id}`;

        // ─── Send via WhatsApp Cloud API ────────────────────────
        const result = await sendTripWhatsApp({
            phoneNumber: cleanPhone,
            userName,
            destination,
            duration,
            budget,
            tripUrl,
        });

        res.json({
            success: true,
            message: 'Trip sent to WhatsApp successfully!',
            data: {
                messageId: result?.messages?.[0]?.id || null,
            },
        });
    } catch (error) {
        // If the error already has a statusCode from the service, use it
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
