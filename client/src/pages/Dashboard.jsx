import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import ErrorAlert from '../components/ui/ErrorAlert';

const BUDGET_COLORS = {
    low: '#16a34a',
    moderate: '#d97706',
    premium: '#e11d48',
};

const STYLE_ICONS = {
    adventure: '🏔️',
    relaxation: '🏖️',
    cultural: '🏛️',
    family: '👨‍👩‍👧‍👦',
    romantic: '💕',
};

const CARD_FALLBACK = '#0d9488';

/**
 * TripCard — single dashboard trip card
 */
function TripCard({ trip, index, onDelete, deleting, onView }) {
    const [imgFailed, setImgFailed] = useState(false);
    const hasImage = trip.destinationImage && !imgFailed;

    return (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Card Header with image/fallback */}
            <div style={{
                height: 140,
                position: 'relative',
                background: CARD_FALLBACK,
                overflow: 'hidden',
            }}>
                {hasImage && (
                    <img
                        src={trip.destinationImage}
                        alt={trip.destination}
                        onError={() => setImgFailed(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                )}
                {!hasImage && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2.2rem', opacity: 0.6 }}>🌍</span>
                    </div>
                )}
                {/* Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }} />
                <h3 style={{
                    position: 'absolute',
                    bottom: 14, left: 16, right: 16,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#fff',
                    zIndex: 1,
                }}>
                    {trip.destination}
                </h3>
            </div>

            {/* Card Body */}
            <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.76rem', fontWeight: 600,
                        background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488',
                    }}>
                        {trip.duration} days
                    </span>
                    <span style={{
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.76rem', fontWeight: 600,
                        background: `${BUDGET_COLORS[trip.budget] || '#0d9488'}12`,
                        color: BUDGET_COLORS[trip.budget] || '#0d9488',
                        textTransform: 'capitalize',
                    }}>
                        {trip.budget}
                    </span>
                    <span style={{
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.76rem', fontWeight: 600,
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        textTransform: 'capitalize',
                    }}>
                        {STYLE_ICONS[trip.travelStyle] || '🌍'} {trip.travelStyle}
                    </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 12, marginTop: 'auto' }}>
                    Created {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric',
                    })}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn-primary"
                        onClick={() => onView(trip._id)}
                        style={{ flex: 1, padding: '9px', fontSize: '0.85rem' }}
                    >
                        View Details
                    </button>
                    <button
                        className="btn-danger"
                        onClick={() => onDelete(trip._id)}
                        disabled={deleting}
                        style={{ padding: '9px 14px', fontSize: '0.85rem' }}
                    >
                        {deleting ? '...' : '🗑️'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Dashboard — user's saved trips
 */
export default function Dashboard() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await api.get('/trips');
            setTrips(res.data.data.trips);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load trips.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (tripId) => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        setDeleting(tripId);
        try {
            await api.delete(`/trips/${tripId}`);
            setTrips((prev) => prev.filter((t) => t._id !== tripId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete trip.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div style={{ padding: '40px 24px', maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div className="animate-fade-in-up" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 32, flexWrap: 'wrap', gap: 16,
            }}>
                <div>
                    <h1 style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
                        marginBottom: 4,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em',
                    }}>
                        My Trips
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {trips.length > 0 ? `${trips.length} saved trip${trips.length > 1 ? 's' : ''}` : 'No saved trips yet'}
                    </p>
                </div>
                <Link to="/plan" className="btn-primary" style={{ textDecoration: 'none' }}>
                    Plan New Trip
                </Link>
            </div>

            {error && <ErrorAlert message={error} onRetry={fetchTrips} />}

            {/* Loading */}
            {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={260} borderRadius={12} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && trips.length === 0 && !error && (
                <div className="animate-bounce-in" style={{
                    textAlign: 'center', padding: '80px 20px',
                }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.5 }}>🌍</div>
                    <h2 style={{
                        fontWeight: 700,
                        fontSize: '1.4rem',
                        marginBottom: 8,
                    }}>
                        No Trips Yet
                    </h2>
                    <p style={{
                        color: 'var(--text-muted)',
                        marginBottom: 24,
                        maxWidth: 380,
                        margin: '0 auto 24px',
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                    }}>
                        Start by creating your first AI-powered trip plan — it only takes 30 seconds!
                    </p>
                    <Link to="/plan" className="btn-primary" style={{
                        textDecoration: 'none',
                        padding: '14px 36px',
                        fontSize: '1rem',
                    }}>
                        Create Your First Trip
                    </Link>
                </div>
            )}

            {/* Trips Grid */}
            {!loading && trips.length > 0 && (
                <div
                    className="stagger-children"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 18,
                    }}
                >
                    {trips.map((trip, index) => (
                        <TripCard
                            key={trip._id}
                            trip={trip}
                            index={index}
                            onDelete={handleDelete}
                            deleting={deleting === trip._id}
                            onView={(id) => navigate(`/trip/${id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
