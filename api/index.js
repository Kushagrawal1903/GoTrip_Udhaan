const connectDB = require('../server/config/db');
const app = require('../server/server');

/**
 * Vercel Serverless Function entry point.
 * Connects to MongoDB (cached) and delegates all /api/* routes to Express.
 */
let isConnected = false;

module.exports = async (req, res) => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
    return app(req, res);
};
