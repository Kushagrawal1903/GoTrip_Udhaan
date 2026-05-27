const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');

// AI Companion Services
const { routeIntent, fallbackIntentDetection } = require('../services/ai-companion/intentRouter');
const { buildContext, updatePreferences } = require('../services/ai-companion/contextBuilder');
const { createPatch } = require('../services/ai-companion/patchGenerator');
const { applyPatch, createSnapshot, buildDiffSummary } = require('../services/ai-companion/diffEngine');
const memory = require('../services/ai-companion/conversationMemory');

const router = express.Router();

/**
 * Helper to get and verify trip ownership
 */
async function getTripAsOwner(tripId, userId) {
    const trip = await Trip.findOne({ _id: tripId, userId });
    if (!trip) throw new Error('Trip not found or unauthorized');
    return trip;
}

/**
 * POST /api/companion/:tripId/message
 * Send a message to the AI Companion and get a patch proposal
 */
router.post('/:tripId/message', auth, async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const trip = await getTripAsOwner(req.params.tripId, req.userId);
        const session = memory.getSession(trip);

        // 1. Build context
        const contextMemory = session ? session.contextMemory : {};
        const tripContextMeta = {
            destination: trip.destination,
            duration: trip.duration,
            travelStyle: trip.travelStyle,
            budget: trip.budget,
        };

        // 2. Classify intent
        let intentData;
        try {
            intentData = await routeIntent(message, tripContextMeta);
        } catch (error) {
            console.warn(`[Companion] Intent classification failed: ${error.message}. Using fallback.`);
            intentData = fallbackIntentDetection(message);
        }

        // 3. Build compressed context for generation
        const compressedContext = buildContext(trip, intentData, session);

        // 4. Generate patch
        let patch;
        try {
            patch = await createPatch(intentData.intent, compressedContext, message);
        } catch (error) {
            console.error('[Companion] Patch generation error:', error);
            // Don't expose raw Groq errors
            return res.status(500).json({
                success: false,
                message: 'Still refining your trip… Please try again in a moment.',
            });
        }

        // 5. Check if clarification is needed
        if (patch.requiresClarification || patch.changes.length === 0) {
            memory.addMessage(trip, 'user', message);
            memory.addMessage(trip, 'assistant', patch.summary, intentData.intent, null);
            await trip.save();
            
            return res.json({
                success: true,
                data: {
                    message: {
                        role: 'assistant',
                        content: patch.summary,
                        intent: intentData.intent,
                        patchId: null,
                    },
                },
            });
        }

        // 6. Test apply the patch to get diff summary (dry run)
        const diffResult = applyPatch(trip.tripData, patch);
        
        if (diffResult.errors.length > 0 && diffResult.appliedChanges.length === 0) {
            // Failed to apply any changes
            return res.status(400).json({
                success: false,
                message: "I couldn't safely apply those changes. Could you clarify what you'd like to update?",
            });
        }

        const diffSummary = buildDiffSummary(patch, diffResult.appliedChanges);
        const patchId = `patch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        // 7. Save message and proposed patch state to memory
        memory.addMessage(trip, 'user', message);
        memory.addMessage(trip, 'assistant', patch.summary, intentData.intent, patchId);

        // We store the validated patch and its dry-run diff
        // It's not applied yet.
        memory.storePatch(trip, patchId, intentData.intent, patch, null);
        
        // Update user preferences
        const newPrefs = updatePreferences(session?.userPreferences, intentData.intent);
        memory.updateSessionPreferences(trip, newPrefs);

        await trip.save();

        res.json({
            success: true,
            data: {
                message: {
                    role: 'assistant',
                    content: patch.summary,
                    intent: intentData.intent,
                    patchId,
                },
                diffPreview: diffSummary,
                patchId,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/companion/:tripId/apply
 * Apply a pending patch
 */
router.post('/:tripId/apply', auth, async (req, res, next) => {
    try {
        const { patchId } = req.body;
        if (!patchId) return res.status(400).json({ success: false, message: 'patchId required' });

        const trip = await getTripAsOwner(req.params.tripId, req.userId);
        
        // Find the patch in history
        const session = memory.getSession(trip);
        const patchRecord = session.patchHistory.find(p => p.patchId === patchId);

        if (!patchRecord) {
            return res.status(404).json({ success: false, message: 'Patch not found' });
        }
        
        if (patchRecord.snapshot) {
            // Already applied
            return res.json({ success: true, data: { tripData: trip.tripData } });
        }

        // 1. Create snapshot
        const snapshot = createSnapshot(trip.tripData);

        // 2. Apply patch
        const diffResult = applyPatch(trip.tripData, patchRecord.changes);

        // 3. Save to DB
        trip.tripData = diffResult.updatedTripData;
        trip.markModified('tripData');
        
        // Save snapshot to history
        patchRecord.snapshot = snapshot;
        patchRecord.appliedAt = new Date();
        trip.markModified('companionSession');

        await trip.save();

        res.json({
            success: true,
            data: {
                tripData: trip.tripData,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/companion/:tripId/undo
 * Undo an applied patch
 */
router.post('/:tripId/undo', auth, async (req, res, next) => {
    try {
        const { patchId } = req.body;
        if (!patchId) return res.status(400).json({ success: false, message: 'patchId required' });

        const trip = await getTripAsOwner(req.params.tripId, req.userId);
        
        const snapshot = memory.getPatchSnapshot(trip, patchId);
        
        if (!snapshot) {
            return res.status(404).json({ success: false, message: 'Cannot undo this patch' });
        }

        // Restore snapshot
        trip.tripData = snapshot;
        trip.markModified('tripData');

        memory.markPatchUndone(trip, patchId);

        await trip.save();

        res.json({
            success: true,
            data: {
                tripData: trip.tripData,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/companion/:tripId/history
 * Get chat history for this trip
 */
router.get('/:tripId/history', auth, async (req, res, next) => {
    try {
        const trip = await getTripAsOwner(req.params.tripId, req.userId);
        const messages = memory.getRecentMessages(trip, 50);

        res.json({
            success: true,
            data: {
                messages,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
