import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Exports() {
    const { user } = useAuth();
    const [exporting, setExporting] = useState(null);

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', 'exportable', user?.id],
        queryFn: async () => {
            const res = await api.get('/trips');
            return res.data.data.trips || [];
        },
        enabled: !!user?.id,
    });

    const handleExport = useCallback(async (tripId, destination) => {
        setExporting(tripId);
        try {
            const token = localStorage.getItem('gotrip-token');
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const res = await fetch(`${apiUrl}/export/pdf/${tripId}`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `GoTrip-${destination}.pdf`;
            a.click(); URL.revokeObjectURL(url);
        } catch {
            alert('PDF export failed. Please try again.');
        } finally {
            setExporting(null);
        }
    }, []);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                Export any trip as a professional PDF document.
            </p>
            {isLoading ? (
                <div className="loading-dots" style={{ textAlign: 'center', padding: '40px' }}><span /><span /><span /></div>
            ) : trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '2px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">📄</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>No trips to export</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Plan a trip first, then export it as PDF.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {trips.map(trip => (
                        <div
                            key={trip._id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                                borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📄</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{trip.destination}</div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{trip.duration} days · {trip.travelStyle}</div>
                            </div>
                            <button
                                onClick={() => handleExport(trip._id, trip.destination)}
                                disabled={exporting === trip._id}
                                className="btn-primary"
                                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                            >
                                {exporting === trip._id ? 'Exporting...' : 'Export PDF'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
