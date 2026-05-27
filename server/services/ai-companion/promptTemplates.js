/**
 * Prompt Templates — Intent-specific prompt engineering
 * Each intent gets a specialized prompt, not one giant prompt.
 */

/**
 * System prompt for intent classification
 */
function buildClassificationPrompt() {
    return `You are an AI intent classifier for a travel itinerary companion.
Given a user message about their trip, classify the intent.

SUPPORTED INTENTS:
- pace_optimization: User wants to adjust pace (slow down, speed up)
- budget_reduce: User wants cheaper alternatives
- food_addition: User wants to add local food, restaurants, cafés
- nightlife_addition: User wants to add nightlife, bars, clubs
- romantic_upgrade: User wants romantic experiences added
- hidden_gems: User wants off-the-beaten-path spots
- adventure_upgrade: User wants adventure activities
- walking_reduction: User wants less walking
- activity_replace: User wants to swap a specific activity
- trip_shortening: User wants fewer days
- trip_extension: User wants more days
- travel_fatigue_reduce: User wants less hectic schedule
- luxury_upgrade: User wants more upscale experiences
- cultural_experience: User wants cultural immersion
- route_optimization: User wants better travel routes
- general_trip_refinement: Catch-all for other modifications

RULES:
- Return ONLY valid JSON
- Extract which days are affected (targetDays array, 1-indexed)
- If no specific day mentioned, return empty targetDays
- Set confidence between 0 and 1
- Set scope: "single_day", "multi_day", or "full_trip"

OUTPUT FORMAT:
{
  "intent": "intent_name",
  "targetDays": [2],
  "confidence": 0.95,
  "scope": "single_day"
}`;
}

/**
 * Build the patch generation prompt for a given intent
 * @param {string} intent - Classified intent
 * @param {Object} context - Compressed trip context
 * @param {string} userMessage - Original user message
 * @returns {string} System prompt
 */
function buildPatchPrompt(intent, context, userMessage) {
    const { destination, budget, travelStyle, duration, travelers } = context.tripMeta;
    const dayDescriptions = context.relevantDays
        .map((d) => {
            const activities = (d.activities || [])
                .map((a) => `  - ${a.time}: ${a.placeName || 'Unknown'} — ${a.activity || ''}`)
                .join('\n');
            const meals = d.meals
                ? Object.entries(d.meals)
                      .map(([k, v]) => `  - ${k}: ${v}`)
                      .join('\n')
                : '';
            return `Day ${d.day}: "${d.title || ''}"
${d.narrative || ''}
Activities:
${activities}
Meals:
${meals}
Estimated cost: ${d.estimatedDayCost || 'N/A'}`;
        })
        .join('\n\n');

    const intentInstructions = INTENT_INSTRUCTIONS[intent] || INTENT_INSTRUCTIONS.general_trip_refinement;

    return `You are GoTrip's AI Travel Companion — an intelligent travel co-pilot.
You help users MODIFY their existing trip itinerary. You NEVER regenerate the full itinerary.

CRITICAL RULES:
1. ONLY modify the specific parts relevant to the user's request
2. Return ONLY a patch with targeted changes — NOT a new itinerary
3. Keep changes minimal and surgical
4. Use REAL places and restaurants that exist in ${destination}
5. Respect the ${budget} budget tier
6. Match the ${travelStyle} travel style
7. All costs must be in Indian Rupees (₹)
8. Each activity description must be 5-10 words max
9. Each placeName must be a real, verifiable place

TRIP CONTEXT:
- Destination: ${destination}
- Duration: ${duration} days
- Budget: ${budget}
- Travel Style: ${travelStyle}
- Travelers: ${travelers}
${context.previousPreferences ? `\nUser's accumulated preferences: ${context.previousPreferences}` : ''}

CURRENT ITINERARY (relevant days only):
${dayDescriptions}

${context.hotels ? `HOTELS: ${context.hotels.map(h => h.name).join(', ')}` : ''}

INTENT: ${intent}
${intentInstructions}

USER REQUEST: "${userMessage}"

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "intent": "${intent}",
  "targetDays": [<affected day numbers, 1-indexed>],
  "changes": [
    {
      "type": "replace",
      "day": <day number 1-indexed>,
      "slot": "<morning|afternoon|evening|night>",
      "remove": {
        "placeName": "<current place name being replaced>",
        "activity": "<current activity description>"
      },
      "add": {
        "placeName": "<new real place name>",
        "activity": "<new 5-10 word description>",
        "estimatedCost": "₹XXX per person",
        "mapsLink": "https://www.google.com/maps/search/<Place+Name+${encodeURIComponent(destination)}>"
      }
    }
  ],
  "benefits": ["<benefit 1>", "<benefit 2>"],
  "summary": "<1-2 sentence summary of what changed and why>",
  "requiresClarification": false
}

