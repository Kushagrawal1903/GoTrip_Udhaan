import { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * TravelStatsCard — Displays user travel stats with count-up animation
 */
export default function TravelStatsCard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/stats').then(res => {
            setStats(res.data.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Travel Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[1,2,3,4].map(i => (
                        <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const cells = [
        { label: 'Total Trips', value: stats.totalTrips, icon: '✈️' },
        { label: 'Destinations', value: stats.totalDestinations, icon: '📍' },
        { label: 'Days Planned', value: stats.totalDaysPlanned, icon: '📅' },
        { label: 'Collaborators', value: stats.totalCollaborators, icon: '👥' },
    ];

    return (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Travel Stats</h3>

            <div className="stats-grid-profile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {cells.map((cell, i) => (
                    <StatCell key={i} {...cell} />
                ))}
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ marginRight: 6 }}>🎯</span>
                    Favourite style: <strong style={{ color: 'var(--text-primary)' }}>{stats.favouriteStyle}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ marginRight: 6 }}>📆</span>
                    Member since: <strong style={{ color: 'var(--text-primary)' }}>{stats.memberSince}</strong>
                </div>
            </div>
        </div>
    );
}

function StatCell({ label, value, icon }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (value === 0) return;
        let current = 0;
        const step = Math.max(1, Math.floor(value / 30));
        const timer = setInterval(() => {
            current = Math.min(current + step, value);
            setDisplay(current);
            if (current >= value) clearInterval(timer);
        }, 25);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <div style={{
            background: 'var(--bg-primary)', borderRadius: 12,
            padding: '14px 12px', textAlign: 'center',
            border: '1px solid var(--border-color)',
        }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{display}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        </div>
    );
}
