const Trip = require('../../models/Trip');

/**
 * Conversation Memory — MongoDB-backed session management
 * Stores messages, intent history, patches, and user preferences per trip
 */

/**
 * Get or initialize a companion session for a trip (in-memory mutation)
 */
function getSession(trip) {
    if (!trip.companionSession) {
        trip.companionSession = {
            messages: [],
            intentHistory: [],
            patchHistory: [],
            userPreferences: {},
            contextMemory: {},
            lastActiveAt: new Date(),
        };
        trip.markModified('companionSession');
    }
    return trip.companionSession;
}

/**
 * Add a message to the companion session
 */
function addMessage(trip, role, content, intent = null, patchId = null) {
    const session = getSession(trip);

    session.messages.push({
        role,
        content,
        intent,
        patchId,
        timestamp: new Date(),
    });

    // Sliding window: keep last 20 messages
    if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
    }

    if (intent) {
        session.intentHistory.push(intent);
        // Keep last 50 intents
        if (session.intentHistory.length > 50) {
            session.intentHistory = session.intentHistory.slice(-50);
        }
    }

    session.lastActiveAt = new Date();
    trip.markModified('companionSession');
}

/**
 * Store a patch in history with snapshot for undo
 */
function storePatch(trip, patchId, intent, changes, snapshot) {
    const session = getSession(trip);

    session.patchHistory.push({
        patchId,
        intent,
        changes,
        appliedAt: new Date(),
        undoneAt: null,
        snapshot,
    });

    // Keep last 20 patches
    if (session.patchHistory.length > 20) {
        session.patchHistory = session.patchHistory.slice(-20);
    }

    trip.markModified('companionSession');
}

/**
 * Update user preferences in session
 */
function updateSessionPreferences(trip, preferences) {
    const session = getSession(trip);

    session.userPreferences = {
        ...session.userPreferences,
        ...preferences,
    };

    trip.markModified('companionSession');
}

/**
 * Get the snapshot for a specific patch (for undo)
 */
function getPatchSnapshot(trip, patchId) {
    if (!trip || !trip.companionSession) return null;
    const patch = trip.companionSession.patchHistory.find((p) => p.patchId === patchId);
    return patch ? patch.snapshot : null;
}

/**
 * Mark a patch as undone
 */
function markPatchUndone(trip, patchId) {
    if (!trip || !trip.companionSession) return;
    const patch = trip.companionSession.patchHistory.find((p) => p.patchId === patchId);
    if (patch) {
        patch.undoneAt = new Date();
        trip.markModified('companionSession');
    }
}

/**
 * Get recent messages for context (for the AI model)
 */
function getRecentMessages(trip, limit = 10) {
    if (!trip || !trip.companionSession) return [];
    return trip.companionSession.messages.slice(-limit);
}

module.exports = {
    getSession,
    addMessage,
    storePatch,
    updateSessionPreferences,
    getPatchSnapshot,
    markPatchUndone,
    getRecentMessages,
};