If the user's request is ambiguous (e.g., "change the spa session" without specifying if they want a different location for a spa or a completely new type of activity like hiking), you MUST ask a clarifying question. Set "requiresClarification": true, leave "changes" empty [], and put your question in the "summary" field.

REMEMBER: Minimal, targeted changes only. Do NOT rewrite the entire day.`;
}

/**
 * Intent-specific instructions injected into the patch prompt
 */
const INTENT_INSTRUCTIONS = {
    pace_optimization: `
SPECIFIC INSTRUCTIONS:
- Reduce the number of activities if pace is too fast
- Add free time or rest periods
- Keep the best activities, remove rushed ones
- Consider travel time between locations`,

    budget_reduce: `
SPECIFIC INSTRUCTIONS:
- Replace expensive activities with cheaper/free alternatives
- Suggest budget-friendly restaurants instead of fine dining
- Keep the experience quality while reducing cost
- Show estimated savings in benefits`,

    food_addition: `
SPECIFIC INSTRUCTIONS:
- Add authentic local restaurants and street food spots
- Replace generic restaurants with locally famous ones
- Include specific dish recommendations
- Focus on REAL places known for local cuisine in this area`,

    nightlife_addition: `
SPECIFIC INSTRUCTIONS:
- Add bars, clubs, live music venues, or night markets
- Only modify evening/night slots
- Keep morning/afternoon activities unchanged
- Use real venues that exist in this destination`,

    romantic_upgrade: `
SPECIFIC INSTRUCTIONS:
- Add sunset spots, candlelight dining, scenic walks
- Replace generic activities with intimate experiences
- Focus on evening/night for romantic ambiance
- Include couples-friendly activities`,

    hidden_gems: `
SPECIFIC INSTRUCTIONS:
- Replace tourist-heavy spots with lesser-known alternatives
- Add local cafés, secret viewpoints, authentic neighborhoods
- Avoid mainstream attractions
- Include places locals actually visit`,

    adventure_upgrade: `
SPECIFIC INSTRUCTIONS:
- Add adventure activities: hiking, water sports, zip-lining, etc.
- Replace passive activities with active ones
- Consider fitness level and safety
- Include estimated difficulty/intensity`,

    walking_reduction: `
SPECIFIC INSTRUCTIONS:
- Replace walking-heavy activities with ones that have less walking
- Suggest cab/auto alternatives between spots
- Group nearby attractions to minimize transit
- Mention estimated walking reduction in benefits`,

    activity_replace: `
SPECIFIC INSTRUCTIONS:
- Replace the specific activity the user mentioned
- Find a suitable alternative that fits the same time slot
- Maintain budget and style consistency
- Keep surrounding activities unchanged`,

    travel_fatigue_reduce: `
SPECIFIC INSTRUCTIONS:
- Reduce number of activities on hectic days
- Add rest periods or café breaks
- Optimize route to minimize backtracking
- Group nearby attractions together`,

    luxury_upgrade: `
SPECIFIC INSTRUCTIONS:
- Replace budget/mid-range options with premium alternatives
- Add VIP experiences, fine dining, premium services
- Include high-end venues and exclusive experiences
- Update estimated costs accordingly`,

    cultural_experience: `
SPECIFIC INSTRUCTIONS:
- Add museums, heritage walks, local festivals, art galleries
- Include traditional performances or cultural shows
- Replace generic activities with culturally rich alternatives
- Focus on authentic cultural immersion`,

    route_optimization: `
SPECIFIC INSTRUCTIONS:
- Reorder activities within days to minimize travel time
- Group geographically close activities together
- Suggest optimal visiting sequence
- Mention time/distance savings in benefits`,

    general_trip_refinement: `
SPECIFIC INSTRUCTIONS:
- Make targeted improvements based on the user's specific request
- Keep changes minimal and relevant
- Maintain consistency with trip style and budget
- Explain reasoning in the summary`,

    trip_shortening: `
SPECIFIC INSTRUCTIONS:
- Identify the least essential day(s) to remove
- Redistribute must-see activities to remaining days
- Ensure the trip still feels complete
- Keep the best experiences intact`,

    trip_extension: `
SPECIFIC INSTRUCTIONS:
- Suggest additional day(s) with new activities
- Ensure new days match the existing trip's style and budget
- Add activities that complement what's already planned
- Consider travel fatigue when planning added days`,
};

module.exports = {
    buildClassificationPrompt,
    buildPatchPrompt,
    INTENT_INSTRUCTIONS,
};
