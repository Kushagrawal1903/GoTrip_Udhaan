const express = require('express');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const { DESTINATIONS, CATEGORIES, REGIONS } = require('../data/destinations');
const { getWikipediaImage } = require('../services/googleService');

const router = express.Router();

/**
 * In-memory image cache to avoid repeated Wikipedia lookups.
 * Key = destination id, Value = { url, fetchedAt }
 * Cache TTL = 24 hours
 */
const imageCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Fetch or return cached Wikipedia image for a destination
 */
async function getDestinationImage(dest) {
    const cached = imageCache.get(dest.id);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return cached.url;
    }

    try {
        // Try the primary name, then state
        const searchTerms = [dest.name.split(',')[0].trim(), dest.state];
        let url = null;
        for (const term of searchTerms) {
            url = await getWikipediaImage(term);
            if (url) break;
        }
        imageCache.set(dest.id, { url, fetchedAt: Date.now() });
        return url;
    } catch {
        return null;
    }
}

/**
 * GET /api/explore/destinations
 * Returns curated destinations with optional filtering.
 * Query params: category, region, style, search, page, limit
 * Protected — requires auth (user needs to be logged in to use dashboard features)
 */
router.get('/destinations', auth, async (req, res, next) => {
    try {
        const {
            category = 'all',
            region = 'All Regions',
            style = 'all',
            search = '',
            page = 1,
            limit = 12,
        } = req.query;

        let filtered = [...DESTINATIONS];

        // Category filter
        if (category && category !== 'all') {
            filtered = filtered.filter(d => d.category === category);
        }

        // Region filter
        if (region && region !== 'All Regions') {
            filtered = filtered.filter(d => d.region === region);
        }

        // Travel style filter
        if (style && style !== 'all') {
            filtered = filtered.filter(d => d.travelStyles.includes(style));
        }

        // Text search
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.state.toLowerCase().includes(q) ||
                d.tagline.toLowerCase().includes(q) ||
                d.highlights.some(h => h.toLowerCase().includes(q))
            );
        }

        // Pagination
        const total = filtered.length;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(30, Math.max(1, parseInt(limit)));
        const startIdx = (pageNum - 1) * limitNum;
        const paginated = filtered.slice(startIdx, startIdx + limitNum);

        // Fetch images in parallel (cached for performance)
        const withImages = await Promise.all(
            paginated.map(async (dest) => {
                const imageUrl = await getDestinationImage(dest);
                return { ...dest, image: imageUrl };
            })
        );

        res.json({
            success: true,
            data: {
                destinations: withImages,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
                filters: {
                    categories: CATEGORIES,
                    regions: REGIONS,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/explore/destinations/:id
 * Returns detailed information about a single destination,
 * including community stats (how many GoTrip users have planned trips there).
 */
router.get('/destinations/:id', auth, async (req, res, next) => {
    try {
        const dest = DESTINATIONS.find(d => d.id === req.params.id);
        if (!dest) {
            return res.status(404).json({ success: false, message: 'Destination not found.' });
        }

        // Community stats: how many trips to this destination
        const searchTerms = [
            dest.name.split(',')[0].trim(),
            dest.state,
        ];

        // Build a regex that matches any of the search terms (case-insensitive)
        const regexPattern = searchTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const communityTrips = await Trip.countDocuments({
            destination: { $regex: regexPattern, $options: 'i' },
        });

        // Fetch image
        const imageUrl = await getDestinationImage(dest);

        // Check if current user has trips to this destination
        const userTrips = await Trip.find(
            {
                userId: req.userId,
                destination: { $regex: regexPattern, $options: 'i' },
            },
            '_id destination duration travelStyle createdAt'
        ).lean();

        res.json({
            success: true,
            data: {
                ...dest,
                image: imageUrl,
                communityStats: {
                    totalTrips: communityTrips,
                },
                userTrips: userTrips.map(t => ({
                    _id: t._id,
                    destination: t.destination,
                    duration: t.duration,
                    travelStyle: t.travelStyle,
                    createdAt: t.createdAt,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/explore/trending
 * Returns the top 5 most popular destinations based on actual trip data,
 * plus current-month "hot" destinations.
 */
router.get('/trending', auth, async (req, res, next) => {
    try {
        // Aggregate trip counts by destination
        const trendingAgg = await Trip.aggregate([
            {
                $group: {
                    _id: '$destination',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' },
                    lastPlanned: { $max: '$createdAt' },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);

        // Map to curated destinations where possible
        const trending = trendingAgg.map(item => {
            const destName = item._id.split(',')[0].trim().toLowerCase();
            const curated = DESTINATIONS.find(d =>
                d.name.toLowerCase().includes(destName) ||
                d.id === destName
            );
            return {
                destination: item._id,
                tripCount: item.count,
                avgDuration: Math.round(item.avgDuration),
                lastPlanned: item.lastPlanned,
                curated: curated || null,
            };
        });

        // Seasonal recommendations — destinations whose best season includes current month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = monthNames[new Date().getMonth()];
        const seasonal = DESTINATIONS.filter(d =>
            d.bestSeason.months.includes(currentMonth)
        ).slice(0, 6);

        res.json({
            success: true,
            data: {
                trending,
                seasonal,
                currentMonth,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
