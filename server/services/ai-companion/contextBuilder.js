/**
 * Context Builder — Intelligent context compression
 * Only sends relevant days to the AI model, not the full trip.
 * Faster, cheaper, more accurate.
 */

/**
 * Build compressed context for the AI model
 * @param {Object} trip - Full trip document from MongoDB
 * @param {Object} intentData - Classified intent with targetDays
 * @param {Object} sessionData - Companion session data (preferences, history)
 * @returns {Object} Compressed context object
 */
function buildContext(trip, intentData, sessionData = {}) {
    const tripData = trip.tripData;
    const itinerary = tripData?.itinerary || [];
    const targetDays = intentData.targetDays || [];

    // Determine which days to include
    const relevantDayIndices = getRelevantDayIndices(targetDays, itinerary.length, intentData.scope);

    // Extract relevant days with full detail
    const relevantDays = relevantDayIndices.map((idx) => {
        const day = itinerary[idx];
        if (!day) return null;
        return {
            day: day.day || idx + 1,
            title: day.title || '',
            narrative: day.narrative || '',
            activities: (day.activities || []).map((a) => ({
                time: a.time || '',
                placeName: a.placeName || '',
                activity: a.activity || '',
                estimatedCost: a.estimatedCost || '',
                mapsLink: a.mapsLink || '',
            })),
            meals: day.meals || {},
            estimatedDayCost: day.estimatedDayCost || '',
        };
    }).filter(Boolean);

    // Extract hotel info (lightweight)
    const hotels = (tripData.hotels || []).map((h) => ({
        name: h.name,
        priceRange: h.priceRange,
        rating: h.rating,
    }));

    // Build trip metadata
    const tripMeta = {
        destination: trip.destination || tripData.destination || 'Unknown',
        duration: trip.duration || tripData.duration || itinerary.length,
        budget: trip.budget || tripData.budgetCategory || 'moderate',
        travelStyle: trip.travelStyle || 'cultural',
        travelers: typeof trip.travelers === 'number'
            ? trip.travelers
            : Array.isArray(trip.travelers) ? trip.travelers.length : 1,
    };

    // Build previous preferences from session
    const previousPreferences = buildPreferenceString(sessionData);

    return {
        tripMeta,
        relevantDays,
        hotels,
        previousPreferences,
        totalBudget: tripData.totalEstimatedBudget || null,
        budgetBreakdown: tripData.budgetBreakdown || null,
    };
}

/**
 * Determine which day indices to include in context
 * Includes target days + adjacent days for context
 * @param {number[]} targetDays - 1-indexed target days
 * @param {number} totalDays - Total number of days
 * @param {string} scope - 'single_day', 'multi_day', or 'full_trip'
 * @returns {number[]} 0-indexed day indices
 */
function getRelevantDayIndices(targetDays, totalDays, scope) {
    if (scope === 'full_trip' || targetDays.length === 0) {
        // For full trip scope or unspecified days, include all (but cap at 7 for token efficiency)
        const maxDays = Math.min(totalDays, 7);
        return Array.from({ length: maxDays }, (_, i) => i);
    }

    const indices = new Set();

    for (const day of targetDays) {
        const idx = day - 1; // Convert to 0-indexed
        if (idx >= 0 && idx < totalDays) {
            indices.add(idx);
            // Add adjacent days for context
            if (idx > 0) indices.add(idx - 1);
            if (idx < totalDays - 1) indices.add(idx + 1);
        }
    }

    return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Build a natural language string from accumulated user preferences
 * @param {Object} sessionData - Session data with preferences
 * @returns {string|null} Preference summary or null
 */
function buildPreferenceString(sessionData) {
    if (!sessionData || !sessionData.userPreferences) return null;

    const prefs = sessionData.userPreferences;
    const parts = [];

    if (prefs.pacePreference) parts.push(`Prefers ${prefs.pacePreference} pace`);
    if (prefs.budgetDirection) parts.push(`Wants to ${prefs.budgetDirection} budget`);
    if (prefs.foodPreference) parts.push(`Likes ${prefs.foodPreference} food`);
    if (prefs.activityPreference) parts.push(`Prefers ${prefs.activityPreference} activities`);
    if (prefs.moodPreference) parts.push(`Looking for ${prefs.moodPreference} vibe`);

    if (prefs.avoidances && prefs.avoidances.length > 0) {
        parts.push(`Avoids: ${prefs.avoidances.join(', ')}`);
    }

    return parts.length > 0 ? parts.join('. ') + '.' : null;
}

/**
 * Update user preferences based on a classified intent
 * @param {Object} currentPrefs - Current preferences object
 * @param {string} intent - Classified intent
 * @returns {Object} Updated preferences
 */
function updatePreferences(currentPrefs = {}, intent) {
    const updated = { ...currentPrefs };

    const PREFERENCE_MAP = {
        pace_optimization: { pacePreference: 'relaxed' },
        budget_reduce: { budgetDirection: 'reduce' },
        food_addition: { foodPreference: 'local authentic' },
        romantic_upgrade: { moodPreference: 'romantic' },
        adventure_upgrade: { activityPreference: 'adventure' },
        walking_reduction: { pacePreference: 'low-walking' },
        travel_fatigue_reduce: { pacePreference: 'easy-going' },
        luxury_upgrade: { budgetDirection: 'upgrade' },
        cultural_experience: { activityPreference: 'cultural' },
        hidden_gems: { activityPreference: 'off-beaten-path' },
        nightlife_addition: { moodPreference: 'nightlife' },
    };

    const mapping = PREFERENCE_MAP[intent];
    if (mapping) {
        Object.assign(updated, mapping);
    }

    return updated;
}

module.exports = {
    buildContext,
    getRelevantDayIndices,
    buildPreferenceString,
    updatePreferences,
};
