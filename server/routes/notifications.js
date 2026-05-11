const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user (most recent first)
 */
router.get('/', auth, async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        res.json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/notifications/count
 * Return unread notification count
 */
router.get('/count', auth, async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ userId: req.userId, read: false });
        res.json({ success: true, data: { count } });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', auth, async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { read: true }
        );
        res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.patch('/read-all', auth, async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
