import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useTravelRecommendations(tripId, trip, setTrip) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Automatically trigger recommendation generation if trip has origins but no recommendations are generated yet
    useEffect(() => {
        if (!tripId || !trip || !trip.hasOrigins) return;

        const hasRecommendations = Array.isArray(trip.travelRecommendations) && trip.travelRecommendations.length > 0;
        const travelersWithOrigins = Array.isArray(trip.travelers) 
            ? trip.travelers.filter(t => t.origin && t.origin.trim().length > 0)
            : [];

        if (!hasRecommendations && travelersWithOrigins.length > 0 && !loading && !error) {
            generateRecommendations();
        }
    }, [tripId, trip]);

    const generateRecommendations = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post(`/trips/${tripId}/generate-travel-recommendations`);
            if (res.data.success) {
                const { travelRecommendations, meetingPlan, travelOptimizeFor } = res.data.data;
                setTrip(prev => ({
                    ...prev,
                    travelRecommendations,
                    meetingPlan,
                    travelOptimizeFor
                }));
            } else {
                setError(res.data.message || 'Failed to generate recommendations.');
            }
        } catch (err) {
            console.error('Error generating travel recommendations:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred during recommendation generation.');
        } finally {
            setLoading(false);
        }
    };

    const optimizeTravel = async (optimizeFor) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.patch(`/trips/${tripId}/travel-optimize`, { optimizeFor });
            if (res.data.success) {
                const { travelRecommendations, meetingPlan, travelOptimizeFor } = res.data.data;
                setTrip(prev => ({
                    ...prev,
                    travelRecommendations,
                    meetingPlan,
                    travelOptimizeFor
                }));
                return true;
            } else {
                setError(res.data.message || 'Failed to update travel optimization.');
                return false;
            }
        } catch (err) {
            console.error('Error updating travel optimization:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred while optimizing.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        optimizeTravel,
        refetch: generateRecommendations
    };
}
