const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendInviteEmail } = require('../services/emailService');

const router = express.Router();

/**
 * Factory to inject Socket.io instance into routes
 * @param {Object} io - Socket.io server instance
 * @returns {Object} Express router
 */
module.exports = function createCollaborateRouter(io) {

    /**
     * POST /api/collaborate/invite
     * Invite a registered user to collaborate on a trip (owner only)
     */
    router.post('/invite', auth, async (req, res, next) => {
        try {
            const { tripId, email, role } = req.body;

            if (!tripId || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Trip ID and email are required.',
                });
            }

            if (role && !['viewer', 'editor'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role must be viewer or editor.',
                });
            }

            // Only trip owner can invite
            const trip = await Trip.findOne({ _id: tripId, userId: req.userId });
            if (!trip) {
                return res.status(404).json({
                    success: false,
                    message: 'Trip not found or you are not the owner.',
                });
            }

            // Check collaborator limit
            if ((trip.collaborators || []).length >= 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 10 collaborators per trip.',
                });
            }

            // Check if email belongs to a registered user
            const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });
            if (!invitedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'No registered user found with this email.',
                });
            }

            // Cannot invite yourself
            if (invitedUser._id.toString() === req.userId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot invite yourself.',
                });
            }

            // Check if already invited
            const alreadyInvited = trip.collaborators.some(
                c => c.email === email.toLowerCase().trim() || c.userId?.toString() === invitedUser._id.toString()
            );
            if (alreadyInvited) {
                return res.status(400).json({
                    success: false,
                    message: 'This user has already been invited.',
                });
            }

            // Generate share token if not set
            if (!trip.shareToken) {
                trip.shareToken = crypto.randomUUID();
            }

            // Add collaborator
            trip.collaborators.push({
                userId: invitedUser._id,
                email: invitedUser.email,
                role: role || 'viewer',
                invitedAt: new Date(),
                status: 'pending',
            });
            await trip.save();

            // Create Notification
            const notification = await Notification.create({
                userId: invitedUser._id,
                type: 'collab_invite',
                message: `${req.user.name} invited you to collaborate on their trip to ${trip.destination.split(',')[0]}.`,
                tripId: trip._id,
                shareToken: trip.shareToken,
            });

            if (io) {
                io.to(`user:${invitedUser._id}`).emit('new-notification', notification);
            }

            // Send invite email asynchronously
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const inviteUrl = `${frontendUrl}/join/${trip.shareToken}`;

            sendInviteEmail({
                ownerName: req.user.name,
                recipientEmail: invitedUser.email,
                destination: trip.destination,
                duration: trip.duration,
                travelStyle: trip.travelStyle,
                inviteUrl,
            }).catch(() => { /* Email send failure is non-blocking */ });

            res.json({
                success: true,
                message: 'Invitation sent successfully!',
                data: { collaborators: trip.collaborators },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/collaborate/invite/link
     * Generate or refresh a shareable invite link (owner only)
     */
    router.post('/invite/link', auth, async (req, res, next) => {
        try {
            const { tripId, role } = req.body;

            if (!tripId) {
                return res.status(400).json({ success: false, message: 'Trip ID is required.' });
            }

            const trip = await Trip.findOne({ _id: tripId, userId: req.userId });
            if (!trip) {
                return res.status(404).json({ success: false, message: 'Trip not found or you are not the owner.' });
            }

            // Generate or refresh share token
            trip.shareToken = crypto.randomUUID();
            await trip.save();

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const inviteUrl = `${frontendUrl}/join/${trip.shareToken}?role=${role || 'viewer'}`;

            res.json({
                success: true,
                data: { inviteUrl, shareToken: trip.shareToken },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/collaborate/join/:shareToken
     * Join a trip via share token
     */
    router.get('/join/:shareToken', auth, async (req, res, next) => {
        try {
            const { shareToken } = req.params;
            const role = req.query.role || 'viewer';

            const trip = await Trip.findOne({ shareToken });
            if (!trip) {
                return res.status(404).json({ success: false, message: 'Invalid or expired invite link.' });
            }

            // Cannot join your own trip as collaborator
            if (trip.userId.toString() === req.userId.toString()) {
                return res.json({
                    success: true,
                    message: 'You are the owner of this trip.',
                    data: { tripId: trip._id },
                });
            }

            // Check if already a collaborator
            const existingCollab = trip.collaborators.find(
                c => c.userId?.toString() === req.userId.toString()
            );

            if (existingCollab) {
                // Update status to accepted if pending
                if (existingCollab.status === 'pending') {
                    existingCollab.status = 'accepted';
                    existingCollab.acceptedAt = new Date();
                    await trip.save();

                    const notification = await Notification.create({
                        userId: trip.userId,
                        type: 'collab_accepted',
                        message: `${req.user.name} accepted your invitation to collaborate on ${trip.destination.split(',')[0]}.`,
                        tripId: trip._id,
                    });
                    if (io) {
                        io.to(`user:${trip.userId}`).emit('new-notification', notification);
                    }
                }
                return res.json({
                    success: true,
                    message: 'You have joined this trip!',
                    data: { tripId: trip._id },
                });
            }

            // Check limit
            if ((trip.collaborators || []).length >= 10) {
                return res.status(400).json({ success: false, message: 'This trip has reached the maximum number of collaborators.' });
            }

            // Add as new collaborator
            trip.collaborators.push({
                userId: req.userId,
                email: req.user.email,
                role: ['viewer', 'editor'].includes(role) ? role : 'viewer',
                invitedAt: new Date(),
                acceptedAt: new Date(),
                status: 'accepted',
            });
            await trip.save();

            const notification = await Notification.create({
                userId: trip.userId,
                type: 'collab_accepted',
                message: `${req.user.name} joined your trip to ${trip.destination.split(',')[0]} as a collaborator.`,
                tripId: trip._id,
            });
            if (io) {
                io.to(`user:${trip.userId}`).emit('new-notification', notification);
            }

            res.json({
                success: true,
                message: 'You have joined this trip!',
                data: { tripId: trip._id },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * DELETE /api/collaborate/remove
     * Remove a collaborator from a trip (owner only)
     */
    router.delete('/remove', auth, async (req, res, next) => {
        try {
            const { tripId, collaboratorId } = req.body;

            if (!tripId || !collaboratorId) {
                return res.status(400).json({ success: false, message: 'Trip ID and collaborator ID are required.' });
            }

            const trip = await Trip.findOne({ _id: tripId, userId: req.userId });
            if (!trip) {
                return res.status(404).json({ success: false, message: 'Trip not found or you are not the owner.' });
            }

            trip.collaborators = trip.collaborators.filter(
                c => c.userId?.toString() !== collaboratorId
            );
            await trip.save();

            // Notify removed collaborator via Socket.io
            if (io) {
                io.to(`trip:${tripId}`).emit('collaborator-removed', { userId: collaboratorId });
            }

            res.json({
                success: true,
                message: 'Collaborator removed.',
                data: { collaborators: trip.collaborators },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/collaborate/comment
     * Add a comment or suggestion to a trip activity
     */
    router.post('/comment', auth, async (req, res, next) => {
        try {
            const { tripId, dayIndex, timeSlot, text, suggestion } = req.body;

            if (!tripId || dayIndex === undefined || !timeSlot || !text) {
                return res.status(400).json({
                    success: false,
                    message: 'tripId, dayIndex, timeSlot, and text are required.',
                });
            }

            if (text.length > 500) {
                return res.status(400).json({ success: false, message: 'Comment text must be under 500 characters.' });
            }

            // User must be owner or accepted collaborator
            const trip = await Trip.findOne({
                _id: tripId,
                $or: [
                    { userId: req.userId },
                    { 'collaborators.userId': req.userId, 'collaborators.status': 'accepted' },
                ],
            });

            if (!trip) {
                return res.status(404).json({ success: false, message: 'Trip not found or access denied.' });
            }

            const comment = {
                userId: req.userId,
                userName: req.user.name,
                userAvatar: req.user.name ? req.user.name.charAt(0).toUpperCase() : '?',
                dayIndex,
                timeSlot,
                text: text.trim(),
                suggestion: suggestion ? suggestion.trim() : undefined,
                status: 'open',
                createdAt: new Date(),
            };

            trip.comments.push(comment);
            await trip.save();

            // Get the saved comment with _id
            const savedComment = trip.comments[trip.comments.length - 1];

            // Notify owner if commenter is not owner
            if (trip.userId.toString() !== req.userId.toString()) {
                const notification = await Notification.create({
                    userId: trip.userId,
                    type: 'comment_added',
                    message: `${req.user.name} added a comment to your trip to ${trip.destination.split(',')[0]}.`,
                    tripId: trip._id,
                });
                if (io) {
                    io.to(`user:${trip.userId}`).emit('new-notification', notification);
                }
            }

            // Emit to all users in the trip room
            if (io) {
                io.to(`trip:${tripId}`).emit('new-comment', savedComment);
            }

            res.status(201).json({
                success: true,
                data: { comment: savedComment },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PATCH /api/collaborate/comment/:commentId
     * Accept or dismiss a comment/suggestion (owner only)
     */
    router.patch('/comment/:commentId', auth, async (req, res, next) => {
        try {
            const { commentId } = req.params;
            const { tripId, action } = req.body;

            if (!tripId || !action || !['accept', 'dismiss'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'tripId and action (accept/dismiss) are required.',
                });
            }

            // Only owner can accept/dismiss
            const trip = await Trip.findOne({ _id: tripId, userId: req.userId });
            if (!trip) {
                return res.status(404).json({ success: false, message: 'Trip not found or you are not the owner.' });
            }

            const comment = trip.comments.id(commentId);
            if (!comment) {
                return res.status(404).json({ success: false, message: 'Comment not found.' });
            }

            let updatedActivity = null;

            if (action === 'accept' && comment.suggestion) {
                // Update the itinerary activity text
                if (trip.tripData?.itinerary?.[comment.dayIndex]) {
                    const day = trip.tripData.itinerary[comment.dayIndex];
                    const timeSlotLower = comment.timeSlot.toLowerCase();
                    const activity = day.activities?.find(
                        a => a.time?.toLowerCase() === timeSlotLower
                    );
                    if (activity) {
                        activity.activity = comment.suggestion;
                        updatedActivity = {
                            dayIndex: comment.dayIndex,
                            timeSlot: comment.timeSlot,
                            newActivity: comment.suggestion,
                        };
                        trip.markModified('tripData');
                    }
                }
                comment.status = 'accepted';
            } else if (action === 'dismiss') {
                comment.status = 'dismissed';
            } else {
                comment.status = action === 'accept' ? 'accepted' : 'dismissed';
            }

            await trip.save();

            // Emit update to all users
            if (io) {
                io.to(`trip:${tripId}`).emit('comment-updated', {
                    commentId,
                    status: comment.status,
                    updatedActivity,
                });
            }

            res.json({
                success: true,
                data: { commentId, status: comment.status, updatedActivity },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/collaborate/:tripId/collaborators
     * Get the collaborators list for a trip
     */
    router.get('/:tripId/collaborators', auth, async (req, res, next) => {
        try {
            const { tripId } = req.params;

            const trip = await Trip.findOne({
                _id: tripId,
                $or: [
                    { userId: req.userId },
                    { 'collaborators.userId': req.userId, 'collaborators.status': { $in: ['accepted', 'pending'] } },
                ],
            }).populate('collaborators.userId', 'name email');

            if (!trip) {
                return res.status(404).json({ success: false, message: 'Trip not found.' });
            }

            res.json({
                success: true,
                data: {
                    collaborators: trip.collaborators,
                    isOwner: trip.userId.toString() === req.userId.toString(),
                },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/collaborate/respond
     * Accept or decline a collaboration invitation
     */
    router.post('/respond', auth, async (req, res, next) => {
        try {
            const { tripId, action } = req.body;

            if (!tripId || !action || !['accept', 'decline'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'tripId and action (accept/decline) are required.',
                });
            }

            const trip = await Trip.findById(tripId);
            if (!trip) {
                return res.status(404).json({ success: false, message: 'Trip not found.' });
            }

            const collaborator = trip.collaborators.find(
                c => c.userId?.toString() === req.userId.toString()
            );

            if (!collaborator) {
                return res.status(404).json({ success: false, message: 'You are not invited to collaborate on this trip.' });
            }

            if (action === 'accept') {
                collaborator.status = 'accepted';
                collaborator.acceptedAt = new Date();
                await trip.save();

                const notification = await Notification.create({
                    userId: trip.userId,
                    type: 'collab_accepted',
                    message: `${req.user.name} accepted your invitation to collaborate on ${trip.destination.split(',')[0]}.`,
                    tripId: trip._id,
                });

                if (io) {
                    io.to(`user:${trip.userId}`).emit('new-notification', notification);
                }

                return res.json({
                    success: true,
                    message: 'Invitation accepted successfully!',
                    data: { collaborators: trip.collaborators },
                });
            } else {
                trip.collaborators = trip.collaborators.filter(
                    c => c.userId?.toString() !== req.userId.toString()
                );
                await trip.save();

                return res.json({
                    success: true,
                    message: 'Invitation declined.',
                    data: { collaborators: trip.collaborators },
                });
            }
        } catch (error) {
            next(error);
        }
    });

    return router;
};
