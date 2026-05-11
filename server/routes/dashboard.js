const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Aggregate statistics for the authenticated user
 */
router.get('/stats', auth, async (req, res, next) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all user trips (lightweight projection)
        const trips = await Trip.find(
            {
                $or: [
                    { userId },
                    { 'collaborators.userId': userId, 'collaborators.status': 'accepted' },
                ],
            },
            'destination duration collaborators createdAt'
        ).lean();

        const ownedTrips = trips.filter(t => t.userId?.toString() === userId.toString());

        const totalTrips = ownedTrips.length;
        const destinations = [...new Set(ownedTrips.map(t => t.destination))];
        const uniqueDestinations = destinations.length;
        // Rough country estimation: extract last segment after comma
        const countries = new Set();
        for (const dest of destinations) {
            const parts = dest.split(',').map(s => s.trim());
            countries.add(parts[parts.length - 1]);
        }
        const countriesVisited = countries.size;
        const totalDaysPlanned = ownedTrips.reduce((sum, t) => sum + (t.duration || 0), 0);
        const tripsThisMonth = ownedTrips.filter(t => new Date(t.createdAt) >= startOfMonth).length;

        // Collaborator stats across all owned trips
        let collaboratorCount = 0;
        let pendingInvites = 0;
        for (const t of ownedTrips) {
            if (t.collaborators && t.collaborators.length > 0) {
                collaboratorCount += t.collaborators.filter(c => c.status === 'accepted').length;
                pendingInvites += t.collaborators.filter(c => c.status === 'pending').length;
            }
        }

        res.json({
            success: true,
            data: {
                totalTrips,
                uniqueDestinations,
                countriesVisited,
                totalDaysPlanned,
                collaboratorCount,
                pendingInvites,
                tripsThisMonth,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/recent-trips
 * Returns the 4 most recently updated trips
 */
router.get('/recent-trips', auth, async (req, res, next) => {
    try {
        const trips = await Trip.find(
            {
                $or: [
                    { userId: req.userId },
                    { 'collaborators.userId': req.userId, 'collaborators.status': 'accepted' },
                ],
            },
            'destination duration travelers travelStyle budget packingList collaborators destinationImage createdAt updatedAt userId'
        )
            .sort({ updatedAt: -1 })
            .limit(4)
            .lean();

        const formatted = trips.map(t => ({
            _id: t._id,
            destination: t.destination,
            duration: t.duration,
            travelers: t.travelers || 1,
            style: t.travelStyle || 'adventure',
            budget: t.budget || 'moderate',
            hasPackingList: !!(t.packingList && t.packingList.categories && t.packingList.categories.length > 0),
            collaboratorCount: (t.collaborators || []).filter(c => c.status === 'accepted').length,
            destinationImage: t.destinationImage || null,
            isOwner: t.userId?.toString() === req.userId.toString(),
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/collaborations
 * Returns up to 5 collaboration relationships for the user
 */
router.get('/collaborations', auth, async (req, res, next) => {
    try {
        const userId = req.userId;

        // Trips owned by user that have collaborators
        const ownedTrips = await Trip.find(
            { userId, 'collaborators.0': { $exists: true } },
            'destination collaborators'
        ).lean();

        // Trips the user is collaborating on (not owner)
        const collabTrips = await Trip.find(
            { 'collaborators.userId': userId },
            'destination collaborators userId'
        )
            .populate('userId', 'name email')
            .lean();

        const results = [];

        // From owned trips: show collaborators
        for (const trip of ownedTrips) {
            for (const c of trip.collaborators || []) {
                results.push({
                    collaboratorName: c.email?.split('@')[0] || 'User',
                    collaboratorEmail: c.email,
                    tripDestination: trip.destination,
                    tripId: trip._id,
                    role: c.role,
                    status: c.status,
                    type: 'outgoing',
                });
            }
        }

        // From collab trips: show the owner
        for (const trip of collabTrips) {
            if (trip.userId?._id?.toString() === userId.toString()) continue;
            const myCollab = (trip.collaborators || []).find(
                c => c.userId?.toString() === userId.toString()
            );
            results.push({
                collaboratorName: trip.userId?.name || 'Owner',
                collaboratorEmail: trip.userId?.email || '',
                tripDestination: trip.destination,
                tripId: trip._id,
                role: myCollab?.role || 'viewer',
                status: myCollab?.status || 'pending',
                type: 'incoming',
            });
        }

        // Return max 5
        res.json({ success: true, data: results.slice(0, 5) });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/travel-stats
 * Detailed analytics for the travel stats page
 */
router.get('/travel-stats', auth, async (req, res, next) => {
    try {
        const trips = await Trip.find(
            { userId: req.userId },
            'destination duration budget travelStyle createdAt'
        )
            .sort({ createdAt: -1 })
            .lean();

        // Trips by style
        const styleCounts = {};
        for (const t of trips) {
            const s = t.travelStyle || 'other';
            styleCounts[s] = (styleCounts[s] || 0) + 1;
        }
        const tripsByStyle = Object.entries(styleCounts).map(([style, count]) => ({ style, count }));

        // Trips by budget
        const budgetCounts = {};
        for (const t of trips) {
            const b = t.budget || 'moderate';
            budgetCounts[b] = (budgetCounts[b] || 0) + 1;
        }
        const tripsByBudget = Object.entries(budgetCounts).map(([budget, count]) => ({ budget, count }));

        // Monthly activity (last 12 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const monthlyActivity = months.map((month, i) => {
            const count = trips.filter(t => {
                const d = new Date(t.createdAt);
                return d.getMonth() === i && d.getFullYear() === now.getFullYear();
            }).length;
            return { month, trips: count };
        });

        // Top destinations
        const destCounts = {};
        for (const t of trips) {
            const d = t.destination.split(',')[0].trim();
            destCounts[d] = (destCounts[d] || 0) + 1;
        }
        const topDestinations = Object.entries(destCounts)
            .map(([destination, count]) => ({ destination, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Highlight stats
        const longestTrip = trips.reduce(
            (max, t) => (t.duration > (max.duration || 0) ? { destination: t.destination, duration: t.duration } : max),
            { destination: '-', duration: 0 }
        );
        const mostRecentTrip = trips[0] || null;
        const favouriteStyle = tripsByStyle.sort((a, b) => b.count - a.count)[0]?.style || 'N/A';

        res.json({
            success: true,
            data: {
                tripsByStyle,
                tripsByBudget,
                monthlyActivity,
                topDestinations,
                longestTrip,
                mostRecentTrip: mostRecentTrip
                    ? { destination: mostRecentTrip.destination, createdAt: mostRecentTrip.createdAt }
                    : null,
                favouriteStyle,
                totalTrips: trips.length,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
