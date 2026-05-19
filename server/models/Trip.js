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
            type: Number,
            default: 1,
            min: [1, 'Must have at least 1 traveler'],
            max: [10, 'Cannot exceed 10 travelers'],
        },
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
    },
    {
        timestamps: true,
    }
);

// Index for collaboration queries
tripSchema.index({ 'collaborators.email': 1 });

module.exports = mongoose.model('Trip', tripSchema);
