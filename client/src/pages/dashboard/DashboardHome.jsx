import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useDashboardStats from '../../hooks/useDashboardStats';
import useRecentTrips from '../../hooks/useRecentTrips';
import StatCard from '../../components/dashboard/StatCard';
import TripCard from '../../components/dashboard/TripCard';
import QuickActions from '../../components/dashboard/QuickActions';
import CollaborationsPanel from '../../components/dashboard/CollaborationsPanel';
import { StatCardSkeleton, TripCardSkeleton } from '../../components/dashboard/Skeleton';

export default function DashboardHome() {
    const { user } = useAuth();
    const { searchQuery } = useOutletContext();
    const navigate = useNavigate();

    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id);
    const { data: trips = [], isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useRecentTrips(user?.id);

    // Debounced search filtering
    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 150);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const filteredTrips = useMemo(() => {
        if (!debouncedQuery) return trips;
        const q = debouncedQuery.toLowerCase();
        return trips.filter(t => t.destination.toLowerCase().includes(q));
    }, [trips, debouncedQuery]);

    const handleExportPDF = useCallback(async (tripId, destination) => {
        const token = localStorage.getItem('gotrip-token');
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiUrl}/export/pdf/${tripId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('PDF export failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GoTrip-${destination || 'Trip'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    const statCards = stats ? [
        { label: 'Total Trips', value: stats.totalTrips, subtext: stats.tripsThisMonth > 0 ? `+${stats.tripsThisMonth} this month` : 'Plan your next trip', subtextColor: stats.tripsThisMonth > 0 ? '#16a34a' : undefined },
        { label: 'Destinations', value: stats.uniqueDestinations, subtext: `Across ${stats.countriesVisited} region${stats.countriesVisited !== 1 ? 's' : ''}` },
        { label: 'Days Planned', value: stats.totalDaysPlanned, subtext: 'Total itinerary days' },
        { label: 'Collaborators', value: stats.collaboratorCount, subtext: stats.pendingInvites > 0 ? `${stats.pendingInvites} pending invites` : 'Invite travel buddies', subtextColor: stats.pendingInvites > 0 ? '#d97706' : undefined },
    ] : [];

    const showNewTripCTA = !tripsLoading && trips.length < 4;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Welcome */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>
                    Welcome back, {user?.name?.split(' ')[0] || 'Traveler'} 👋
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Here's what's happening with your travel plans.
                </p>
            </div>

            {/* Stats row */}
            <div className="stats-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16, marginBottom: 28,
            }}>
                {statsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : statsError ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: 8 }}>Failed to load stats</p>
                        <button onClick={() => refetchStats()} className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>Retry</button>
                    </div>
                ) : (
                    statCards.map((s, i) => <StatCard key={i} index={i} {...s} />)
                )}
            </div>

            {/* Main content — two columns */}
            <div className="dashboard-content" style={{
                display: 'grid', gridTemplateColumns: '1fr 340px',
                gap: 24, alignItems: 'start',
            }}>
                {/* Left — Recent trips */}
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 16,
                    }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Trips</h3>
                        {trips.length > 0 && (
                            <Link to="/dashboard/trips" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                View all →
                            </Link>
                        )}
                    </div>

                    {tripsLoading ? (
                        <div className="trips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                            {Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)}
                        </div>
                    ) : tripsError ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: 8 }}>Failed to load trips</p>
                            <button onClick={() => refetchTrips()} className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>Retry</button>
                        </div>
                    ) : trips.length === 0 ? (
                        /* Empty state */
                        <div style={{
                            textAlign: 'center', padding: '60px 24px',
                            background: 'var(--bg-card)', borderRadius: 16,
                            border: '2px dashed var(--border-color)',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">🌍</div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>
                                Ready to plan your first adventure?
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 320, margin: '0 auto 20px', lineHeight: 1.5 }}>
                                Our AI will create a personalized itinerary with hotels, budget, and day-by-day activities.
                            </p>
                            <button
                                onClick={() => navigate('/plan')}
                                className="btn-primary"
                                style={{ padding: '12px 32px', fontSize: '0.95rem' }}
                            >
                                ✨ Plan My First Trip →
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="trips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                                {filteredTrips.length > 0 ? (
                                    filteredTrips.map(trip => (
                                        <TripCard key={trip._id} trip={trip} onExportPDF={handleExportPDF} />
                                    ))
                                ) : (
                                    <div style={{
                                        gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px',
                                        background: 'var(--bg-card)', borderRadius: 12,
                                        border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: 8 }} aria-hidden="true">🔍</div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                            No trips match "{debouncedQuery}"
                                        </p>
                                    </div>
                                )}

                                {/* New trip CTA card */}
                                {showNewTripCTA && filteredTrips.length > 0 && (
                                    <div
                                        onClick={() => navigate('/plan')}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Plan a new trip"
                                        style={{
                                            borderRadius: 12, cursor: 'pointer',
                                            border: '2px dashed var(--border-color)',
                                            background: 'var(--bg-glass)',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            minHeight: 200, gap: 8, padding: 20,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(13, 148, 136, 0.04)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                                    >
                                        <span style={{ fontSize: '2rem' }} aria-hidden="true">✨</span>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>Plan a New Trip</span>
                                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>AI-powered itinerary</span>
                                    </div>
                                )}
                            </div>

                            {/* Full-width banner CTA when 4+ trips */}
                            {!showNewTripCTA && (
                                <div
                                    onClick={() => navigate('/plan')}
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        marginTop: 14, padding: '16px 20px', borderRadius: 12,
                                        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.06), rgba(20, 184, 166, 0.04))',
                                        border: '1px solid rgba(13, 148, 136, 0.15)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.15)'}
                                >
                                    <span style={{ fontSize: '1.4rem' }} aria-hidden="true">✨</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>Plan another adventure</div>
                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Get a personalized AI itinerary in seconds</div>
                                    </div>
                                    <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem' }}>→</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right column */}
                <div className="dashboard-right-col">
                    <QuickActions />
                    <CollaborationsPanel userId={user?.id} />
                </div>
            </div>
        </div>
    );
}
