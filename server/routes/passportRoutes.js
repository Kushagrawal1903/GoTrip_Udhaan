const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { generatePassportContent } = require('../services/passportService');

/**
 * GET /api/passport — Fetch assembled passport data
 * Merges user passport cache with live trip data
 */
router.get('/', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Fetch all trips for this user, sorted chronologically
        const trips = await Trip.find({ userId: req.userId })
            .sort({ createdAt: 1 })
            .lean();

        const passportData = user.passport || {};
        const memories = passportData.memories || [];

        // Build assembled passport
        const assembledTrips = trips.map((trip, idx) => {
            const memory = memories.find(m => m.tripId?.toString() === trip._id.toString());
            return {
                tripId: trip._id,
                destination: trip.destination,
                duration: trip.duration,
                budget: trip.budget,
                travelStyle: trip.travelStyle,
                travelers: trip.travelers,
                destinationImage: trip.destinationImage,
                createdAt: trip.createdAt,
                hotel: trip.tripData?.hotels?.[0]?.name || null,
                // Memory data (may be null if not yet generated)
                memoryCapsule: memory?.memoryCapsule || null,
                memoryMood: memory?.memoryMood || null,
                favoriteExperience: memory?.favoriteExperience || null,
                favoriteMoment: memory?.favoriteMoment || null,
                isCoreMemory: memory?.isCoreMemory || false,
                stampColor: memory?.stampColor || '#8b2500',
            };
        });

        // Compute stats
        const destinations = [...new Set(trips.map(t => t.destination))];
        const styles = trips.map(t => t.travelStyle).filter(Boolean);
        const styleCounts = {};
        styles.forEach(s => { styleCounts[s] = (styleCounts[s] || 0) + 1; });
        const favoriteStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        const totalDays = trips.reduce((sum, t) => sum + (t.duration || 0), 0);

        res.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    memberSince: user.createdAt,
                    avatarUrl: user.avatarUrl,
                },
                stats: {
                    tripsCompleted: trips.length,
                    destinationsExplored: destinations.length,
                    totalDays,
                    favoriteStyle,
                },
                travelPersonality: passportData.travelPersonality || null,
                reflectionSummary: passportData.reflectionSummary || null,
                trips: assembledTrips,
                isGenerated: !!passportData.generatedAt,
                generatedAt: passportData.generatedAt || null,
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/passport/generate — Generate AI content for passport
 * Creates memory capsules, travel personality, reflection summary
 */
router.post('/generate', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const trips = await Trip.find({ userId: req.userId })
            .sort({ createdAt: 1 })
            .lean();

        if (trips.length === 0) {
            return res.status(400).json({ success: false, message: 'No trips to generate passport from.' });
        }

        console.log(`[PASSPORT] Generating for ${user.name} — ${trips.length} trips`);

        const generated = await generatePassportContent(trips, user.name);

        // Build memories array with tripId mapping
        const memories = trips.map((trip, idx) => {
            const mem = generated.memories.find(m => m.tripIndex === idx) || generated.memories[idx];
            return {
                tripId: trip._id,
                memoryCapsule: mem?.memoryCapsule || `${trip.duration} days in ${trip.destination}.`,
                memoryMood: mem?.memoryMood || { emoji: '✨', label: 'Personal Journey' },
                favoriteExperience: mem?.favoriteExperience || trip.destination,
                favoriteMoment: user.passport?.memories?.find(m => m.tripId?.toString() === trip._id.toString())?.favoriteMoment || '',
                isCoreMemory: mem?.isCoreMemory || false,
                stampColor: mem?.stampColor || '#8b2500',
                generatedAt: new Date(),
            };
        });

        // Save to user
        if (!user.passport) user.passport = {};
        user.passport.travelPersonality = generated.travelPersonality;
        user.passport.memories = memories;
        user.passport.reflectionSummary = generated.reflectionSummary;
        user.passport.generatedAt = new Date();
        user.markModified('passport');
        await user.save();

        console.log(`[PASSPORT] Generated successfully for ${user.name}`);

        res.json({ success: true, message: 'Passport generated.' });
    } catch (err) {
        next(err);
    }
});

/**
 * PATCH /api/passport/memory/:tripId — Update user's favorite moment
 */
router.patch('/memory/:tripId', auth, async (req, res, next) => {
    try {
        const { favoriteMoment } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.passport?.memories) {
            return res.status(400).json({ success: false, message: 'Passport not yet generated.' });
        }

        const memory = user.passport.memories.find(m => m.tripId?.toString() === req.params.tripId);
        if (!memory) {
            return res.status(404).json({ success: false, message: 'Memory not found for this trip.' });
        }

        memory.favoriteMoment = favoriteMoment || '';
        user.markModified('passport');
        await user.save();

        res.json({ success: true, message: 'Favorite moment updated.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
