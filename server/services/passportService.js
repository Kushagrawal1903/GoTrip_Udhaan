const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Stamp color palette — warm, muted, premium
const STAMP_COLORS = [
    '#8b2500', '#1a3a5c', '#2d5016', '#5c3a1e', '#3d1a5c',
    '#5c1a3a', '#1a4a4a', '#4a3a1a', '#2a1a4a', '#4a1a2a',
];

/**
 * Generate passport content for all trips using Gemini AI.
 * Returns: { memories[], travelPersonality, reflectionSummary }
 */
async function generatePassportContent(trips, userName) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build trip summaries for context
    const tripSummaries = trips.map((trip, i) => {
        const itinerary = trip.tripData?.itinerary || [];
        const highlights = itinerary
            .flatMap(day => (day.activities || []).map(a => a.placeName).filter(Boolean))
            .slice(0, 8)
            .join(', ');
        const hotels = (trip.tripData?.hotels || []).map(h => h.name).filter(Boolean).join(', ');
        
        return `Trip ${i + 1}: ${trip.destination} | ${trip.duration} days | Style: ${trip.travelStyle} | Budget: ${trip.budget} | Hotel: ${hotels || 'N/A'} | Key places: ${highlights || 'N/A'} | Date: ${trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}`;
    }).join('\n');

    const prompt = `You are a premium travel editorial writer creating deeply personal memory content for a travel passport keepsake.

TRAVELER: ${userName}
TRIPS:
${tripSummaries}

Generate a JSON response with this EXACT structure:

{
  "memories": [
    {
      "tripIndex": 0,
      "memoryCapsule": "2-3 sentence sensory editorial paragraph about this specific trip",
      "memoryMood": {
        "emoji": "single emoji",
        "label": "2-3 word emotional label"
      },
      "favoriteExperience": "Best single activity/place from the trip",
      "isCoreMemory": false
    }
  ],
  "travelPersonality": {
    "emoji": "single emoji",
    "label": "2-3 word personality label",
    "emotionalTone": "single word",
    "description": "1 sentence about their travel soul"
  },
  "reflectionSummary": "2-3 sentence warm closing reflection about their entire travel journey so far"
}

CRITICAL WRITING RULES:
- NEVER use these words: beautiful, magical, unforgettable, breathtaking, amazing, wonderful, incredible, spectacular, stunning, memorable, remarkable, extraordinary
- Memory capsules MUST be place-specific and sensory (sounds, textures, light, temperature, scents)
- Write like a premium travel editorial (Condé Nast Traveler tone), NOT like generic AI
- Each memory capsule must feel unique — no two should have similar structure or openings
- Keep capsules concise: exactly 2-3 sentences, no more
- Favorite experience: pick the SINGLE most emotionally resonant activity, not generic
- Memory mood labels: use specific emotional tones (e.g., "Romantic Escape", "Slow Coastal Serenity", "Cultural Discovery", "Adventure Rush", "Quiet Renewal")
- Travel personality: be specific and warm, not generic (e.g., "Explorer Soul", "Slow Luxury Traveler", "Curious Wanderer")
- Mark isCoreMemory: true ONLY for the single most emotionally significant trip (dream destination, longest trip, or most unique). Maximum 1 core memory.
- Reflection summary: warm, nostalgic, forward-looking. NOT generic motivational.

EXAMPLE of GOOD memory capsule:
"Early mornings beside Lake Lucerne and slow alpine train rides gave the journey a quiet cinematic rhythm. The crisp mountain air carried the scent of pine and fresh snow, making every viewpoint feel earned."

EXAMPLE of BAD memory capsule:
"Switzerland was a beautiful and magical destination with unforgettable memories."

Return ONLY valid JSON. No markdown, no code fences.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Clean potential markdown fences
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        
        // Assign stamp colors
        const memories = (parsed.memories || []).map((mem, i) => ({
            ...mem,
            stampColor: STAMP_COLORS[i % STAMP_COLORS.length],
        }));

        return {
            memories,
            travelPersonality: parsed.travelPersonality || null,
            reflectionSummary: parsed.reflectionSummary || '',
        };
    } catch (err) {
        console.error('[PASSPORT] Gemini generation failed:', err.message);
        
        // Return sensible fallbacks
        return {
            memories: trips.map((trip, i) => ({
                tripIndex: i,
                memoryCapsule: `${trip.duration} days exploring ${trip.destination} — a journey worth holding onto.`,
                memoryMood: { emoji: '✨', label: 'Personal Journey' },
                favoriteExperience: trip.destination,
                isCoreMemory: false,
                stampColor: STAMP_COLORS[i % STAMP_COLORS.length],
            })),
            travelPersonality: {
                emoji: '🌍',
                label: 'Curious Traveler',
                emotionalTone: 'exploratory',
                description: 'Every trip adds a new chapter to your story.',
            },
            reflectionSummary: `${trips.length} journeys and counting — each one a thread in the fabric of who you are becoming.`,
        };
    }
}

module.exports = { generatePassportContent };
