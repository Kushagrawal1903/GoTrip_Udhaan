import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * useCollaboration — manages collaborators, comments, and invite actions
 * @param {string} tripId - Trip ID
 * @param {boolean} isOwner - Whether the current user owns the trip
 */
export default function useCollaboration(tripId, isOwner = false) {
    const [collaborators, setCollaborators] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const clearError = () => setTimeout(() => setError(''), 4000);

    const fetchCollaborators = useCallback(async () => {
        if (!tripId) return;
        try {
            const res = await api.get(`/collaborate/${tripId}/collaborators`);
            setCollaborators(res.data.data.collaborators || []);
        } catch (err) {
            // Non-critical — silently fail
        }
    }, [tripId]);

    const inviteByEmail = useCallback(async (email, role = 'viewer') => {
        setError('');
        try {
            const res = await api.post('/collaborate/invite', { tripId, email, role });
            setCollaborators(res.data.data.collaborators || []);
            return { success: true, message: res.data.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send invite.';
            setError(msg);
            clearError();
            return { success: false, message: msg };
        }
    }, [tripId]);

    const generateInviteLink = useCallback(async (role = 'viewer') => {
        setError('');
        try {
            const res = await api.post('/collaborate/invite/link', { tripId, role });
            return res.data.data.inviteUrl;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate invite link.';
            setError(msg);
            clearError();
            return null;
        }
    }, [tripId]);

    const removeCollaborator = useCallback(async (collaboratorId) => {
        try {
            const res = await api.delete('/collaborate/remove', {
                data: { tripId, collaboratorId },
            });
            setCollaborators(res.data.data.collaborators || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove collaborator.');
            clearError();
        }
    }, [tripId]);

    const addComment = useCallback(async (dayIndex, timeSlot, text, suggestion = '') => {
        setError('');
        try {
            const res = await api.post('/collaborate/comment', {
                tripId, dayIndex, timeSlot, text,
                ...(suggestion ? { suggestion } : {}),
            });
            // Don't add to local state — Socket.io will handle it
            return res.data.data.comment;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add comment.');
            clearError();
            return null;
        }
    }, [tripId]);

    const handleComment = useCallback(async (commentId, action) => {
        try {
            const res = await api.patch(`/collaborate/comment/${commentId}`, {
                tripId, action,
            });
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update comment.');
            clearError();
            return null;
        }
    }, [tripId]);

    // Socket.io event handlers
    const onNewComment = useCallback((comment) => {
        setComments(prev => {
            // Prevent duplicates
            if (prev.some(c => c._id === comment._id)) return prev;
            return [...prev, comment];
        });
    }, []);

    const onCommentUpdated = useCallback(({ commentId, status }) => {
        setComments(prev => prev.map(c => c._id === commentId ? { ...c, status } : c));
    }, []);

    return {
        collaborators,
        comments,
        setComments,
        loading,
        error,
        fetchCollaborators,
        inviteByEmail,
        generateInviteLink,
        removeCollaborator,
        addComment,
        handleComment,
        onNewComment,
        onCommentUpdated,
    };
}
