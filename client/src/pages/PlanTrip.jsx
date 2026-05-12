import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TripForm from '../components/trip/TripForm';
import { TripSkeleton } from '../components/ui/Skeleton';
import ErrorAlert from '../components/ui/ErrorAlert';

/**
 * PlanTrip — main trip generator page
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
        <div style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto' }}>
            {/* Page Header */}
            {!loading && (
                <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 36 }}>
                    <h1 style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                        marginBottom: 8,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                    }}>
                        Plan Your Trip
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        maxWidth: 480,
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        Tell us where you want to go — our AI will craft a personalized
                        day-by-day itinerary with hotels, budget, and maps.
                    </p>
                </div>
            )}

            {/* Trip Form */}
            {!loading && (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <TripForm onSubmit={handleGenerate} loading={loading} />
                </div>
            )}

            {/* Loading */}
            {loading && <TripSkeleton />}

            {/* Error */}
            {error && (
                <ErrorAlert
                    message={error}
                    onRetry={() => { setError(''); }}
                />
            )}
        </div>
    );
}
