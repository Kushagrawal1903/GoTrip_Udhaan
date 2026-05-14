import { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * BadgesCard — Shows earned and locked achievement badges
 */
export default function BadgesCard() {
    const [badges, setBadges] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/badges').then(res => {
            setBadges(res.data.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
                </div>
            </div>
        );
    }

    if (!badges) return null;

    return (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                Achievements
                {badges.earned.length > 0 && (
                    <span style={{
                        marginLeft: 8, fontSize: '0.72rem', fontWeight: 600,
                        padding: '2px 8px', borderRadius: 6,
                        background: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-primary)',
                    }}>{badges.earned.length} earned</span>
                )}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Earned badges */}
                {badges.earned.map(b => (
                    <div key={b.id} className="badge-tooltip-wrap" style={{
                        position: 'relative', padding: '12px 10px', borderRadius: 12,
                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                        textAlign: 'center', cursor: 'default',
                        transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{b.emoji}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{b.description}</div>
                    </div>
                ))}

                {/* Locked badges */}
                {badges.locked.map(b => (
                    <div key={b.id} style={{
                        position: 'relative', padding: '12px 10px', borderRadius: 12,
                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                        textAlign: 'center', opacity: 0.45, cursor: 'default',
                    }}>
                        <div style={{ position: 'absolute', top: 4, right: 6, fontSize: '0.7rem' }}>🔒</div>
                        <div style={{ fontSize: '1.4rem', marginBottom: 4, filter: 'grayscale(1)' }}>{b.emoji}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{b.description}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: 4 }}>{b.progress}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
