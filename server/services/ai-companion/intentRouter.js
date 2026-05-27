const { classifyIntent: groqClassify } = require('./groqProvider');
const { buildClassificationPrompt } = require('./promptTemplates');
const { validateIntent, extractJSON } = require('./responseValidator');
const { withRetry } = require('./retryStrategy');

/**
 * Intent Router — Classifies user messages into actionable intents
 * Uses lightweight llama-3.1-8b-instant for fast classification
 */

/**
 * Classify a user message into a supported intent
 * @param {string} userMessage - The user's message
 * @param {Object} tripContext - Minimal trip context (destination, style, etc.)
 * @returns {Object} Classified intent { intent, targetDays, confidence, scope }
 */
async function routeIntent(userMessage, tripContext = {}) {
    const systemPrompt = buildClassificationPrompt();

    const contextHint = tripContext.destination
        ? `\nTrip: ${tripContext.destination}, ${tripContext.duration || '?'} days, ${tripContext.travelStyle || 'cultural'} style, ${tripContext.budget || 'moderate'} budget.`
        : '';

    const messages = [
        { role: 'system', content: systemPrompt },
        {
            role: 'user',
            content: `${contextHint}\n\nUser message: "${userMessage}"`,
        },
    ];

    // Attempt classification with retry
    const result = await withRetry(
        async () => {
            const rawResponse = await groqClassify(messages);
            const parsed = extractJSON(rawResponse);
            const validation = validateIntent(parsed);

            if (!validation.success) {
                throw new Error(`Intent validation failed: ${validation.error}`);
            }

            return validation.data;
        },
        { maxRetries: 2, timeoutMs: 10000 }
    );

    return result;
}

/**
 * Quick intent detection using keyword heuristics (fallback)
 * Used when Groq classification fails after retries
 * @param {string} message - User message
 * @returns {Object} Basic intent classification
 */
function fallbackIntentDetection(message) {
    const msg = message.toLowerCase();

    const KEYWORD_MAP = [
        { keywords: ['budget', 'cheap', 'expensive', 'cost', 'save', 'afford'], intent: 'budget_reduce' },
        { keywords: ['food', 'eat', 'restaurant', 'cuisine', 'local food', 'dish', 'café', 'cafe'], intent: 'food_addition' },
        { keywords: ['romantic', 'romance', 'couple', 'date', 'intimate', 'sunset'], intent: 'romantic_upgrade' },
        { keywords: ['nightlife', 'bar', 'club', 'pub', 'night out', 'party'], intent: 'nightlife_addition' },
        { keywords: ['hidden', 'secret', 'off-beat', 'offbeat', 'underrated', 'local spot'], intent: 'hidden_gems' },
        { keywords: ['adventure', 'trek', 'hike', 'sport', 'thrill', 'adrenaline', 'paraglid'], intent: 'adventure_upgrade' },
        { keywords: ['walk', 'walking', 'tired', 'legs', 'footsteps'], intent: 'walking_reduction' },
        { keywords: ['hectic', 'fatigue', 'exhausting', 'too much', 'overwhelming', 'packed', 'crowded schedule'], intent: 'travel_fatigue_reduce' },
        { keywords: ['relax', 'relaxing', 'calm', 'peaceful', 'slow', 'easy', 'chill'], intent: 'pace_optimization' },
        { keywords: ['luxury', 'premium', 'upscale', 'vip', 'five star', '5 star', 'high end'], intent: 'luxury_upgrade' },
        { keywords: ['culture', 'cultural', 'museum', 'heritage', 'history', 'art', 'tradition'], intent: 'cultural_experience' },
        { keywords: ['route', 'optimize', 'efficient', 'order', 'sequence', 'backtrack'], intent: 'route_optimization' },
        { keywords: ['replace', 'swap', 'change', 'instead', 'switch'], intent: 'activity_replace' },
        { keywords: ['shorten', 'fewer days', 'less days', 'cut'], intent: 'trip_shortening' },
        { keywords: ['extend', 'more days', 'extra day', 'add day'], intent: 'trip_extension' },
    ];

    // Extract target day numbers from message
    const dayMatch = msg.match(/day\s*(\d+)/gi);
    const targetDays = dayMatch
        ? dayMatch.map((m) => parseInt(m.replace(/day\s*/i, ''))).filter((n) => n > 0 && n <= 30)
        : [];

    for (const { keywords, intent } of KEYWORD_MAP) {
        if (keywords.some((kw) => msg.includes(kw))) {
            return {
                intent,
                targetDays,
                confidence: 0.6,
                scope: targetDays.length === 0 ? 'full_trip' : targetDays.length === 1 ? 'single_day' : 'multi_day',
            };
        }
    }

    return {
        intent: 'general_trip_refinement',
        targetDays,
        confidence: 0.4,
        scope: targetDays.length === 0 ? 'full_trip' : 'single_day',
    };
}

module.exports = {
    routeIntent,
    fallbackIntentDetection,
};
