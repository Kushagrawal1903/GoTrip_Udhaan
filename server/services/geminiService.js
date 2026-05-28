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
 * Trip Vibe Preference descriptions for prompt engineering.
 * Each vibe ID maps to AI-friendly guidance that shapes itinerary personality.
 */
const VIBE_DESCRIPTIONS = {
  slow_mornings: 'later morning starts (10AM+), fewer early activities, scenic breakfast spots, slower pacing until noon',
  relaxed_afternoons: 'unhurried afternoon experiences, scenic leisure spots, optional rest/downtime built in',
  calm_evenings: 'peaceful evening activities, gentle nighttime experiences, relaxing dinner settings',
  fast_paced: 'pack maximum activities per day, efficient routing between attractions, high-energy schedule',
  slow_travel: 'fewer locations visited slowly with deeper immersion, quality over quantity, linger at each spot',
  less_walking: 'minimize walking distances, prefer transport between locations, accessible and nearby venues',
  avoid_hectic: 'generous time gaps between activities, buffer time, no rushed transitions, breathing room',
  scenic_moments: 'prioritize visually stunning viewpoints, scenic routes, panoramic locations, photo opportunities',
  local_food: 'authentic local eateries, street food, regional cuisine specialties, food markets and food walks',
  cafe_hopping: 'scenic cafés, local coffee culture, artisan tea houses, cozy reading/relaxation spots',
  cultural: 'museums, heritage sites, local art scenes, traditional performances, historical walking tours',
  less_crowded: 'hidden gems over tourist hotspots, off-beat attractions, less touristy alternatives, quiet neighborhoods',
  quiet_spots: 'secluded places, peaceful corners, secret gardens, locals-only spots away from crowds',
  shopping: 'local markets, artisan shops, boutiques, souvenir shopping opportunities, craft bazaars',
  nightlife: 'vibrant evening entertainment, bars, live music venues, night markets, cultural evening shows',
  luxury: 'premium experiences, high-end dining, exclusive access, VIP treatments, luxury amenities',
  adventure: 'thrilling outdoor activities, sports, trekking, nature exploration, adrenaline experiences',
  leisure: 'spa sessions, pool time, beach lounging, slow reading spots, hammock/relaxation time',
  romantic: 'intimate settings, couples experiences, candlelight dining, scenic couple-friendly spots',
  cozy_evenings: 'warm intimate evening settings, fireside dining, sunset views from cozy venues, quiet nights',
  memorable: 'once-in-a-lifetime experiences, unique local activities, unforgettable signature moments',
  photogenic: 'instagram-worthy locations, architectural beauty, golden hour spots, scenic backdrops',
  sunset_sunrise: 'golden hour experiences, sunrise viewpoints, sunset watching locations, magic-hour activities',
  peaceful: 'serene environments, nature sounds, meditation-friendly spaces, low-noise tranquil areas',
  surprise_me: 'creatively balance the itinerary with unexpected hidden gems, unique local discoveries, and a fresh mix of experiences the traveler would not find on their own',
};

/**
 * Human-readable labels for vibe IDs (used in prompt text)
 */
const VIBE_LABELS = {
  slow_mornings: 'Slow Peaceful Mornings',
  relaxed_afternoons: 'Relaxed Afternoons',
  calm_evenings: 'Calm Evenings',
  fast_paced: 'Fast-Paced Exploration',
  slow_travel: 'Slow Travel Pace',
  less_walking: 'Less Walking',
  avoid_hectic: 'Avoid Hectic Days',
  scenic_moments: 'Scenic Moments',
  local_food: 'More Local Food',
  cafe_hopping: 'Café Hopping',
  cultural: 'Cultural Experiences',
  less_crowded: 'Less Crowded Places',
  quiet_spots: 'Quiet Hidden Spots',
  shopping: 'Shopping Friendly',
  nightlife: 'Nightlife Energy',
  luxury: 'Luxury Experiences',
  adventure: 'Adventure-Filled Days',
  leisure: 'Leisure & Relaxation',
  romantic: 'Romantic Atmosphere',
  cozy_evenings: 'Cozy Evenings',
  memorable: 'Memorable Experiences',
  photogenic: 'Photogenic Places',
  sunset_sunrise: 'Sunset/Sunrise Moments',
  peaceful: 'Peaceful Environment',
  surprise_me: 'Surprise Me',
};

/**
 * Build the prompt for Gemini AI
 * @param {Object} params - Trip parameters
 * @returns {string} Formatted prompt
 */
