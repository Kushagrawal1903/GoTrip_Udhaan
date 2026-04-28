const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Budget tier descriptions for prompt engineering
 * All costs in Indian Rupees (₹)
 */
const BUDGET_TIERS = {
  low: {
    label: 'Budget-Friendly',
    hotels: 'Budget hotels, hostels, guesthouses (₹800-2,500/night)',
    transport: 'Public transport, shared cabs, buses, economy trains',
    food: 'Street food, local eateries, budget restaurants (₹150-500/meal)',
    activities: 'Free attractions, walking tours, public beaches, local markets',
  },
  moderate: {
    label: 'Mid-Range',
    hotels: '3-star hotels, boutique stays (₹3,000-8,000/night)',
    transport: 'Mix of public and private transport, AC trains, domestic flights',
    food: 'Mid-range restaurants, cafes, occasional fine dining (₹500-1,500/meal)',
    activities: 'Paid attractions, guided tours, adventure sports, cultural shows',
  },
  premium: {
    label: 'Luxury / Premium',
    hotels: '4-5 star hotels, luxury resorts, premium villas (₹10,000-40,000+/night)',
    transport: 'Private cars, business class flights, luxury transfers',
    food: 'Fine dining, award-winning restaurants, gourmet experiences (₹2,000-6,000+/meal)',
    activities: 'Private tours, exclusive experiences, spa treatments, VIP access',
  },
};

/**
 * Travel style descriptions for prompt engineering
 */
const TRAVEL_STYLES = {
  adventure: 'Focus on adventure activities like hiking, trekking, water sports, paragliding, camping, and outdoor exploration.',
  relaxation: 'Focus on relaxation — spa treatments, beach lounging, scenic walks, yoga retreats, and peaceful environments.',
  cultural: 'Focus on cultural immersion — museums, historical sites, local festivals, art galleries, traditional performances, and heritage walks.',
  family: 'Focus on family-friendly activities — theme parks, zoos, easy hikes, interactive museums, kid-friendly restaurants, and safe areas.',
  romantic: 'Focus on romantic experiences — sunset views, couples spa, candlelight dinners, scenic boat rides, private tours, and intimate settings.',
};

/**
 * Build the prompt for Gemini AI
 * @param {Object} params - Trip parameters
 * @returns {string} Formatted prompt
 */
