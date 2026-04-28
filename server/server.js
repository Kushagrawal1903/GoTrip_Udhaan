const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

// Initialize Express app
const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────────────

// CORS — allow frontend origin
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Rate limiting — prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});
app.use('/api/', limiter);

// Stricter rate limit for AI generation endpoint
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit to 20 AI requests per 15 min
    message: {
        success: false,
        message: 'AI generation rate limit reached. Please wait before generating more trips.',
    },
});
app.use('/api/trips/generate', aiLimiter);

// ─── ROUTES ─────────────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GoTrip Pro API is running!',
        timestamp: new Date().toISOString(),
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Trip routes
app.use('/api/trips', tripRoutes);

// ─── ERROR HANDLING ─────────────────────────────────────────

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
    });
});

// Global error handler
app.use(errorHandler);

// ─── EXPORT FOR VERCEL SERVERLESS ───────────────────────────
module.exports = app;

// ─── START SERVER (local dev only) ──────────────────────────

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    const startServer = async () => {
        const dbConnected = await connectDB();

        app.listen(PORT, () => {
            console.log(`\n🚀 GoTrip Pro API Server`);
            console.log(`   Port:     ${PORT}`);
            console.log(`   Mode:     ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Database: ${dbConnected ? '✅ Connected' : '⚠️  Not connected'}`);
            console.log(`   Health:   http://localhost:${PORT}/api/health\n`);
        });
    };

    startServer().catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
}
