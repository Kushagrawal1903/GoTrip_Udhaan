import { useState, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * useWhatsApp — Custom hook for sending trip details via WhatsApp.
 * Manages modal state, API call lifecycle, and duplicate-click prevention.
 *
 * @param {string} tripId - The trip's MongoDB _id
 * @returns {Object} Hook state and handlers
 */
export default function useWhatsApp(tripId) {
    const [isOpen, setIsOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const sendingRef = useRef(false); // Prevent duplicate clicks

    /**
     * Open the WhatsApp modal, resetting previous state.
     */
    const open = useCallback(() => {
        setError('');
        setSuccess('');
        setSending(false);
        sendingRef.current = false;
        setIsOpen(true);
    }, []);

    /**
     * Close the modal.
     */
    const close = useCallback(() => {
        if (sendingRef.current) return; // Don't close while sending
        setIsOpen(false);
        // Reset after close animation
        setTimeout(() => {
            setError('');
            setSuccess('');
        }, 300);
    }, []);

    /**
     * Send the trip to the given phone number via the backend API.
     * @param {string} phoneNumber - Cleaned phone number (digits only)
     */
    const send = useCallback(async (phoneNumber) => {
        // Guard against duplicate clicks
        if (sendingRef.current) return;
        sendingRef.current = true;

        setSending(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.post('/whatsapp/send-trip', {
                phoneNumber,
                tripId,
            });

            if (res.data.success) {
                setSuccess(res.data.message || 'Trip sent to WhatsApp successfully!');
            } else {
                setError(res.data.message || 'Failed to send trip. Please try again.');
            }
        } catch (err) {
            const msg = err.response?.data?.message
                || err.message
                || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setSending(false);
            sendingRef.current = false;
        }
    }, [tripId]);

    return {
        isOpen,
        sending,
        error,
        success,
        open,
        close,
        send,
    };
}
