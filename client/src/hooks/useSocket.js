import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * useSocket — manages Socket.io connection with JWT auth and trip room management
 * @param {string} tripId - The trip to join
 * @param {Object} handlers - Event handlers { onNewComment, onCommentUpdated, onCollaboratorRemoved }
 */
export default function useSocket(tripId, handlers = {}) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!tripId) return;

        const token = localStorage.getItem('gotrip-token');
        if (!token) return;

        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        // Strip /api suffix if present for socket connection
        const socketUrl = apiUrl.replace(/\/api\/?$/, '');

        const socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join-trip', tripId);
        });

        socket.on('new-comment', (comment) => {
            if (handlers.onNewComment) handlers.onNewComment(comment);
        });

        socket.on('comment-updated', (data) => {
            if (handlers.onCommentUpdated) handlers.onCommentUpdated(data);
        });

        socket.on('collaborator-removed', (data) => {
            if (handlers.onCollaboratorRemoved) handlers.onCollaboratorRemoved(data);
        });

        socket.on('connect_error', () => {
            // Socket connection failed — non-critical, collaboration just won't be real-time
        });

        return () => {
            socket.emit('leave-trip', tripId);
            socket.off('new-comment');
            socket.off('comment-updated');
            socket.off('collaborator-removed');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [tripId]); // Only reconnect if tripId changes

    return socketRef;
}
