const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token from the Authorization header
 * and attaches the user object to req.user
 */
const auth = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user and attach to request
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but user no longer exists.',
            });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error.',
        });
    }
};

module.exports = auth;
