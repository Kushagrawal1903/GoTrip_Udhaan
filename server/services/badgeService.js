const Trip = require('../models/Trip');

/**
 * All possible badges with their unlock conditions
 */
const BADGE_DEFINITIONS = [
    { id: 'first_trip', name: 'First Takeoff', description: 'Planned your first trip', emoji: '✈️' },
    { id: 'mountain_lover', name: 'Mountain Lover', description: '3 adventure trips planned', emoji: '🏔️' },
    { id: 'beach_bum', name: 'Beach Bum', description: '3 relaxation trips planned', emoji: '🏖️' },
    { id: 'culture_vulture', name: 'Culture Vulture', description: '3 cultural trips planned', emoji: '🏛️' },
    { id: 'team_player', name: 'Team Player', description: 'Invited 5 collaborators', emoji: '🤝' },
    { id: 'globe_trotter', name: 'Globe Trotter', description: 'Plan trips to 5 different destinations', emoji: '🌍' },
    { id: 'planner_pro', name: 'Planner Pro', description: 'Plan 10 trips', emoji: '📋' },
    { id: 'packing_master', name: 'Packing Master', description: 'Generated 5 packing lists', emoji: '🧳' },
    { id: 'early_bird', name: 'Early Bird', description: 'Member for 6+ months', emoji: '🐦' },
];

/**
 * Compute badges for a user based on their actual trip data
 * @param {string} userId
 * @param {Date} userCreatedAt
 * @returns {{ earned: Array, locked: Array }}
 */
async function computeBadges(userId, userCreatedAt) {
    const trips = await Trip.find({ userId }).lean();

    const totalTrips = trips.length;
    const styleCounts = {};
    const destinations = new Set();
    let totalCollaborators = 0;
    let packingListCount = 0;

    for (const trip of trips) {
        // Count by style
        if (trip.travelStyle) {
            styleCounts[trip.travelStyle] = (styleCounts[trip.travelStyle] || 0) + 1;
        }
        // Unique destinations
        if (trip.destination) {
            destinations.add(trip.destination.toLowerCase().trim());
        }
        // Total collaborators
        if (trip.collaborators?.length) {
            totalCollaborators += trip.collaborators.filter(c => c.status === 'accepted').length;
        }
        // Packing lists generated
        if (trip.packingList?.categories?.length > 0) {
            packingListCount++;
        }
    }

    const accountAgeMonths = (Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);

    // Check conditions for each badge
    const conditions = {
        first_trip: { met: totalTrips >= 1, progress: `${Math.min(totalTrips, 1)}/1` },
        mountain_lover: { met: (styleCounts.adventure || 0) >= 3, progress: `${Math.min(styleCounts.adventure || 0, 3)}/3` },
        beach_bum: { met: (styleCounts.relaxation || 0) >= 3, progress: `${Math.min(styleCounts.relaxation || 0, 3)}/3` },
        culture_vulture: { met: (styleCounts.cultural || 0) >= 3, progress: `${Math.min(styleCounts.cultural || 0, 3)}/3` },
        team_player: { met: totalCollaborators >= 5, progress: `${Math.min(totalCollaborators, 5)}/5` },
        globe_trotter: { met: destinations.size >= 5, progress: `${Math.min(destinations.size, 5)}/5` },
        planner_pro: { met: totalTrips >= 10, progress: `${Math.min(totalTrips, 10)}/10` },
        packing_master: { met: packingListCount >= 5, progress: `${Math.min(packingListCount, 5)}/5` },
        early_bird: { met: accountAgeMonths >= 6, progress: `${Math.min(Math.floor(accountAgeMonths), 6)}/6 months` },
    };

    const earned = [];
    const locked = [];

    for (const badge of BADGE_DEFINITIONS) {
        const cond = conditions[badge.id];
        if (cond?.met) {
            earned.push({ ...badge });
        } else {
            locked.push({ ...badge, progress: cond?.progress || '0' });
        }
    }

    return { earned, locked };
}

module.exports = { computeBadges };
