const mongoose = require('mongoose');

/**
 * Trip Schema
 * Stores generated trip data associated with a user
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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Trip', tripSchema);
