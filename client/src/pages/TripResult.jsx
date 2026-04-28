import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ItineraryView from '../components/trip/ItineraryView';
import { TripSkeleton } from '../components/ui/Skeleton';
import ErrorAlert from '../components/ui/ErrorAlert';

/**
 * TripResult — view a single saved trip from the database
 */
export default function TripResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/trips/${id}`);
                setTrip(res.data.data.trip);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load trip.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: '40px 24px' }}>
                <TripSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 24px' }}>
                <ErrorAlert message={error} onRetry={() => window.location.reload()} />
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/dashboard" className="btn-outline" style={{ textDecoration: 'none' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!trip) return null;

    const placeDetails = {
        photoUrl: trip.destinationImage,
        coordinates: trip.coordinates,
    };

    return (
        <div className="animate-fade-in-up" style={{ padding: '40px 24px' }}>
            {/* Back + Re-generate buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: 1000,
                margin: '0 auto 24px',
                flexWrap: 'wrap',
                gap: 10,
            }}>
                <Link to="/dashboard" style={{
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: 'rgba(13, 148, 136, 0.06)',
                    border: '1px solid rgba(13, 148, 136, 0.12)',
                    transition: 'all 0.2s',
                }}>
                    ← Back to My Trips
                </Link>
                <button
                    className="btn-outline"
                    onClick={() => navigate('/plan')}
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                    Plan New Trip
                </button>
            </div>

            {/* Trip Content */}
            <ItineraryView
                tripData={trip.tripData}
                placeDetails={placeDetails}
            />
        </div>
    );
}
