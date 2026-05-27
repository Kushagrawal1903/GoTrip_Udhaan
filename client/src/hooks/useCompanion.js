import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook to manage the AI Travel Companion session
 */
export default function useCompanion(tripId, trip, setTrip) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentPatch, setCurrentPatch] = useState(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    /**
     * Load chat history from the backend
     */
    const loadHistory = useCallback(async () => {
        if (!tripId || historyLoaded) return;
        try {
            const res = await api.get(`/companion/${tripId}/history`);
            if (res.data.success && res.data.data.messages) {
                setMessages(res.data.data.messages);
            }
            setHistoryLoaded(true);
        } catch (err) {
            console.error('Failed to load companion history:', err);
        }
    }, [tripId, historyLoaded]);

    /**
     * Send a message to the AI Companion
     */
    const sendMessage = async (text) => {
        if (!text.trim() || !tripId) return;

        const userMsg = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        setError(null);
        setCurrentPatch(null); // Clear pending patch

        try {
            const res = await api.post(`/companion/${tripId}/message`, { message: text });
            
            if (res.data.success) {
                const { message, diffPreview } = res.data.data;
                setMessages((prev) => [...prev, message]);
                setCurrentPatch(diffPreview);
            } else {
                throw new Error(res.data.message || 'Failed to get response');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
            // Add a synthetic error message to chat
            setMessages((prev) => [
                ...prev,
                {
                    role: 'system',
                    content: 'Sorry, I ran into an issue refining your trip. Please try again.',
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Apply a pending patch
     */
    const applyPatch = async (patchId) => {
        if (!patchId || !tripId) return false;
        
        try {
            const res = await api.post(`/companion/${tripId}/apply`, { patchId });
            if (res.data.success) {
                setTrip((prev) => ({
                    ...prev,
                    tripData: res.data.data.tripData,
                }));
                setCurrentPatch(null); // Clear preview after applying
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply changes');
            return false;
        }
    };

    /**
     * Undo a previously applied patch
     */
    const undoPatch = async (patchId) => {
        if (!patchId || !tripId) return false;

        try {
            const res = await api.post(`/companion/${tripId}/undo`, { patchId });
            if (res.data.success) {
                setTrip((prev) => ({
                    ...prev,
                    tripData: res.data.data.tripData,
                }));
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to undo changes');
            return false;
        }
    };

    return {
        messages,
        loading,
        error,
        isOpen,
        setIsOpen,
        currentPatch,
        setCurrentPatch,
        sendMessage,
        applyPatch,
        undoPatch,
        loadHistory,
    };
}
