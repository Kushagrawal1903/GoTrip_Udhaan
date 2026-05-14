const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const { computeBadges } = require('../services/badgeService');
const upload = require('../middleware/upload');
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require('../services/cloudinaryService');

const router = express.Router();

// ─── GET /api/user/profile ──────────────────────────────────
router.get('/profile', auth, async (req, res, next) => {
    try {
        const user = req.user;
        const nameParts = (user.name || '').split(' ');
        const initials = user.avatarInitials ||
            (nameParts.map(s => s[0]).join('').slice(0, 2).toUpperCase()) || 'U';

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                firstName: user.firstName || nameParts[0] || '',
                lastName: user.lastName || nameParts.slice(1).join(' ') || '',
                email: user.email,
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || '',
                avatarUrl: user.avatarUrl || null,
                avatarInitials: initials,
                plan: user.plan || 'free',
                planExpiresAt: user.planExpiresAt || null,
                googleConnected: !!user.googleId,
                preferences: user.preferences || { defaultStyle: 'adventure', defaultBudget: 'mid', currency: 'INR' },
                notifications: user.notifications || {
                    email: { tripReminders: true, collaborationActivity: true, inviteAccepted: true, productUpdates: false },
                    whatsapp: { dailyDigest: true, preTripReminder: true, weatherAlerts: false },
                    digestTime: '07:30',
                    timezone: 'Asia/Kolkata',
                },
                privacy: user.privacy || { publicProfile: true, showOnExploreFeed: false, activityAnalytics: true },
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/user/profile ────────────────────────────────
router.patch('/profile', auth, async (req, res, next) => {
    try {
        const { firstName, lastName, phone, bio, location } = req.body;
        const updates = {};

        if (firstName !== undefined) {
            if (!firstName || firstName.length > 50 || /\d/.test(firstName)) {
                return res.status(400).json({ success: false, message: 'First name must be 1-50 characters with no numbers.' });
            }
            updates.firstName = firstName.trim();
        }
        if (lastName !== undefined) {
            if (lastName.length > 50 || /\d/.test(lastName)) {
                return res.status(400).json({ success: false, message: 'Last name must be 0-50 characters with no numbers.' });
            }
            updates.lastName = lastName.trim();
        }
        if (phone !== undefined) {
            if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
                return res.status(400).json({ success: false, message: 'Invalid phone format.' });
            }
            updates.phone = phone;
        }
        if (bio !== undefined) {
            if (bio.length > 300) {
                return res.status(400).json({ success: false, message: 'Bio cannot exceed 300 characters.' });
            }
            updates.bio = bio;
        }
        if (location !== undefined) {
            if (location.length > 100) {
                return res.status(400).json({ success: false, message: 'Location cannot exceed 100 characters.' });
            }
            updates.location = location;
        }

        // Update the full name if first/last changed
        const fn = updates.firstName !== undefined ? updates.firstName : req.user.firstName || (req.user.name || '').split(' ')[0] || '';
        const ln = updates.lastName !== undefined ? updates.lastName : req.user.lastName || (req.user.name || '').split(' ').slice(1).join(' ') || '';
        if (updates.firstName !== undefined || updates.lastName !== undefined) {
            updates.name = `${fn} ${ln}`.trim();
            updates.avatarInitials = `${fn[0] || ''}${ln[0] || ''}`.toUpperCase() || 'U';
        }

        const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true });

        res.json({ success: true, user: updates });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/user/avatar ──────────────────────────────────
router.post('/avatar', auth, upload.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided.' });
        }

        // Upload to Cloudinary
        const avatarUrl = await uploadImageToCloudinary(req.file.buffer);

        // Delete old avatar if exists and it's a cloudinary URL
        const user = await User.findById(req.userId);
        if (user.avatarUrl && user.avatarUrl.includes('cloudinary.com')) {
            await deleteImageFromCloudinary(user.avatarUrl);
        }

        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({ success: true, avatarUrl });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/user/avatar ────────────────────────────────
router.delete('/avatar', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        
        if (user.avatarUrl && user.avatarUrl.includes('cloudinary.com')) {
            await deleteImageFromCloudinary(user.avatarUrl);
        }

        user.avatarUrl = null;
        await user.save();
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/user/preferences ────────────────────────────
router.patch('/preferences', auth, async (req, res, next) => {
    try {
        const { defaultStyle, defaultBudget, currency } = req.body;
        const updates = {};

        const validStyles = ['adventure', 'relaxation', 'cultural', 'family', 'romantic'];
        const validBudgets = ['low', 'mid', 'high'];

        if (defaultStyle !== undefined) {
            if (!validStyles.includes(defaultStyle)) {
                return res.status(400).json({ success: false, message: 'Invalid travel style.' });
            }
            updates['preferences.defaultStyle'] = defaultStyle;
        }
        if (defaultBudget !== undefined) {
            if (!validBudgets.includes(defaultBudget)) {
                return res.status(400).json({ success: false, message: 'Invalid budget tier.' });
            }
            updates['preferences.defaultBudget'] = defaultBudget;
        }
        if (currency !== undefined) {
            updates['preferences.currency'] = currency;
        }

        const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true });

        res.json({ success: true, preferences: user.preferences });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/user/notifications ──────────────────────────
router.patch('/notifications', auth, async (req, res, next) => {
    try {
        const { email, whatsapp, digestTime, timezone } = req.body;
        const updates = {};

        // Email notification toggles
        if (email) {
            for (const key of ['tripReminders', 'collaborationActivity', 'inviteAccepted', 'productUpdates']) {
                if (email[key] !== undefined) {
                    updates[`notifications.email.${key}`] = !!email[key];
                }
            }
        }

        // WhatsApp notification toggles
        if (whatsapp) {
            for (const key of ['dailyDigest', 'preTripReminder', 'weatherAlerts']) {
                if (whatsapp[key] !== undefined) {
                    updates[`notifications.whatsapp.${key}`] = !!whatsapp[key];
                }
            }
        }

        if (digestTime !== undefined) updates['notifications.digestTime'] = digestTime;
        if (timezone !== undefined) updates['notifications.timezone'] = timezone;

        const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true });

        // Sync whatsappOptIn based on whatsapp notification state
        const wa = user.notifications?.whatsapp || {};
        const anyWhatsappOn = wa.dailyDigest || wa.preTripReminder || wa.weatherAlerts;
        if (user.whatsappOptIn !== anyWhatsappOn) {
            await User.findByIdAndUpdate(req.userId, { whatsappOptIn: anyWhatsappOn });
        }

        res.json({ success: true, notifications: user.notifications });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/user/privacy ────────────────────────────────
router.patch('/privacy', auth, async (req, res, next) => {
    try {
        const { publicProfile, showOnExploreFeed, activityAnalytics } = req.body;
        const updates = {};

        if (publicProfile !== undefined) updates['privacy.publicProfile'] = !!publicProfile;
        if (showOnExploreFeed !== undefined) updates['privacy.showOnExploreFeed'] = !!showOnExploreFeed;
        if (activityAnalytics !== undefined) updates['privacy.activityAnalytics'] = !!activityAnalytics;

        const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true });

        res.json({ success: true, privacy: user.privacy });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/user/password ───────────────────────────────
router.patch('/password', auth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.userId).select('+password');

        // Google-only user check
        if (user.googleId && !user.password) {
            return res.status(400).json({
                success: false,
                message: 'Your account uses Google sign-in. Set a password via Google account settings.',
            });
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All password fields are required.' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }

        // Validate new password
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
        }
        if (!/\d/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'New password must contain at least 1 number.' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }

        // Check not same as current
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ success: false, message: 'New password cannot be the same as current password.' });
        }

        user.password = newPassword; // pre-save hook will hash
        await user.save();

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/user/stats ────────────────────────────────────
router.get('/stats', auth, async (req, res, next) => {
    try {
        const trips = await Trip.find({ userId: req.userId }).lean();

        const totalTrips = trips.length;
        const destinations = new Set();
        let totalDays = 0;
        let totalCollaborators = 0;
        let tripsThisMonth = 0;
        const styleCounts = {};

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        for (const trip of trips) {
            if (trip.destination) destinations.add(trip.destination.toLowerCase().trim());
            totalDays += trip.duration || 0;
            totalCollaborators += (trip.collaborators || []).filter(c => c.status === 'accepted').length;
            if (new Date(trip.createdAt) >= monthStart) tripsThisMonth++;
            if (trip.travelStyle) {
                styleCounts[trip.travelStyle] = (styleCounts[trip.travelStyle] || 0) + 1;
            }
        }

        // Favourite style
        let favouriteStyle = 'None yet';
        let maxCount = 0;
        for (const [style, count] of Object.entries(styleCounts)) {
            if (count > maxCount) {
                maxCount = count;
                favouriteStyle = style.charAt(0).toUpperCase() + style.slice(1);
            }
        }

        // Member since
        const createdAt = req.user.createdAt;
        const memberSince = createdAt
            ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Unknown';

        res.json({
            success: true,
            data: {
                totalTrips,
                totalDestinations: destinations.size,
                totalDaysPlanned: totalDays,
                totalCollaborators,
                tripsThisMonth,
                favouriteStyle,
                memberSince,
            },
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/user/badges ───────────────────────────────────
router.get('/badges', auth, async (req, res, next) => {
    try {
        const badges = await computeBadges(req.userId, req.user.createdAt);
        res.json({ success: true, data: badges });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/user/export-data ─────────────────────────────
router.post('/export-data', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).lean();
        const trips = await Trip.find({ userId: req.userId }).lean();

        // Collect comments where user is involved
        const allTrips = await Trip.find({
            $or: [
                { userId: req.userId },
                { 'collaborators.userId': req.userId },
            ],
        }).lean();

        const userComments = [];
        for (const trip of allTrips) {
            for (const comment of (trip.comments || [])) {
                if (String(comment.userId) === String(req.userId)) {
                    userComments.push({
                        tripId: trip._id,
                        tripDestination: trip.destination,
                        ...comment,
                    });
                }
            }
        }

        const exportData = {
            exportedAt: new Date().toISOString(),
            profile: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                location: user.location,
                plan: user.plan,
                createdAt: user.createdAt,
            },
            trips: trips.map(t => ({
                destination: t.destination,
                duration: t.duration,
                budget: t.budget,
                travelStyle: t.travelStyle,
                travelers: t.travelers,
                tripData: t.tripData,
                packingList: t.packingList,
                createdAt: t.createdAt,
            })),
            comments: userComments,
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="GoTrip-data-${req.userId}.json"`);
        res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/user/trips ─────────────────────────────────
router.delete('/trips', auth, async (req, res, next) => {
    try {
        if (req.body.confirm !== 'DELETE MY TRIPS') {
            return res.status(400).json({
                success: false,
                message: 'Confirmation string "DELETE MY TRIPS" is required.',
            });
        }

        const result = await Trip.deleteMany({ userId: req.userId });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} trips.`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/user/account ───────────────────────────────
router.delete('/account', auth, async (req, res, next) => {
    try {
        if (req.body.confirm !== 'DELETE MY ACCOUNT') {
            return res.status(400).json({
                success: false,
                message: 'Confirmation string "DELETE MY ACCOUNT" is required.',
            });
        }

        const user = await User.findById(req.userId).select('+password');

        // Password check (skip for Google-only users)
        if (user.password && !user.googleId) {
            if (!req.body.password) {
                return res.status(400).json({ success: false, message: 'Password is required to delete account.' });
            }
            const isMatch = await user.comparePassword(req.body.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Incorrect password.' });
            }
        }

        // 1. Delete all trips owned by user
        await Trip.deleteMany({ userId: req.userId });

        // 2. Remove user from all collaborator lists
        await Trip.updateMany(
            { 'collaborators.userId': req.userId },
            { $pull: { collaborators: { userId: req.userId } } }
        );

        // 3. Delete user document
        await User.findByIdAndDelete(req.userId);

        res.json({ success: true, message: 'Account deleted permanently.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
