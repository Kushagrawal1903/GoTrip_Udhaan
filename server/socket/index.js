const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

/**
 * Initialize Socket.io on the HTTP server
 * @param {Object} httpServer - Node.js HTTP server instance
 * @returns {Object} Socket.io server instance
 */
function initializeSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            credentials: true,
        },
    });

    // Authenticate socket connections using JWT
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('join-trip', (tripId) => {
            if (tripId) {
                socket.join(`trip:${tripId}`);
            }
        });

        socket.on('leave-trip', (tripId) => {
            if (tripId) {
                socket.leave(`trip:${tripId}`);
            }
        });

        socket.on('disconnect', () => {
            // Cleanup handled automatically by Socket.io
        });
    });

    return io;
}

module.exports = { initializeSocket };