function buildPrompt({ destination, duration, budget, travelStyle, travelers = 1, travelersArray = [], hasOrigins = false, optimizeFor = 'balanced', selectedVibes = [], customTripIntent = '' }) {
  const budgetInfo = BUDGET_TIERS[budget];
  const styleInfo = TRAVEL_STYLES[travelStyle];

  const promptText = `You are a world-class professional travel planner AI. You must generate structured travel itineraries in JSON format.

CRITICAL RULES:
- BE EXTREMELY BRIEF. Keep descriptions to a maximum of 5-10 words. Use short phrases, NOT full sentences.
- You MUST include AT LEAST 4 activities per day (Morning, Afternoon, Evening, Night).
- You MUST include AT LEAST 5 useful travel tips.
- You MUST provide transport suggestions as BULLET POINTS (use • separator) with approximate costs.
- Each hotel description MUST be extremely short — maximum 5-10 words.
- Each activity description MUST be 5-10 words max explaining what to do.
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
9. Write a "narrativeParagraph" — a vivid, editorial 2-3 sentence paragraph (40-60 words) about what makes ${destination} special. Write as a travel writer, with sensory details. NOT generic tourism copy. Example: "Indore does not reveal itself to the passive observer. It demands dirt on your boots and a willingness to navigate midnight crowds for charcoal-roasted street delicacies."
10. Write a "wowMoment" — the single most unforgettable experience in ${destination}. Include a vivid title, a 2-3 sentence sensory description, and a reflective one-liner about why it matters.
11. For EACH day in the itinerary, include a "narrative" — a vivid, cinematic 2-sentence description (25-40 words) that paints what the traveler will experience that day. Write in second person ("you"). Example: "Scramble down slick wet rocks of Patalpani, where the air vibrates with the roar of falling water. The evening sun paints the valley a deep, bruised violet."
12. Write a "mustTryFood" recommendation — the most iconic, must-have local dish in ${destination}. Include the dish name, a short description, the best place/eatery to have it, and a maps link for that place.

OUTPUT FORMAT:
Respond ONLY with valid JSON. No markdown, no code blocks, no explanations before or after. Just pure JSON in this exact structure:
{
  "destination": "${destination}",
  "subtitle": "A poetic, cinematic 5-10 word subtitle capturing the essence of ${destination}",
  "narrativeParagraph": "A vivid 2-3 sentence editorial paragraph about what makes this destination special.",
  "wowMoment": {
    "title": "A short evocative title for the must-do experience",
    "description": "A vivid 2-3 sentence sensory description of the experience.",
    "reflection": "A single reflective sentence about why this moment matters."
  },
  "mustTryFood": {
    "dishName": "Name of the local dish (e.g. Chole Kulche)",
    "description": "Short description of the dish (max 10 words).",
    "bestPlaceToEat": "Name of the famous/best place to eat this",
    "mapsLink": "https://www.google.com/maps/search/Restaurant+Name+${encodeURIComponent(destination)}"
  },
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
      "description": "Short 5-10 word description.",
      "imageQuery": "Hotel Name ${destination} exterior view"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "A short 3-5 word Title",
      "narrative": "A vivid 2-sentence cinematic description of what this day feels like.",
      "activities": [
        {
          "time": "Morning",
          "activity": "Short 5-10 word description.",
          "placeName": "Full Name of the Place or Attraction",
          "mapsLink": "https://www.google.com/maps/search/Place+Name+${encodeURIComponent(destination)}",
          "estimatedCost": "₹XXX per person"
        },
        {
          "time": "Afternoon",
          "activity": "Short 5-10 word description.",
          "placeName": "Place Name",
          "mapsLink": "https://www.google.com/maps/search/...",
          "estimatedCost": "₹XXX per person"
        },
        {
          "time": "Evening",
          "activity": "Short 5-10 word description.",
          "placeName": "Place Name",
          "mapsLink": "https://www.google.com/maps/search/...",
          "estimatedCost": "₹XXX per person"
        },
        {
          "time": "Night",
          "activity": "Short 5-10 word description.",
          "placeName": "Place Name",
          "mapsLink": "https://www.google.com/maps/search/...",
          "estimatedCost": "₹XXX per person"
        }
      ],
      "meals": {
        "breakfast": "Restaurant Name — ₹XXX per person",
        "lunch": "Restaurant Name — ₹XXX per person",
        "dinner": "Restaurant Name — ₹XXX per person"
      },
      "estimatedDayCost": "₹X,XXX"
    }
  ],
  "tips": ["Tip 1: Short actionable advice (max 10 words).", "Tip 2: ...", "Tip 3: ...", "Tip 4: ...", "Tip 5: ..."]
}

REMEMBER: Be extremely brief for activity descriptions (5-10 words). But write rich, sensory prose for narrativeParagraph, wowMoment, and day narratives. Generate content for ALL ${duration} days.`;

  // ─── Trip Vibe Preferences Section ──────────────────────────
  let vibeSection = '';
  if ((selectedVibes && selectedVibes.length > 0) || (customTripIntent && customTripIntent.trim())) {
    vibeSection = buildVibeSection(selectedVibes, customTripIntent);
  }

  let originSection = '';
  if (hasOrigins && travelersArray && travelersArray.length > 0) {
    const travelersWithOrigins = travelersArray.filter(t => t.origin && t.origin.trim());
    if (travelersWithOrigins.length > 0) {
      originSection = `

TRAVELER ORIGINS CONTEXT:
The group travelers are departing from the following cities:
${travelersWithOrigins.map(t => `- ${t.name} traveling from ${t.origin}`).join('\n')}

Use this context to ensure the itinerary duration, pacing, and arrival pacing are consistent. Do NOT output any travel logistics recommendations or extra text after the JSON object. Output ONLY the JSON block.`;
    }
  }

  return promptText + vibeSection + originSection;
}

