import { useState } from 'react';

const ROLE_COLORS = { viewer: '#3b82f6', editor: '#d97706' };
const STATUS_COLORS = { pending: '#f59e0b', accepted: '#16a34a', declined: '#dc2626' };

/**
 * CollaboratorPanel — slide-in side panel for sharing and commenting
 */
export default function CollaboratorPanel({
    isOpen, onClose, isOwner, tripId, tripData,
    collaborators, comments,
    onInvite, onGenerateLink, onRemove, onAddComment, onHandleComment,
    error,
}) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteMsg, setInviteMsg] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [commentFilter, setCommentFilter] = useState('all');
    const [commentForm, setCommentForm] = useState({ dayIndex: 0, timeSlot: 'Morning', text: '', suggestion: '' });
    const [commentLoading, setCommentLoading] = useState(false);

    if (!isOpen) return null;

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviteLoading(true);
        setInviteMsg('');
        const result = await onInvite(inviteEmail.trim(), inviteRole);
        setInviteMsg(result.message);
        if (result.success) setInviteEmail('');
        setInviteLoading(false);
        setTimeout(() => setInviteMsg(''), 3000);
    };

    const handleCopyLink = async () => {
        const url = await onGenerateLink(inviteRole);
        if (url) {
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentForm.text.trim()) return;
        setCommentLoading(true);
        await onAddComment(commentForm.dayIndex, commentForm.timeSlot, commentForm.text, commentForm.suggestion);
        setCommentForm(prev => ({ ...prev, text: '', suggestion: '' }));
        setCommentLoading(false);
    };

    const filteredComments = comments.filter(c => {
        if (commentFilter === 'all') return true;
        return c.status === commentFilter;
    });

    // Group comments by day
    const commentsByDay = {};
    for (const c of filteredComments) {
        const key = `Day ${(c.dayIndex || 0) + 1}`;
        if (!commentsByDay[key]) commentsByDay[key] = [];
        commentsByDay[key].push(c);
    }

    const totalDays = tripData?.itinerary?.length || 1;

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                aria-label="Close collaborator panel"
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
                    zIndex: 998, cursor: 'pointer',
                }}
            />
            {/* Panel */}
            <div className="animate-slide-right" style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(420px, 90vw)', background: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border-color)',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
                zIndex: 999, display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 22px', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>👥 Collaborate</h3>
                    <button
                        onClick={onClose}
                        aria-label="Close panel"
                        style={{
                            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                            color: 'var(--text-muted)',
                        }}
                    >✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                            background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
                            color: '#dc2626', fontSize: '0.82rem',
                        }}>{error}</div>
                    )}

                    {/* ─── SECTION 1: SHARE ─── */}
                    {isOwner && (
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Share Trip</h4>

                            {/* Invite by email */}
                            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="Enter email address"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    required
                                    style={{ flex: 1, minWidth: 160, padding: '10px 12px', fontSize: '0.85rem' }}
                                />
                                <select
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value)}
                                    aria-label="Collaborator role"
                                    style={{
                                        padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border-color)',
                                        background: 'var(--bg-input)', color: 'var(--text-primary)',
                                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                </select>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={inviteLoading}
                                    style={{ padding: '10px 18px', fontSize: '0.82rem' }}
                                >
                                    {inviteLoading ? '...' : 'Invite'}
                                </button>
                            </form>
                            {inviteMsg && (
                                <p style={{ fontSize: '0.78rem', color: inviteMsg.includes('success') ? '#16a34a' : '#dc2626', marginBottom: 8 }}>
                                    {inviteMsg}
                                </p>
                            )}

                            {/* Copy invite link */}
                            <button
                                onClick={handleCopyLink}
                                aria-label="Copy invite link"
                                style={{
                                    width: '100%', padding: '10px', borderRadius: 8,
                                    border: '1.5px solid var(--border-color)', background: 'var(--bg-card)',
                                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 6, transition: 'all 0.2s',
                                }}
                            >
                                {linkCopied ? '✓ Copied!' : '🔗 Copy Invite Link'}
                            </button>
                        </div>
                    )}

                    {/* Collaborators list */}
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10 }}>
                            Team ({collaborators.length})
                        </h4>
                        {collaborators.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                No collaborators yet. {isOwner ? 'Invite someone above!' : ''}
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {collaborators.map((c, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 12px', borderRadius: 8,
                                        background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                                    }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'var(--color-primary)', color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {(c.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {c.email}
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                                <span style={{
                                                    fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px',
                                                    borderRadius: 3, background: `${ROLE_COLORS[c.role] || '#666'}15`,
                                                    color: ROLE_COLORS[c.role] || '#666', textTransform: 'capitalize',
                                                }}>
                                                    {c.role}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px',
                                                    borderRadius: 3, background: `${STATUS_COLORS[c.status] || '#666'}15`,
                                                    color: STATUS_COLORS[c.status] || '#666', textTransform: 'capitalize',
                                                }}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                        {isOwner && c.userId && (
                                            <button
                                                onClick={() => onRemove(c.userId.toString ? c.userId.toString() : c.userId)}
                                                aria-label={`Remove ${c.email}`}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 6,
                                                    border: '1px solid rgba(220,38,38,0.2)',
                                                    background: 'rgba(220,38,38,0.06)',
                                                    color: '#dc2626', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                                                }}
                                            >✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── SECTION 2: COMMENTS ─── */}
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10 }}>Comments</h4>

                        {/* Filter tabs */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                            {['all', 'open', 'accepted', 'dismissed'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setCommentFilter(filter)}
                                    style={{
                                        padding: '5px 12px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600,
                                        border: commentFilter === filter ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-color)',
                                        background: commentFilter === filter ? 'var(--color-primary)' : 'var(--bg-card)',
                                        color: commentFilter === filter ? '#fff' : 'var(--text-secondary)',
                                        cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                                    }}
                                >{filter}</button>
                            ))}
                        </div>

                        {/* Comments grouped by day */}
                        {Object.keys(commentsByDay).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>
                                No comments yet. Be the first to add one!
                            </p>
                        ) : (
                            Object.entries(commentsByDay).map(([dayLabel, dayComments]) => (
                                <div key={dayLabel} style={{ marginBottom: 16 }}>
                                    <div style={{
                                        fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
                                        padding: '6px 0', borderBottom: '1px solid var(--border-color)',
                                        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        {dayLabel}
                                        <span style={{
                                            fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4,
                                            background: 'var(--bg-glass)', fontWeight: 600,
                                        }}>{dayComments.length}</span>
                                    </div>
                                    {dayComments.map(comment => (
                                        <div key={comment._id} style={{
                                            padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                                            background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                                        }}>
                                            {/* Comment header */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: 'var(--color-primary)', color: '#fff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.65rem', fontWeight: 700,
                                                }}>
                                                    {comment.userAvatar || '?'}
                                                </div>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{comment.userName || 'User'}</span>
                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                    {comment.timeSlot} · {timeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                            {/* Comment text */}
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: comment.suggestion ? 8 : 0 }}>
                                                {comment.text}
                                            </p>
                                            {/* Suggestion */}
                                            {comment.suggestion && (
                                                <div style={{
                                                    padding: '8px 10px', borderRadius: 6, marginBottom: 8,
                                                    background: 'rgba(217, 119, 6, 0.06)', border: '1px solid rgba(217, 119, 6, 0.15)',
                                                }}>
                                                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#d97706', marginBottom: 2 }}>
                                                        Suggested Change:
                                                    </p>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                                        {comment.suggestion}
                                                    </p>
                                                </div>
                                            )}
                                            {/* Actions */}
                                            {isOwner && comment.status === 'open' && (
                                                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                                    {comment.suggestion && (
                                                        <button
                                                            onClick={() => onHandleComment(comment._id, 'accept')}
                                                            style={{
                                                                padding: '5px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                                                                border: 'none', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a',
                                                                cursor: 'pointer', transition: 'all 0.2s',
                                                            }}
                                                        >✓ Accept</button>
                                                    )}
                                                    <button
                                                        onClick={() => onHandleComment(comment._id, 'dismiss')}
                                                        style={{
                                                            padding: '5px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                                                            border: 'none', background: 'var(--bg-glass)', color: 'var(--text-muted)',
                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                        }}
                                                    >Dismiss</button>
                                                </div>
                                            )}
                                            {/* Status badge for non-open */}
                                            {comment.status !== 'open' && (
                                                <span style={{
                                                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                                    background: comment.status === 'accepted' ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-glass)',
                                                    color: comment.status === 'accepted' ? '#16a34a' : 'var(--text-muted)',
                                                    textTransform: 'capitalize', marginTop: 6, display: 'inline-block',
                                                }}>
                                                    {comment.status}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}

                        {/* Add comment form */}
                        <div style={{
                            padding: '14px', borderRadius: 10, marginTop: 14,
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        }}>
                            <h5 style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 10 }}>Add Comment</h5>
                            <form onSubmit={handleAddComment}>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <select
                                        value={commentForm.dayIndex}
                                        onChange={e => setCommentForm(p => ({ ...p, dayIndex: parseInt(e.target.value) }))}
                                        aria-label="Select day"
                                        style={{
                                            padding: '8px 10px', borderRadius: 6, border: '1.5px solid var(--border-color)',
                                            background: 'var(--bg-input)', color: 'var(--text-primary)',
                                            fontSize: '0.8rem', cursor: 'pointer',
                                        }}
                                    >
                                        {Array.from({ length: totalDays }, (_, i) => (
                                            <option key={i} value={i}>Day {i + 1}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={commentForm.timeSlot}
                                        onChange={e => setCommentForm(p => ({ ...p, timeSlot: e.target.value }))}
                                        aria-label="Select time slot"
                                        style={{
                                            padding: '8px 10px', borderRadius: 6, border: '1.5px solid var(--border-color)',
                                            background: 'var(--bg-input)', color: 'var(--text-primary)',
                                            fontSize: '0.8rem', cursor: 'pointer',
                                        }}
                                    >
                                        {['Morning', 'Afternoon', 'Evening', 'Night'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea
                                    value={commentForm.text}
                                    onChange={e => setCommentForm(p => ({ ...p, text: e.target.value }))}
                                    placeholder="Your comment..."
                                    maxLength={500}
                                    required
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 8,
                                        border: '1.5px solid var(--border-color)', background: 'var(--bg-input)',
                                        color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit',
                                        resize: 'vertical', minHeight: 60, marginBottom: 8,
                                    }}
                                />
                                <textarea
                                    value={commentForm.suggestion}
                                    onChange={e => setCommentForm(p => ({ ...p, suggestion: e.target.value }))}
                                    placeholder="Suggest an alternative activity (optional)"
                                    maxLength={200}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 8,
                                        border: '1.5px dashed var(--border-color)', background: 'rgba(217, 119, 6, 0.03)',
                                        color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit',
                                        resize: 'vertical', minHeight: 40, marginBottom: 10,
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={commentLoading || !commentForm.text.trim()}
                                    style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                                >
                                    {commentLoading ? 'Posting...' : 'Post Comment'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
