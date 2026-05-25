import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TripWizard from '../components/trip/TripWizard';

/**
 * PlanTrip — cinematic 5-step trip wizard
 */
export default function PlanTrip() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (data) => {
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/trips/generate', data);
            
            // Auto-save the trip to enable export/collaboration/packing features
            const saveRes = await api.post('/trips/save', {
                destination: data.destination,
                duration: data.duration,
                budget: data.budget,
                travelStyle: data.travelStyle,
                travelers: data.travelers,
                tripData: res.data.data.tripData,
                destinationImage: res.data.data.placeDetails?.photoUrl || null,
                coordinates: res.data.data.placeDetails?.coordinates || null,
                hasOrigins: Array.isArray(data.travelers) && data.travelers.some(t => t.origin && t.origin.trim().length > 0),
                travelOptimizeFor: 'balanced',
            });
            
            // Redirect to the trip result page with all features
            navigate(`/trip/${saveRes.data.data.trip._id}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate trip. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TripWizard
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
        />
    );
}
