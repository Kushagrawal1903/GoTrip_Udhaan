const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Generate a JWT token for a user
 * @param {string} userId - MongoDB user ID
 * @returns {string} JWT token
 */
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
}

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password.',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        // Create the user (password hashed via pre-save hook)
        const user = await User.create({ name, email, password });

        // Generate JWT
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.',
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
router.get('/me', auth, async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
            },
        },
    });
});

module.exports = router;
