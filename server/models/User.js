const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores user credentials with hashed passwords
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        // ─── Profile fields ─────────────────────────────────
        firstName: { type: String, trim: true, maxlength: 50 },
        lastName: { type: String, trim: true, maxlength: 50 },
        phone: { type: String, trim: true },
        bio: { type: String, maxlength: 300 },
        location: { type: String, trim: true, maxlength: 100 },
        avatarUrl: { type: String, default: null },
        avatarInitials: { type: String, default: null },

        // ─── Preferences ────────────────────────────────────
        preferences: {
            defaultStyle: {
                type: String,
                enum: ['adventure', 'relaxation', 'cultural', 'family', 'romantic'],
                default: 'adventure',
            },
            defaultBudget: {
                type: String,
                enum: ['low', 'mid', 'high'],
                default: 'mid',
            },
            currency: { type: String, default: 'INR' },
        },

        // ─── Notification preferences ───────────────────────
        notifications: {
            email: {
                tripReminders: { type: Boolean, default: true },
                collaborationActivity: { type: Boolean, default: true },
                inviteAccepted: { type: Boolean, default: true },
                productUpdates: { type: Boolean, default: false },
            },
            whatsapp: {
                dailyDigest: { type: Boolean, default: true },
                preTripReminder: { type: Boolean, default: true },
                weatherAlerts: { type: Boolean, default: false },
            },
            digestTime: { type: String, default: '07:30' },
            timezone: { type: String, default: 'Asia/Kolkata' },
        },

        // ─── Privacy ────────────────────────────────────────
        privacy: {
            publicProfile: { type: Boolean, default: true },
            showOnExploreFeed: { type: Boolean, default: false },
            activityAnalytics: { type: Boolean, default: true },
        },

        // ─── Account ────────────────────────────────────────
        plan: { type: String, enum: ['free', 'pro'], default: 'free' },
        planExpiresAt: { type: Date, default: null },
        whatsappOptIn: { type: Boolean, default: false },

        // ─── Travel Passport ────────────────────────────────
        passport: {
            travelPersonality: {
                emoji: String,
                label: String,
                emotionalTone: String,
                description: String,
            },
            memories: [{
                tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
                memoryCapsule: String,
                memoryMood: {
                    emoji: String,
                    label: String,
                },
                favoriteExperience: String,
                favoriteMoment: String,
                isCoreMemory: { type: Boolean, default: false },
                stampColor: String,
                generatedAt: Date,
            }],
            reflectionSummary: String,
            generatedAt: Date,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Pre-save hook to hash password before storing
 */
userSchema.pre('save', async function (next) {
    // Only hash if password was modified
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Compare entered password with hashed password in DB
 * @param {string} candidatePassword - The password to compare
 * @returns {boolean} Whether the passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
