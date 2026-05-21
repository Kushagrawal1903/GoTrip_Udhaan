import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function usePassport() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const fetchPassport = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/passport');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch passport.');
        } finally {
            setLoading(false);
        }
    }, []);

    const generatePassport = useCallback(async () => {
        setGenerating(true);
        setError('');
        try {
            const res = await api.post('/passport/generate');
            if (res.data.success) {
                // Fetch the updated passport data after generation
                await fetchPassport();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate passport memories.');
        } finally {
            setGenerating(false);
        }
    }, [fetchPassport]);

    const updateFavoriteMoment = useCallback(async (tripId, momentText) => {
        try {
            const res = await api.patch(`/passport/memory/${tripId}`, { favoriteMoment: momentText });
            if (res.data.success) {
                setData(prev => {
                    if (!prev || !prev.trips) return prev;
                    return {
                        ...prev,
                        trips: prev.trips.map(t => 
                            t.tripId === tripId ? { ...t, favoriteMoment: momentText } : t
                        )
                    };
                });
            }
        } catch (err) {
            console.error('Failed to update favorite moment', err);
        }
    }, []);

    useEffect(() => {
        fetchPassport();
    }, [fetchPassport]);

    return {
        data,
        loading,
        generating,
        error,
        generatePassport,
        updateFavoriteMoment
    };
}
