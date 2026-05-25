/**
 * Card helper utilities for cinematic shareable trip cards.
 * Pure functions — no React, no side effects.
 */

// ─── Destination Emoji ────────────────────────────────────────────

export const getDestinationEmoji = (destination) => {
  const dest = (destination || '').toLowerCase();
  if (/goa|beach|phuket|bali|maldives|andaman|lakshadweep|cancun|hawaii|miami/.test(dest)) return '🏖️';
  if (/manali|shimla|kashmir|mountain|himachal|ladakh|leh|mussoorie|darjeeling|ooty|swiss|alps/.test(dest)) return '🏔️';
  if (/rajasthan|jaipur|jodhpur|udaipur|fort|heritage|agra|varanasi/.test(dest)) return '🏯';
  if (/kerala|backwater|coorg|munnar|alleppey/.test(dest)) return '🌴';
  if (/paris|europe|london|switzerland|amsterdam|barcelona/.test(dest)) return '🗼';
  if (/japan|tokyo|kyoto|osaka/.test(dest)) return '⛩️';
  if (/dubai|desert|abu dhabi|qatar/.test(dest)) return '🌆';
  if (/wildlife|safari|forest|jim corbett|ranthambore/.test(dest)) return '🌿';
  if (/rome|italy|florence|greece|santorini/.test(dest)) return '🏛️';
  if (/new york|usa|america|los angeles|san francisco/.test(dest)) return '🗽';
  if (/thailand|bangkok|pattaya/.test(dest)) return '🛕';
  if (/singapore|hong kong|macau/.test(dest)) return '🏙️';
  return '✈️';
};

// ─── Destination Taglines ─────────────────────────────────────────

const DESTINATION_TAGLINES = {
  bali: 'Island of Gods',
  kerala: "God's Own Country",
  goa: 'Sun, Sand & Soul',
  rajasthan: 'Land of Kings',
  kashmir: 'Paradise on Earth',
  manali: 'Valley of the Gods',
  shimla: 'Queen of the Hills',
  ladakh: 'Land of High Passes',
  paris: 'City of Light',
  dubai: 'City of Gold',
  japan: 'Land of the Rising Sun',
  tokyo: 'Where Tradition Meets Future',
  kyoto: 'Heart of Ancient Japan',
  london: 'The Capital of Cool',
  rome: 'The Eternal City',
  greece: 'Birthplace of Legends',
  santorini: 'Jewel of the Aegean',
  maldives: 'Tropical Paradise',
  thailand: 'Land of Smiles',
  singapore: 'The Garden City',
  'new york': 'The City That Never Sleeps',
  switzerland: 'Heaven on Earth',
  hawaii: 'The Aloha Spirit',
  iceland: 'Land of Fire & Ice',
  agra: 'City of the Taj',
  varanasi: 'The Spiritual Capital',
  udaipur: 'City of Lakes',
  jaipur: 'The Pink City',
  darjeeling: 'Queen of the Hills',
  munnar: 'Tea Country Paradise',
  andaman: 'Emerald Isles',
  ooty: 'Queen of Hill Stations',
  rishikesh: 'Yoga Capital of the World',
  barcelona: 'City of Gaudí',
  amsterdam: 'Venice of the North',
  'los angeles': 'City of Angels',
  phuket: 'Pearl of the Andaman',
};

/**
 * Get a poetic tagline for the destination.
 * Falls back to travel-style based tagline.
 */
export const getDestinationTagline = (destination, travelStyle) => {
  const dest = (destination || '').toLowerCase().trim();

  // Try exact match first
  if (DESTINATION_TAGLINES[dest]) return DESTINATION_TAGLINES[dest];

  // Try partial match
  for (const [key, tagline] of Object.entries(DESTINATION_TAGLINES)) {
    if (dest.includes(key) || key.includes(dest)) return tagline;
  }

  // Fallback to style-based
  const styleTaglines = {
    adventure: 'Thrill awaits',
    relaxation: 'Time to unwind',
    cultural: 'A cultural odyssey',
    family: 'Making memories',
    romantic: 'A love story',
  };
  return styleTaglines[(travelStyle || '').toLowerCase()] || 'An unforgettable journey';
};

// ─── Eyebrow Label ────────────────────────────────────────────────

export const getEyebrow = (style) => {
  const map = {
    adventure: 'Adventure awaits',
    relaxation: 'Time to unwind',
    cultural: 'Cultural journey',
    family: 'Family memories',
    romantic: 'Just the two of us',
  };
  return map[(style || '').toLowerCase()] || 'My trip to';
};

// ─── Budget Display ───────────────────────────────────────────────

export const getBudgetDisplay = (budget) => {
  const map = {
    low: 'Budget',
    moderate: 'Mid-range',
    premium: 'Premium',
  };
  return map[(budget || '').toLowerCase()] || budget || '—';
};

// ─── Traveler Group Label ─────────────────────────────────────────

export const getTravelerLabel = (travelers) => {
  const n = Array.isArray(travelers) ? travelers.length : (Number(travelers) || 1);
  if (n === 1) return 'Solo';
  if (n === 2) return 'Couple';
  if (n <= 4) return `${n} Travelers`;
  return `Group of ${n}`;
};

// ─── Activity Emoji Mapping ───────────────────────────────────────

