const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract all activity names from an itinerary for packing context
 * @param {Array} itinerary - The itinerary days array from trip data
 * @returns {string} Comma-separated list of activities
 */
function extractActivities(itinerary) {
    if (!itinerary || !Array.isArray(itinerary)) return 'General sightseeing';
    const activities = [];
    for (const day of itinerary) {
        if (day.activities && Array.isArray(day.activities)) {
            for (const act of day.activities) {
                if (act.activity) activities.push(act.activity);
                if (act.placeName) activities.push(act.placeName);
            }
        }
    }
    return activities.length > 0 ? activities.join(', ') : 'General sightseeing';
}

/**
 * Build the Gemini prompt for packing list generation
 */
function buildPackingPrompt({ destination, duration, travelers, style, itinerary }) {
    const activitiesList = extractActivities(itinerary);

    return `You are a professional travel packing advisor. Generate a comprehensive, personalized packing list for the following trip.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days
- Travelers: ${travelers} people
- Travel Style: ${style}
- Activities planned: ${activitiesList}

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation:
{
  "categories": [
    {
      "name": "Category Name",
      "icon": "emoji",
      "items": [
        {
          "name": "Item name",
          "quantity": 1,
          "essential": true,
          "note": "Optional short tip about this item"
        }
      ]
    }
  ],
  "weatherNote": "One sentence about what weather to expect and how it affects packing",
  "proTip": "One destination-specific insider packing tip"
}

Categories to include (always, in this order):
1. Documents & Money (passports, visas, cash, cards, travel insurance)
2. Clothing (adapt to climate and duration — be specific, e.g. "2 lightweight shirts" not just "shirts")
3. Footwear
4. Toiletries & Medicine
5. Electronics & Gadgets
6. Bags & Accessories
7. Activity-Specific Gear (based on the activities above — skip if none apply)
8. Snacks & Comfort (for travel days)

Rules:
- Scale quantities to the number of travelers and trip duration
- Mark truly essential items (without which the trip is impossible) as essential: true
- Be specific — not "clothes" but "1 warm jacket for evenings"
- Include destination-specific items (e.g. mosquito repellent for tropical, sunscreen for beach)
- Max 12 items per category
- ALL costs and currency references in Indian Rupees (₹)`;
}

/**
 * Clean and extract valid JSON from raw AI response text
 */
function extractJSON(raw) {
    let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const start = text.indexOf('{');
    if (start === -1) throw new SyntaxError('No JSON object found in response');
    text = text.slice(start);

    try {
        return JSON.parse(text);
    } catch (_) {
        text = text.replace(/,\s*([\]}])/g, '$1');
        let openBraces = 0, openBrackets = 0;
        for (const ch of text) {
            if (ch === '{') openBraces++;
            else if (ch === '}') openBraces--;
            else if (ch === '[') openBrackets++;
            else if (ch === ']') openBrackets--;
        }
        text = text.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"{}[\]]*$/, '');
        while (openBrackets > 0) { text += ']'; openBrackets--; }
        while (openBraces > 0) { text += '}'; openBraces--; }
        return JSON.parse(text);
    }
}

/**
 * Generate a packing list using Gemini AI
 * @param {Object} params - Trip parameters
 * @returns {Object} Parsed packing list as JSON
 */
async function generatePackingList({ destination, duration, travelers, style, itinerary }) {
    const MAX_RETRIES = 2;

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 8192,
        },
    });

    const prompt = buildPackingPrompt({ destination, duration, travelers, style, itinerary });

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const packingData = extractJSON(text);

            // Validate structure
            if (!packingData.categories || !Array.isArray(packingData.categories)) {
                throw new SyntaxError('Invalid packing list structure: missing categories array');
            }

            // Ensure all items have checked: false by default
            for (const category of packingData.categories) {
                if (category.items && Array.isArray(category.items)) {
                    category.items = category.items.map(item => ({
                        ...item,
                        checked: false,
                        quantity: item.quantity || 1,
                        essential: item.essential || false,
                        note: item.note || '',
                    }));
                }
            }

            return packingData;
        } catch (error) {
            lastError = error;
            if (error.message.includes('API_KEY')) {
                throw new Error('Invalid or missing Gemini API key.');
            }
            if (!(error instanceof SyntaxError) && !error.message.includes('JSON')) {
                throw new Error(`Failed to generate packing list: ${error.message}`);
            }
        }
    }
    throw new Error('AI returned an invalid packing list after multiple attempts. Please try again.');
}

module.exports = { generatePackingList };
