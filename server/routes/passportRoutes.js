const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { generatePassportContent } = require('../services/passportService');
const { uploadPassportPhoto, destroyByPublicId } = require('../services/cloudinaryService');

/**
 * Ensure a passport memory row exists for a trip (upsert stub for new trips after generation).
 */
function ensureMemoryForTrip(user, tripId) {
    if (!user.passport.memories) {
        user.passport.memories = [];
    }
    let memory = user.passport.memories.find(m => m.tripId?.toString() === tripId);
    if (!memory) {
        memory = {
            tripId: new mongoose.Types.ObjectId(tripId),
            photos: [],
            personalThought: '',
            userMood: null,
        };
        user.passport.memories.push(memory);
    }
    return memory;
}

// Multer memory storage for photo uploads (max 5 files, 5MB each)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

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
                // New fields
                photos: memory?.photos || [],
                personalThought: memory?.personalThought || null,
                userMood: memory?.userMood || null,
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

        // Build memories array with tripId mapping — preserve existing user data
        const memories = trips.map((trip, idx) => {
            const mem = generated.memories.find(m => m.tripIndex === idx) || generated.memories[idx];
            const existing = user.passport?.memories?.find(m => m.tripId?.toString() === trip._id.toString());
            return {
                tripId: trip._id,
                memoryCapsule: mem?.memoryCapsule || `${trip.duration} days in ${trip.destination}.`,
                memoryMood: mem?.memoryMood || { emoji: '✨', label: 'Personal Journey' },
                favoriteExperience: mem?.favoriteExperience || trip.destination,
                favoriteMoment: existing?.favoriteMoment || '',
                isCoreMemory: mem?.isCoreMemory || false,
                stampColor: mem?.stampColor || '#8b2500',
                generatedAt: new Date(),
                // Preserve user-uploaded data across regeneration
                photos: existing?.photos || [],
                personalThought: existing?.personalThought || '',
                userMood: existing?.userMood || null,
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
 * PATCH /api/passport/memory/:tripId — Update memory details
 * Supports: favoriteMoment, personalThought, userMood
 */
router.patch('/memory/:tripId', auth, async (req, res, next) => {
    try {
        const { favoriteMoment, personalThought, userMood } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.passport?.memories) {
            return res.status(400).json({ success: false, message: 'Passport not yet generated.' });
        }

        const memory = ensureMemoryForTrip(user, req.params.tripId);

        // Update whichever fields are provided
        if (favoriteMoment !== undefined) memory.favoriteMoment = favoriteMoment;
        if (personalThought !== undefined) memory.personalThought = personalThought;
        if (userMood !== undefined) memory.userMood = userMood;

        user.markModified('passport');
        await user.save();

        res.json({ success: true, message: 'Memory updated.' });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/passport/memory/:tripId/photos — Upload memory photos
 * Max 5 photos per trip
 */
router.post('/memory/:tripId/photos', auth, upload.array('photos', 5), async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.passport?.memories) {
            return res.status(400).json({ success: false, message: 'Passport not yet generated.' });
        }

        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: 'No photos provided.' });
        }

        const memory = ensureMemoryForTrip(user, req.params.tripId);

        // Check total limit
        const currentCount = memory.photos?.length || 0;
        const newCount = req.files.length;
        if (currentCount + newCount > 5) {
            return res.status(400).json({
                success: false,
                message: `Maximum 5 photos per trip. You have ${currentCount}, tried to add ${newCount}.`,
            });
        }

        // Upload each file to Cloudinary
        const uploadedPhotos = [];
        for (const file of req.files) {
            const result = await uploadPassportPhoto(file.buffer, req.params.tripId);
            const rotation = Math.round((Math.random() * 8 - 4) * 10) / 10; // -4 to +4 degrees
            uploadedPhotos.push({
                url: result.url,
                publicId: result.publicId,
                caption: '',
                rotation,
                uploadedAt: new Date(),
            });
        }

        if (!memory.photos) memory.photos = [];
        memory.photos.push(...uploadedPhotos);

        user.markModified('passport');
        await user.save();

        res.json({
            success: true,
            message: `${uploadedPhotos.length} photo(s) uploaded.`,
            photos: memory.photos,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/passport/memory/:tripId/photos/:photoId — Delete a memory photo
 */
router.delete('/memory/:tripId/photos/:photoId', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const memory = user.passport?.memories?.find(m => m.tripId?.toString() === req.params.tripId);
        if (!memory) {
            return res.status(404).json({ success: false, message: 'Memory not found.' });
        }

        const photoIdx = memory.photos?.findIndex(p => p._id?.toString() === req.params.photoId);
        if (photoIdx === -1 || photoIdx === undefined) {
            return res.status(404).json({ success: false, message: 'Photo not found.' });
        }

        // Delete from Cloudinary
        const photo = memory.photos[photoIdx];
        if (photo.publicId) {
            await destroyByPublicId(photo.publicId);
        }

        memory.photos.splice(photoIdx, 1);
        user.markModified('passport');
        await user.save();

        res.json({ success: true, message: 'Photo deleted.', photos: memory.photos });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/passport/travel-book — Download premium Travel Book PDF
 */
router.get('/travel-book', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const trips = await Trip.find({ userId: req.userId })
            .sort({ createdAt: 1 })
            .lean();

        if (trips.length === 0) {
            return res.status(400).json({ success: false, message: 'No trips for travel book.' });
        }

        const passportData = user.passport || {};
        const memories = passportData.memories || [];

        // Assemble full passport data for PDF
        const assembledTrips = trips.map((trip) => {
            const memory = memories.find(m => m.tripId?.toString() === trip._id.toString());
            return {
                destination: trip.destination,
                duration: trip.duration,
                budget: trip.budget,
                travelStyle: trip.travelStyle,
                travelers: trip.travelers,
                destinationImage: trip.destinationImage,
                createdAt: trip.createdAt,
                hotel: trip.tripData?.hotels?.[0]?.name || null,
                memoryCapsule: memory?.memoryCapsule || null,
                memoryMood: memory?.memoryMood || null,
                favoriteExperience: memory?.favoriteExperience || null,
                favoriteMoment: memory?.favoriteMoment || null,
                isCoreMemory: memory?.isCoreMemory || false,
                stampColor: memory?.stampColor || '#8b2500',
                photos: memory?.photos || [],
                personalThought: memory?.personalThought || null,
                userMood: memory?.userMood || null,
            };
        });

        const destinations = [...new Set(trips.map(t => t.destination))];
        const totalDays = trips.reduce((sum, t) => sum + (t.duration || 0), 0);

        const pdfData = {
            user: {
                name: user.name,
                memberSince: user.createdAt,
            },
            stats: {
                tripsCompleted: trips.length,
                destinationsExplored: destinations.length,
                totalDays,
            },
            travelPersonality: passportData.travelPersonality || null,
            reflectionSummary: passportData.reflectionSummary || null,
            trips: assembledTrips,
        };

        const { generateTravelBookPDF } = require('../services/passportPdfGenerator');
        const pdfBuffer = await generateTravelBookPDF(pdfData);

        if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
            return res.status(500).json({ success: false, message: 'Journal could not be generated.' });
        }

        const MAX_PDF_BYTES = 25 * 1024 * 1024;
        if (pdfBuffer.length > MAX_PDF_BYTES) {
            return res.status(413).json({
                success: false,
                message: 'Your memory journal is too large. Try removing a few photos and save again.',
            });
        }

        const fileName = `${(user.name || 'Traveler').replace(/[^a-zA-Z0-9]/g, '_')}_Memory_Journal.pdf`;
        res.status(200);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (err) {
        console.error('[PASSPORT PDF] Generation failed:', err.message, err.stack);
        const message = err.message?.includes('PDF engine')
            ? err.message
            : 'Could not create your memory journal. Please try again in a moment.';
        res.status(500).json({ success: false, message });
    }
});

module.exports = router;
