const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initializeSocket } = require('./socket/index');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const packingListRoutes = require('./routes/packingList');
const exportRoutes = require('./routes/export');
const createCollaborateRouter = require('./routes/collaborate');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const exploreRoutes = require('./routes/explore');
const whatsappRoutes = require('./routes/whatsapp');
const emailRoutes = require('./routes/email');

// Initialize Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Make io accessible to routes via app.locals
app.locals.io = io;

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

// Stricter rate limit for AI generation endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit to 20 AI requests per 15 min
    message: {
        success: false,
        message: 'AI generation rate limit reached. Please wait before generating more trips.',
    },
});
app.use('/api/trips/generate', aiLimiter);
app.use('/api/packing-list/generate', aiLimiter);

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

// Packing list routes (Feature 1)
app.use('/api/packing-list', packingListRoutes);

// PDF export routes (Feature 2)
app.use('/api/export', exportRoutes);

// Collaboration routes (Feature 3) — pass io instance
app.use('/api/collaborate', createCollaborateRouter(io));

// Dashboard analytics routes
app.use('/api/dashboard', dashboardRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Explore / Discover destinations routes
app.use('/api/explore', exploreRoutes);

// WhatsApp trip delivery routes
app.use('/api/whatsapp', whatsappRoutes);

// Email trip delivery routes
app.use('/api/email', emailRoutes);

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

        httpServer.listen(PORT, () => {
            console.log(`\n🚀 GoTrip Pro API Server`);
            console.log(`   Port:     ${PORT}`);
            console.log(`   Mode:     ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Database: ${dbConnected ? '✅ Connected' : '⚠️  Not connected'}`);
            console.log(`   Socket:   ✅ Ready`);
            console.log(`   Health:   http://localhost:${PORT}/api/health\n`);
        });
    };

    startServer().catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
}
