import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useNotificationCount, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications';

const TYPE_ICONS = {
    collab_invite: '📨',
    collab_accepted: '✅',
    comment_added: '💬',
    trip_shared: '🔗',
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown({ userId }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    const { data: count = 0 } = useNotificationCount(userId);
    const { data: notifications = [], isLoading } = useNotifications(userId);
    const markRead = useMarkRead(userId);
    const markAllRead = useMarkAllRead(userId);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleClick = (n) => {
        if (!n.read) markRead.mutate(n._id);
        if (n.type === 'collab_invite' && n.shareToken) {
            navigate(`/join/${n.shareToken}`);
        } else if (n.tripId) {
            navigate(`/trip/${n.tripId}`);
        }
        setOpen(false);
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(v => !v)}
                aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
                style={{
                    width: 38, height: 38, borderRadius: 8,
                    border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.05rem', position: 'relative', color: 'var(--text-primary)',
                }}
            >
                🔔
                {count > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 18, height: 18, borderRadius: 9,
                        background: '#dc2626', color: '#fff',
                        fontSize: '0.6rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', border: '2px solid var(--bg-secondary)',
                    }}>{count > 9 ? '9+' : count}</span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 360, maxHeight: 420, borderRadius: 12,
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-xl)', overflow: 'hidden', zIndex: 200,
                    display: 'flex', flexDirection: 'column',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderBottom: '1px solid var(--border-color)',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Notifications</span>
                        {count > 0 && (
                            <button
                                onClick={() => markAllRead.mutate()}
                                style={{
                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                    fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-primary)',
                                }}
                            >Mark all read</button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} style={{ padding: '14px 16px', display: 'flex', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-glass)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: 12, width: '80%', background: 'var(--bg-glass)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                        <div style={{ height: 10, width: '40%', background: 'var(--bg-glass)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.slice(0, 8).map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => handleClick(n)}
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        display: 'flex', gap: 10, padding: '12px 16px',
                                        cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
                                        background: n.read ? 'transparent' : 'rgba(13, 148, 136, 0.03)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(13, 148, 136, 0.03)'}
                                >
                                    <span style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: 'var(--bg-glass)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', flexShrink: 0,
                                    }} aria-hidden="true">{TYPE_ICONS[n.type] || '📌'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: '0.82rem', fontWeight: n.read ? 400 : 600,
                                            color: 'var(--text-primary)', lineHeight: 1.4,
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                        }}>{n.message}</p>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>
                                    {!n.read && (
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                            background: 'var(--color-primary)', marginTop: 6,
                                        }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
