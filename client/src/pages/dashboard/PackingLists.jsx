import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PackingLists() {
    const { user } = useAuth();
    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', 'withPacking', user?.id],
        queryFn: async () => {
            const res = await api.get('/trips');
            return (res.data.data.trips || []).filter(t => t.packingList?.categories?.length > 0);
        },
        enabled: !!user?.id,
    });

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                Trips with AI-generated packing lists.
            </p>
            {isLoading ? (
                <div className="loading-dots" style={{ textAlign: 'center', padding: '40px' }}><span /><span /><span /></div>
            ) : trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '2px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">🧳</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>No packing lists yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generate a packing list from any trip detail page.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {trips.map(trip => (
                        <Link
                            key={trip._id}
                            to={`/trip/${trip._id}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                                borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                textDecoration: 'none', transition: 'box-shadow 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">🧳</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{trip.destination}</div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                    {trip.packingList.categories.length} categories · {trip.duration} day trip
                                </div>
                            </div>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.82rem' }}>View →</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
