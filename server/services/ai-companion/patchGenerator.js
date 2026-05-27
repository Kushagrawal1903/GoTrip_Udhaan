const { generatePatch: groqPatch, generateComplexPatch: groqComplexPatch } = require('./groqProvider');
const { buildPatchPrompt } = require('./promptTemplates');
const { validatePatch, extractJSON } = require('./responseValidator');
const { withRetry, withFallbackChain } = require('./retryStrategy');

/**
 * Patch Generator — Creates surgical itinerary modifications
 */

const COMPLEX_INTENTS = [
    'route_optimization',
    'trip_shortening',
    'trip_extension',
    'travel_fatigue_reduce',
];

/**
 * Generate a validated patch for the given intent and context
 */
async function createPatch(intent, context, userMessage) {
    const systemPrompt = buildPatchPrompt(intent, context, userMessage);
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];

    const isComplex = COMPLEX_INTENTS.includes(intent);

    const patch = await withRetry(
        async () => {
            let rawResponse;
            if (isComplex) {
                rawResponse = await withFallbackChain([
                    () => groqComplexPatch(messages),
                    () => groqPatch(messages),
                ]);
            } else {
                rawResponse = await groqPatch(messages);
            }

            const parsed = extractJSON(rawResponse);
            const validation = validatePatch(parsed);
            if (!validation.success) {
                throw new Error(`Patch validation failed: ${validation.error}`);
            }
            return validation.data;
        },
        { maxRetries: 2, timeoutMs: isComplex ? 45000 : 30000 }
    );

    patch.targetDays = [...new Set(patch.changes.map((c) => c.day))].sort((a, b) => a - b);
    return patch;
}

function generatePatchId() {
    return `patch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

module.exports = { createPatch, generatePatchId, COMPLEX_INTENTS };
