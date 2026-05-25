const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Clean and extract valid JSON from raw AI response text.
 * Handles markdown fences, trailing commas, and truncated output.
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
 * Prompt Builder for Travel Recommendations
 */
const buildTravelRecommendationsPrompt = (trip, travelers, optimizeFor) => `
You are a travel logistics expert for Indian and international travel. Generate realistic travel recommendations.

Trip details:
- Destination: ${trip.destination}
- Trip start: Day 1 of the itinerary
- Optimize for: ${optimizeFor}
- Number of travelers needing recommendations: ${travelers.length}

Travelers:
${travelers.map(t => `- ${t.name}, traveling from: ${t.origin}`).join('\n')}

For EACH traveler, provide 2-3 realistic travel options (flight, train, bus — whichever are actually viable for this route). Use real knowledge of:
- Indian Railways routes and approximate 2024-2025 fares
- IndiGo/Air India/SpiceJet approximate domestic fares
- RedBus/KSRTC/state bus approximate fares
- International routes where applicable (Emirates, Air India international, etc.)

Mark your cost and time estimates as approximate. Be realistic — if a direct flight doesn't exist on a route, don't suggest one.
If a traveler's origin is exactly the same as the destination, provide a single alternative mode like "local" or "car" and set details to "Already in ${trip.destination}. Suggest local transport."

Also generate a meeting plan for the group: suggest when everyone should aim to arrive, where to meet (airport, station, or hotel), and any coordination notes.

Return ONLY valid JSON in this exact structure — no markdown, no explanation:
{
  "recommendations": [
    {
      "travelerId": "string — match the traveler id",
      "travelerName": "string",
      "origin": "string",
      "destination": "${trip.destination}",
      "options": [
        {
          "mode": "flight|train|bus|car|mixed",
          "label": "Short label e.g. IndiGo / Air India",
          "estimatedCost": "₹4,500 approx",
          "estimatedDuration": "2h 20m",
          "recommendation": "fastest|cheapest|balanced|comfort",
          "details": "One sentence describing the option — e.g. Direct flight, departs early morning, arrives before noon",
          "bookingHint": "One sentence — e.g. Book on MakeMyTrip or IndiGo app, prices vary by date"
        }
      ],
      "recommendedOption": "mode of the top recommended option matching the optimize-for setting"
    }
  ],
  "meetingPlan": {
    "suggestedArrivalWindow": "e.g. By 3:00 PM on Day 0",
    "meetPoint": "e.g. Goa Airport (GOI) Terminal 1",
    "meetPointType": "airport|station|hotel|city_center",
    "coordinationNotes": "2-3 sentences of practical coordination advice for the group",
    "travelersWithArrivals": [
      {
        "travelerId": "string",
        "travelerName": "string",
        "estimatedArrival": "e.g. 2:40 PM",
        "transportMode": "flight|train|bus|car"
      }
    ]
  }
}

Traveler IDs to use: ${JSON.stringify(travelers.map(t => ({ id: t.id, name: t.name })))}
`;

/**
 * Generate Travel Recommendations using Gemini 2.5 Flash
 */
async function generateTravelRecommendations(trip, travelersWithOrigins, optimizeFor = 'balanced') {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.2, // lower temperature for high strictness on JSON structure
            maxOutputTokens: 8192,
        },
    });

    const prompt = buildTravelRecommendationsPrompt(trip, travelersWithOrigins, optimizeFor);

    // Run within a Promise that respects a 30s timeout
    const apiCallPromise = (async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return extractJSON(text);
    })();

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API call timed out after 30 seconds')), 30000);
    });

    return Promise.race([apiCallPromise, timeoutPromise]);
}

module.exports = {
    generateTravelRecommendations
};