const ACTIVITY_EMOJI_MAP = [
  { pattern: /beach|coast|shore|seaside|sand/i, emoji: '🏖️' },
  { pattern: /sunset|sunrise/i, emoji: '🌅' },
  { pattern: /temple|shrine|church|mosque|cathedral|pagoda/i, emoji: '🛕' },
  { pattern: /trek|hike|hiking|trail|climb/i, emoji: '🥾' },
  { pattern: /waterfall|falls/i, emoji: '💧' },
  { pattern: /safari|wildlife|jungle|forest/i, emoji: '🌿' },
  { pattern: /market|bazaar|shopping|souk/i, emoji: '🛍️' },
  { pattern: /museum|gallery|art/i, emoji: '🎨' },
  { pattern: /palace|fort|castle|heritage/i, emoji: '🏰' },
  { pattern: /lake|river|backwater|cruise|boat|houseboat/i, emoji: '🚣' },
  { pattern: /snorkel|dive|diving|surf|water sport/i, emoji: '🏄' },
  { pattern: /spa|massage|ayurved|wellness/i, emoji: '💆' },
  { pattern: /yoga|meditation|retreat/i, emoji: '🧘' },
  { pattern: /food|cuisine|restaurant|cafe|culinary|street food/i, emoji: '🍽️' },
  { pattern: /mountain|valley|hill|peak|viewpoint|panoram/i, emoji: '🏔️' },
  { pattern: /garden|park|botanical/i, emoji: '🌺' },
  { pattern: /island|archipelago/i, emoji: '🏝️' },
  { pattern: /monument|memorial|statue/i, emoji: '🗿' },
  { pattern: /adventure|zip.?line|bungee|paraglid|rafting/i, emoji: '🪂' },
  { pattern: /night|club|bar|party/i, emoji: '🌙' },
  { pattern: /photo|scenic|view/i, emoji: '📸' },
  { pattern: /desert|dune|camel/i, emoji: '🐪' },
  { pattern: /snow|ski|ice|glacier/i, emoji: '❄️' },
  { pattern: /tea|plantation|coffee/i, emoji: '🍵' },
];

/**
 * Get an emoji for an activity description.
 */
export const getActivityEmoji = (text) => {
  const str = (text || '').toLowerCase();
  for (const { pattern, emoji } of ACTIVITY_EMOJI_MAP) {
    if (pattern.test(str)) return emoji;
  }
  return '✨';
};

// ─── Boring Activity Filter ──────────────────────────────────────

const BORING_PATTERNS = [
  /check.?in/i, /check.?out/i,
  /breakfast/i, /lunch(?!.*local|.*street|.*traditional)/i, /dinner(?!.*local|.*rooftop|.*traditional)/i,
  /hotel/i, /resort(?!.*tour)/i, /hostel/i,
  /airport/i, /flight/i, /transit/i, /transfer/i,
  /departure/i, /arrival/i,
  /packing/i, /luggage/i,
  /rest\b/i, /free time/i, /leisure/i,
  /^drive to/i, /^travel to/i, /^head to/i,
];

const EXCITING_PATTERNS = [
  /temple|shrine|church|mosque/i,
  /beach|coast|sunset|sunrise/i,
  /trek|hike|waterfall|mountain|peak/i,
  /safari|wildlife|jungle|forest/i,
  /market|bazaar|shopping/i,
  /museum|gallery|palace|fort|castle|heritage|monument/i,
  /lake|river|backwater|cruise|boat|houseboat/i,
  /snorkel|dive|surf|water sport/i,
  /spa|massage|ayurved|yoga|meditation/i,
  /adventure|zip.?line|bungee|paraglid|rafting|kayak/i,
  /island|viewpoint|panoram|scenic/i,
  /food tour|street food|culinary|local cuisine/i,
  /garden|botanical|plantation/i,
  /desert|dune|camel/i,
  /snow|ski|glacier/i,
];

/**
 * Score an activity by excitement level.
 * Negative = boring, Positive = exciting.
 */
const scoreActivity = (text) => {
  const str = (text || '').toLowerCase();
  if (BORING_PATTERNS.some((p) => p.test(str))) return -10;
  let score = 0;
  EXCITING_PATTERNS.forEach((p) => {
    if (p.test(str)) score += 5;
  });
  // Bonus for longer, more descriptive names
  if (str.length > 15) score += 1;
  return score;
};

/**
 * Extract top 3 exciting highlights from the itinerary.
 * Filters out boring logistics and prioritizes aspirational activities.
 *
 * Returns array of { text: string, emoji: string }
 */
export const extractHighlights = (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary)) return [];

  // Collect all activities across all days
  const allActivities = [];

  for (const day of itinerary) {
    if (!day?.activities || !Array.isArray(day.activities)) continue;
    for (const activity of day.activities) {
      const name = activity.placeName || activity.activity || '';
      if (!name.trim()) continue;
      allActivities.push({
        name: name.trim(),
        score: scoreActivity(name),
      });
    }
  }

  // Sort by excitement score (highest first), deduplicate
  const seen = new Set();
  const unique = allActivities
    .filter((a) => a.score >= 0) // remove boring
    .sort((a, b) => b.score - a.score)
    .filter((a) => {
      const key = a.name.toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Take top 3
  return unique.slice(0, 3).map((a) => ({
    text: a.name.length > 30 ? a.name.substring(0, 27) + '...' : a.name,
    emoji: getActivityEmoji(a.name),
  }));
};

// ─── Theme Recommendation ─────────────────────────────────────────

export const getRecommendedTheme = (style) => {
  const map = {
    adventure: 'midnight',
    relaxation: 'golden',
    cultural: 'editorial',
    family: 'midnight',
    romantic: 'golden',
  };
  return map[(style || '').toLowerCase()] || 'midnight';
};