function buildPrompt({ destination, duration, budget, travelStyle, travelers = 1 }) {
  const budgetInfo = BUDGET_TIERS[budget];
  const styleInfo = TRAVEL_STYLES[travelStyle];

  return `You are a world-class professional travel planner AI. You MUST generate extremely detailed, comprehensive, and long travel itineraries. Do NOT be brief. Do NOT use short one-line descriptions. Every field must be richly detailed with multiple sentences.

CRITICAL RULES:
- You MUST write LONG, DETAILED descriptions everywhere. Minimum 2-3 sentences per description field.
- You MUST include AT LEAST 4 activities per day (Morning, Afternoon, Evening, Night).
- You MUST include AT LEAST 5 useful travel tips.
- You MUST provide transport suggestions as BULLET POINTS (use • separator) with specific airline names, train numbers, bus operators, and approximate costs.
- Each hotel description MUST be concise — maximum 1-2 sentences covering location and key amenity highlights. Do NOT write long paragraphs for hotels.
- Each activity description MUST be at least 2 sentences explaining what to do there, why it is worth visiting, and any historical or cultural significance.
- Each meal recommendation MUST include the restaurant name, a signature dish, and the price.
- ALL costs MUST be in Indian Rupees (₹) with realistic pricing.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${duration} days
- Number of Travelers: ${travelers}
- Budget Category: ${budgetInfo.label}
- Travel Style: ${travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)}

BUDGET GUIDELINES:
- Accommodation: ${budgetInfo.hotels}
- Transport: ${budgetInfo.transport}
- Food: ${budgetInfo.food}
- Activities: ${budgetInfo.activities}

TRAVEL STYLE FOCUS:
${styleInfo}

DETAILED INSTRUCTIONS:
1. Create a DETAILED day-by-day itinerary for ALL ${duration} days for ${travelers} traveler(s). Each day MUST have 4 activities (Morning, Afternoon, Evening, Night) with rich descriptions.
2. Include exactly 3 real hotel recommendations with actual hotel names that exist in ${destination}. Each hotel must have a SHORT, concise description (1-2 sentences max) mentioning location and top amenities.
3. Provide a realistic total budget breakdown for ALL ${travelers} traveler(s). Hotels are per-room pricing, but food and activities costs should be multiplied by number of travelers.
4. Include Google Maps search links for each hotel using format: https://www.google.com/maps/search/Hotel+Name+${encodeURIComponent(destination)}
5. Provide transport suggestions as BULLET POINTS separated by • character — mention specific airlines, train names, bus operators, and costs in ₹. Example format: "• Flight: IndiGo/Air India from Delhi — ₹3,500-5,000 • Train: Shatabdi Express #12001 — ₹800-1,500 • Bus: RSRTC Volvo — ₹600-900"
6. For each hotel, provide an "imageQuery" field with a descriptive search query (e.g., "Taj Lake Palace Udaipur exterior view").
7. For EVERY activity, include "placeName" and "mapsLink" (Google Maps search URL). This is CRITICAL.
8. Include at least 5 detailed travel tips specific to ${destination}, each tip being a full sentence with actionable advice.

OUTPUT FORMAT:
Respond ONLY with valid JSON. No markdown, no code blocks, no explanations before or after. Just pure JSON in this exact structure:
{
  "destination": "${destination}",
  "duration": ${duration},
  "travelers": ${travelers},
  "budgetCategory": "${budget}",
  "totalEstimatedBudget": "₹XX,XXX - ₹XX,XXX (detailed range for ${travelers} traveler(s) for ${duration} days)",
  "budgetBreakdown": {
    "stay": "₹XX,XXX (total for ${duration} nights)",
    "transport": "₹XX,XXX (including travel to destination and local transport)",
    "food": "₹XX,XXX (all meals for ${travelers} traveler(s) for ${duration} days)",
    "activities": "₹XX,XXX (entry fees, tours, experiences for ${travelers} traveler(s))"
  },
  "transportSuggestions": {
    "reachingDestination": "• Flight: Airline Name from City — ₹X,XXX • Train: Train Name/Number — ₹XXX-₹X,XXX • Bus: Operator Name — ₹XXX-₹XXX",
    "localTransport": "• Auto-rickshaw: ₹XX per km • Taxi apps: Ola/Uber available, ₹XX per km • Bike rental: ₹XXX-₹XXX per day • Local bus: ₹XX per ride"
  },
  "hotels": [
    {
      "name": "Actual Real Hotel Name in ${destination}",
      "priceRange": "₹X,XXX - ₹X,XXX per night",
      "rating": 4.5,
      "mapsLink": "https://www.google.com/maps/search/Hotel+Name+${encodeURIComponent(destination)}",
      "description": "Concise 1-2 sentence description: location highlight and top amenities (pool, spa, restaurant, etc).",
      "imageQuery": "Hotel Name ${destination} exterior view"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "A Creative and Descriptive Day Title",
      "activities": [
        {
          "time": "Morning",
          "activity": "A detailed 2-3 sentence description of what to do at this place. Include what you will see, why it is famous, and any tips for visiting. Make it engaging and informative.",
          "placeName": "Full Name of the Place or Attraction",
          "mapsLink": "https://www.google.com/maps/search/Place+Name+${encodeURIComponent(destination)}",
          "estimatedCost": "₹XXX per person"
        },
        {
          "time": "Afternoon",
          "activity": "Another detailed activity description...",
          "placeName": "Place Name",
          "mapsLink": "https://www.google.com/maps/search/...",
          "estimatedCost": "₹XXX per person"
        },
        {
          "time": "Evening",
          "activity": "Another detailed activity description...",
          "placeName": "Place Name",
          "mapsLink": "https://www.google.com/maps/search/...",
          "estimatedCost": "₹XXX per person"
        },
        {
          "time": "Night",
          "activity": "Another detailed activity description...",
          "placeName": "Place Name",
          "mapsLink": "https://www.google.com/maps/search/...",
          "estimatedCost": "₹XXX per person"
        }
      ],
      "meals": {
        "breakfast": "Restaurant Name — try their famous Dish Name — ₹XXX per person",
        "lunch": "Restaurant Name — known for Dish Name — ₹XXX per person",
        "dinner": "Restaurant Name — must-try Dish Name — ₹XXX per person"
      },
      "estimatedDayCost": "₹X,XXX"
    }
  ],
  "tips": ["Tip 1: A full detailed sentence with actionable travel advice", "Tip 2: ...", "Tip 3: ...", "Tip 4: ...", "Tip 5: ..."]
}

REMEMBER: Be EXTREMELY detailed and verbose. Every description must be multiple sentences. Do NOT abbreviate or shorten anything. Generate content for ALL ${duration} days.`;
}

/**
 * Clean and extract valid JSON from raw AI response text.
 * Handles markdown fences, trailing commas, and truncated output.
 */
function extractJSON(raw) {
  // Strip markdown code fences
  let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  // Find the outermost JSON object
  const start = text.indexOf('{');
  if (start === -1) throw new SyntaxError('No JSON object found in response');
  text = text.slice(start);

  // Try parsing as-is first
  try {
    return JSON.parse(text);
  } catch (_) {
    // Fix common issues: trailing commas before } or ]
    text = text.replace(/,\s*([\]}])/g, '$1');

    // If JSON is truncated (model ran out of tokens), try to close it
    let openBraces = 0, openBrackets = 0;
    for (const ch of text) {
      if (ch === '{') openBraces++;
      else if (ch === '}') openBraces--;
      else if (ch === '[') openBrackets++;
      else if (ch === ']') openBrackets--;
    }

    // Remove any trailing incomplete key-value pair after the last complete value
    text = text.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"{}[\]]*$/, '');

    while (openBrackets > 0) { text += ']'; openBrackets--; }
    while (openBraces > 0) { text += '}'; openBraces--; }

    return JSON.parse(text);
  }
}

/**
 * Generate a travel itinerary using Google Gemini AI
 * @param {Object} params - Trip input parameters
 * @returns {Object} Parsed trip data as JSON
 */
async function generateTrip({ destination, duration, budget, travelStyle, travelers = 1 }) {
  const MAX_RETRIES = 2;

  const model = genAI.getGenerativeModel({
    model: 'gemma-3-4b-it',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
    },
  });

  const prompt = buildPrompt({ destination, duration, budget, travelStyle, travelers });

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tripData = extractJSON(text);
      return tripData;
    } catch (error) {
      lastError = error;
      console.error(`Gemini API attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

      if (error.message.includes('API_KEY')) {
        throw new Error('Invalid or missing Gemini API key. Please check your .env file.');
      }

      // Only retry on JSON parse errors
      if (!(error instanceof SyntaxError) && !error.message.includes('JSON')) {
        throw new Error(`Failed to generate trip: ${error.message}`);
      }
    }
  }

  throw new Error('AI returned an invalid response after multiple attempts. Please try again.');
}

module.exports = { generateTrip };
