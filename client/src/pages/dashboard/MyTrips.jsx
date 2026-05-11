import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TripCard from '../../components/dashboard/TripCard';
import { TripCardSkeleton } from '../../components/dashboard/Skeleton';

export default function MyTrips() {
    const { user } = useAuth();
    const { searchQuery } = useOutletContext();
    const navigate = useNavigate();

    const { data: trips = [], isLoading, error, refetch } = useQuery({
        queryKey: ['allTrips', user?.id],
        queryFn: async () => {
            const res = await api.get('/dashboard/recent-trips');
            return res.data.data;
        },
        enabled: !!user?.id,
    });

    // Also fetch full trip list
    const { data: allTrips = [] } = useQuery({
        queryKey: ['trips', 'all', user?.id],
        queryFn: async () => {
            const res = await api.get('/trips');
            return (res.data.data.trips || []).map(t => ({
                _id: t._id,
                destination: t.destination,
                duration: t.duration,
                travelers: t.travelers || 1,
                style: t.travelStyle || 'adventure',
                budget: t.budget || 'moderate',
                hasPackingList: !!(t.packingList?.categories?.length > 0),
                collaboratorCount: (t.collaborators || []).filter(c => c.status === 'accepted').length,
                destinationImage: t.destinationImage || null,
                isOwner: t.userId?.toString() === user?.id,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
            }));
        },
        enabled: !!user?.id,
    });

    const displayTrips = allTrips.length > 0 ? allTrips : trips;

    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 150);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const filtered = useMemo(() => {
        if (!debouncedQuery) return displayTrips;
        const q = debouncedQuery.toLowerCase();
        return displayTrips.filter(t => t.destination.toLowerCase().includes(q));
    }, [displayTrips, debouncedQuery]);

    const handleExportPDF = useCallback(async (tripId, destination) => {
        const token = localStorage.getItem('gotrip-token');
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiUrl}/export/pdf/${tripId}`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('PDF export failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `GoTrip-${destination || 'Trip'}.pdf`;
        a.click(); URL.revokeObjectURL(url);
    }, []);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                All your planned trips in one place.
            </p>

            {isLoading ? (
                <div className="trips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {Array.from({ length: 6 }).map((_, i) => <TripCardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '2px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">🌍</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>
                        {debouncedQuery ? `No trips match "${debouncedQuery}"` : 'No trips yet'}
                    </h3>
                    {!debouncedQuery && (
                        <button onClick={() => navigate('/plan')} className="btn-primary" style={{ padding: '12px 32px', marginTop: 12 }}>
                            ✨ Plan Your First Trip
                        </button>
                    )}
                </div>
            ) : (
                <div className="trips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {filtered.map(trip => (
                        <TripCard key={trip._id} trip={trip} onExportPDF={handleExportPDF} />
                    ))}
                </div>
            )}
        </div>
    );
}
