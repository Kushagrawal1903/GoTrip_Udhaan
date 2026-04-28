const dns = require('dns');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Force Google Public DNS — fixes SRV lookup failures on networks
// whose default resolver blocks SRV record queries.
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * Cached connection for serverless environments (Vercel).
 * Prevents creating a new DB connection on every function invocation.
 */
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose
 * Uses connection caching for serverless (Vercel) environments.
 * Does NOT crash the server on failure — logs a warning and allows retry.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('⚠️  MONGODB_URI not set — database features will not work.');
      return false;
    }

    // Return cached connection if already connected
    if (cached.conn && mongoose.connection.readyState === 1) {
      return true;
    }

    // Reuse in-flight connection promise if one exists
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }

    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    return true;
  } catch (error) {
    cached.promise = null; // Reset so next invocation retries
    console.error(`⚠️  MongoDB Connection Failed: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
