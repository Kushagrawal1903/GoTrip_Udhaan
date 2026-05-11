const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores in-app notifications for collaboration events
 */
const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['collab_invite', 'collab_accepted', 'comment_added', 'trip_shared'],
            required: true,
        },
        message: {
            type: String,
            required: true,
            maxlength: 300,
        },
        read: {
            type: Boolean,
            default: false,
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            default: null,
        },
    },
    { timestamps: true }
);

// Compound index for fetching unread notifications efficiently
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
