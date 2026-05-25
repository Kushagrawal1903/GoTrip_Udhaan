const mongoose = require('mongoose');

/**
 * Trip Schema
 * Stores generated trip data associated with a user,
 * including packing list, collaboration data, and comments.
 */
const tripSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        destination: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 day'],
            max: [30, 'Duration cannot exceed 30 days'],
        },
        budget: {
            type: String,
            required: [true, 'Budget tier is required'],
            enum: ['low', 'moderate', 'premium'],
        },
        travelStyle: {
            type: String,
            required: [true, 'Travel style is required'],
            enum: ['adventure', 'relaxation', 'cultural', 'family', 'romantic'],
        },
        travelers: {
            type: mongoose.Schema.Types.Mixed,
            default: 1,
        },
        travelRecommendations: [{
            travelerId: String,
            travelerName: String,
            origin: String,
            destination: String,
            options: [{
                mode: { type: String, enum: ['flight', 'train', 'bus', 'car', 'mixed'] },
                label: String,
                estimatedCost: String,
                estimatedDuration: String,
                recommendation: { type: String, enum: ['fastest', 'cheapest', 'balanced', 'comfort'] },
                details: String,
                bookingHint: String
            }],
            recommendedOption: String,
            generatedAt: Date
        }],
        meetingPlan: {
            suggestedArrivalWindow: String,
            meetPoint: String,
            meetPointType: { type: String, enum: ['airport', 'station', 'hotel', 'city_center'] },
            coordinationNotes: String,
            travelersWithArrivals: [{
                travelerId: String,
                travelerName: String,
                estimatedArrival: String,
                transportMode: String
            }]
        },
        travelOptimizeFor: {
            type: String,
            enum: ['cheapest', 'fastest', 'balanced', 'comfort'],
            default: 'balanced'
        },
        hasOrigins: { type: Boolean, default: false },
        // Store the complete AI-generated trip data as a flexible object
        tripData: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        // Destination image URL from Google Places API
        destinationImage: {
            type: String,
            default: null,
        },
        // Coordinates for map embedding
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },

        // ─── FEATURE 1: Smart Packing List ─────────────────────
        packingList: {
            categories: [{
                name: String,
                icon: String,
                items: [{
                    name: String,
                    quantity: Number,
                    essential: Boolean,
                    note: String,
                    checked: { type: Boolean, default: false },
                }],
            }],
            weatherNote: String,
            proTip: String,
            generatedAt: Date,
        },

        // ─── FEATURE 3: Collaborative Trip Planning ────────────
        collaborators: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            email: String,
            role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
            invitedAt: { type: Date, default: Date.now },
            acceptedAt: Date,
            status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
        }],
        comments: [{
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            userName: String,
            userAvatar: String,
            dayIndex: Number,
            timeSlot: String,
            text: String,
            suggestion: String,
            status: { type: String, enum: ['open', 'accepted', 'dismissed'], default: 'open' },
            createdAt: { type: Date, default: Date.now },
        }],
        shareToken: { type: String, unique: true, sparse: true },
        // ─── FEATURE 4: Public Trip Sharing ────────────
        shareId: { type: String, unique: true, sparse: true },
        isPublic: { type: Boolean, default: false },

        // ─── FEATURE 5: Share Card Analytics ─────────────
        shares: {
            total: { type: Number, default: 0 },
            byPlatform: {
                download: { type: Number, default: 0 },
                whatsapp: { type: Number, default: 0 },
                link: { type: Number, default: 0 },
                native: { type: Number, default: 0 },
            },
            lastSharedAt: Date,
        },

        // ─── FEATURE 6: Cinematic Travel Stories ─────────────
        story: {
            isPublished: { type: Boolean, default: false },
            slug: { type: String, unique: true, sparse: true },

            // Trip Personality System
            personality: {
                emoji: String,              // ✨ 🏔 🌊
                vibeLabel: String,          // "Romantic Alpine Escape"
                emotionalTone: String,      // "intimate", "adventurous", "serene"
                description: String,        // "A slow, sun-drenched journey…"
            },

            // Emotional Journey Engine
            emotionalArc: {
                beginning: String,          // Anticipation & excitement
                risingAction: String,       // Discovery & immersion
                peakMoment: String,         // Unforgettable wow
                windDown: String,           // Reflective slowness
                farewellMoment: String,     // Emotional closure
            },

            // AI-generated cinematic narrative
            narrative: {
                headline: String,           // "7 Unforgettable Days in Switzerland"
                subtitle: String,           // "A romantic alpine escape"
                introduction: String,       // 2-3 sentence mood paragraph
                closingParagraph: String,   // Emotional farewell
                dayNarratives: [{
                    dayIndex: Number,
                    title: String,          // Cinematic day title
                    mood: String,           // "adventurous", "reflective"
                    narrative: String,       // 1-2 sentence day summary
                }],
            },

            // Signature WOW Moment
            wowMoment: {
                dayIndex: Number,
                timeSlot: String,           // "Morning", "Evening"
                title: String,              // "Sunrise Over Jungfrau"
                narrative: String,          // Editorial storytelling
                whyItMatters: String,       // Emotional explanation
                placeName: String,
            },

            // Cover image
            coverImage: {
                url: String,
                alt: String,
            },

            // SEO metadata
            seo: {
                title: String,
                description: String,
                keywords: [String],
            },

            // Travel insights
            insights: {
                bestSeason: String,
                localEtiquette: [String],
                weather: String,
                hiddenGems: [String],
                insiderTips: [String],
            },

            // Engagement metrics
            metrics: {
                views: { type: Number, default: 0 },
                clones: { type: Number, default: 0 },
                shares: { type: Number, default: 0 },
                saves: { type: Number, default: 0 },
                avgScrollDepth: { type: Number, default: 0 },
                ctaClicks: { type: Number, default: 0 },
            },

            publishedAt: Date,
        },

        // Wishlist/saved stories (for logged-in users who save others' stories)
        savedStories: [{
            tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
            savedAt: { type: Date, default: Date.now },
        }],
    },
    {
        timestamps: true,
    }
);

// Index for collaboration queries
tripSchema.index({ 'collaborators.email': 1 });

// Indexes for Cinematic Travel Stories
tripSchema.index({ 'story.slug': 1 }, { unique: true, sparse: true });
tripSchema.index({ 'story.isPublished': 1, 'story.publishedAt': -1 });

module.exports = mongoose.model('Trip', tripSchema);
