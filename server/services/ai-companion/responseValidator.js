const { z } = require('zod');

/**
 * Response Validator — Zod-based validation for all AI responses
 * Never trust model output blindly. Validate everything.
 */

// ─── Intent Classification Schema ─────────────────────────────
const SUPPORTED_INTENTS = [
    'pace_optimization',
    'budget_reduce',
    'food_addition',
    'nightlife_addition',
    'romantic_upgrade',
    'hidden_gems',
    'adventure_upgrade',
    'walking_reduction',
    'activity_replace',
    'trip_shortening',
    'trip_extension',
    'travel_fatigue_reduce',
    'luxury_upgrade',
    'cultural_experience',
    'route_optimization',
    'general_trip_refinement',
];

const IntentSchema = z.object({
    intent: z.enum(SUPPORTED_INTENTS),
    targetDays: z.array(z.number().int().min(1).max(30)).optional().default([]),
    confidence: z.number().min(0).max(1).optional().default(0.8),
    scope: z.enum(['single_day', 'multi_day', 'full_trip']).optional().default('single_day'),
});

// ─── Individual Change Schema ──────────────────────────────────
const ChangeSchema = z.object({
    type: z.enum(['replace', 'add', 'remove', 'modify']),
    day: z.number().int().min(1).max(30),
    slot: z.string().optional(),
    remove: z.object({
        placeName: z.string().optional(),
        activity: z.string().optional(),
    }).optional(),
    add: z.object({
        placeName: z.string(),
        activity: z.string(),
        estimatedCost: z.string().optional(),
        mapsLink: z.string().optional(),
    }).optional(),
});

const PatchSchema = z.object({
    intent: z.string(),
    targetDays: z.array(z.number().int().min(1).max(30)).optional().default([]),
    changes: z.array(ChangeSchema).min(0).max(20),
    benefits: z.array(z.string()).min(0).max(8).optional(),
    summary: z.string().min(5).max(300),
    requiresClarification: z.boolean().optional().default(false),
});

/**
 * Validate an intent classification response
 * @param {string} rawJson - Raw JSON string from model
 * @returns {{ success: boolean, data?: Object, error?: string }}
 */
function validateIntent(rawJson) {
    try {
        const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        const result = IntentSchema.safeParse(parsed);

        if (result.success) {
            return { success: true, data: result.data };
        }

        return {
            success: false,
            error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        };
    } catch (err) {
        return { success: false, error: `JSON parse error: ${err.message}` };
    }
}

/**
 * Validate a patch response
 * @param {string} rawJson - Raw JSON string from model
 * @returns {{ success: boolean, data?: Object, error?: string }}
 */
function validatePatch(rawJson) {
    try {
        let parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

        // Handle models that wrap in a "patch" key
        if (parsed.patch && !parsed.changes) {
            parsed = parsed.patch;
        }

        const result = PatchSchema.safeParse(parsed);

        if (result.success) {
            return { success: true, data: result.data };
        }

        return {
            success: false,
            error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        };
    } catch (err) {
        return { success: false, error: `JSON parse error: ${err.message}` };
    }
}

/**
 * Extract JSON from raw model response text
 * Handles markdown fences, extra text, etc.
 */
function extractJSON(rawText) {
    let text = rawText.trim();

    // Remove markdown code fences
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');

    // Find the first { and matching }
    const start = text.indexOf('{');
    if (start === -1) throw new Error('No JSON object found in response');

    let braceCount = 0;
    let end = -1;
    let inString = false;
    let escaped = false;

    for (let i = start; i < text.length; i++) {
        const char = text[i];
        if (escaped) { escaped = false; continue; }
        if (char === '\\') { escaped = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') {
                braceCount--;
                if (braceCount === 0) { end = i; break; }
            }
        }
    }

    if (end !== -1) {
        text = text.substring(start, end + 1);
    } else {
        text = text.substring(start);
    }

    // Fix trailing commas
    text = text.replace(/,\s*([\]}])/g, '$1');

    return JSON.parse(text);
}

module.exports = {
    SUPPORTED_INTENTS,
    IntentSchema,
    ChangeSchema,
    PatchSchema,
    validateIntent,
    validatePatch,
    extractJSON,
};