/**
 * Build the Trip Vibe Preferences prompt section.
 * Uses a weighted priority system:
 *   1. Custom text + Surprise Me → strongest weight
 *   2. First 3 selected vibes → medium priority ("primary vibes")
 *   3. Remaining vibes → supporting signals
 * @param {string[]} selectedVibes - Ordered array of selected vibe IDs
 * @param {string} customTripIntent - Free-text emotional input
 * @returns {string} Prompt section
 */
function buildVibeSection(selectedVibes = [], customTripIntent = '') {
  if (selectedVibes.length === 0 && !customTripIntent.trim()) return '';

  let section = `

TRIP VIBE PREFERENCES (treat as weighted emotional priorities, NOT rigid rules):
The traveler wants their trip to FEEL a certain way. Shape the itinerary's pacing, activity selection, timing, and atmosphere accordingly.
`;

  if (selectedVibes.length > 0) {
    // Split into primary (first 3) and supporting (rest) for weighted priority
    const primaryVibes = selectedVibes.slice(0, 3);
    const supportingVibes = selectedVibes.slice(3);

    if (primaryVibes.length > 0) {
      section += `\nPRIMARY VIBES (highest priority — shape the core feel of each day):`;
      primaryVibes.forEach(vibeId => {
        const label = VIBE_LABELS[vibeId] || vibeId;
        const desc = VIBE_DESCRIPTIONS[vibeId] || '';
        section += `\n- ${label}: ${desc}`;
      });
    }

    if (supportingVibes.length > 0) {
      section += `\n\nSUPPORTING VIBES (secondary — weave in where natural):`;
      supportingVibes.forEach(vibeId => {
        const label = VIBE_LABELS[vibeId] || vibeId;
        const desc = VIBE_DESCRIPTIONS[vibeId] || '';
        section += `\n- ${label}: ${desc}`;
      });
    }
  }

  if (customTripIntent && customTripIntent.trim()) {
    section += `\n\nTRAVELER'S OWN WORDS (treat as highest priority intent):\n"${customTripIntent.trim()}"`;
  }

  section += `

CRITICAL VIBE RULES:
1. These are EMOTIONAL SIGNALS, not hard constraints. Adjust pacing, timing, and atmosphere — do NOT add artificial delays or waste time.
2. If vibes seem contradictory (e.g., Nightlife Energy + Slow Mornings), balance intelligently (e.g., schedule late morning starts on days after nightlife). NEVER reject or warn about contradictions.
3. SAFETY: The itinerary must ALWAYS remain practical, realistic, and travel-efficient. Vibes influence atmosphere, NOT logistics.
   - "Slow mornings" ≠ wasting half the day. It means a gentler start with scenic breakfast, not idle time.
   - "Adventure" ≠ exhausting unsafe schedule. It means thrilling but well-paced activities.
   - "Nightlife" ≠ unsafe areas. It means vibrant, popular evening spots.
   - "Luxury" ≠ budget-breaking. It means premium touches within the stated budget tier.
4. Vibes should make the trip feel EMOTIONALLY different, not structurally broken.`;

  return section;
}

/**
 * Clean and extract valid JSON from raw AI response text.
 * Handles markdown fences, trailing commas, and truncated output.
 */
function extractJSON(raw) {
  let text = raw.trim();

  // Find the first '{'
  const start = text.indexOf('{');
  if (start === -1) throw new SyntaxError('No JSON object found in response');
  
  // Find the matching closing brace '}' using brace balancing
  let braceCount = 0;
  let end = -1;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end !== -1) {
    text = text.substring(start, end + 1);
  } else {
    text = text.substring(start);
  }

  // Strip markdown code fences if they got inside (unlikely)
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

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
async function generateTrip({ destination, duration, budget, travelStyle, travelers = 1, travelersArray = [], hasOrigins = false, optimizeFor = 'balanced', selectedVibes = [], customTripIntent = '' }) {
  const MAX_RETRIES = 2;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
    },
  });

  const prompt = buildPrompt({ destination, duration, budget, travelStyle, travelers, travelersArray, hasOrigins, optimizeFor, selectedVibes, customTripIntent });

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
