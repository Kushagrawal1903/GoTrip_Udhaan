import { useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * AvatarCard — User avatar, name, email, plan badge, and photo upload
 */
export default function AvatarCard({ profile, onAvatarChange }) {
    const { refreshUser, logout } = useAuth();
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);

    const initials = profile.avatarInitials || 'U';
    const avatarSrc = preview || profile.avatarUrl;

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError('');

        // Validate type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Only JPEG, PNG, or WebP images are allowed.');
            return;
        }
        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be under 5MB.');
            return;
        }

        // Show preview
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const handleSave = async () => {
        if (!fileRef.current?.files?.[0]) return;
        setUploading(true);
        setError('');

        try {
            const file = fileRef.current.files[0];
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await api.post('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onAvatarChange(res.data.avatarUrl);
            await refreshUser();
            setPreview(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setUploading(true);
        try {
            await api.delete('/user/avatar');
            onAvatarChange(null);
            await refreshUser();
            setPreview(null);
        } catch (err) {
            setError('Failed to remove avatar.');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: '1px solid var(--border-color)',
            padding: 24, textAlign: 'center',
        }}>
            {/* Avatar circle */}
            <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
                background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #0d9488, #14b8a6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '3px solid var(--border-color)',
            }}>
                {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{initials}</span>
                )}
            </div>

            {/* Name & email */}
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {profile.firstName || profile.lastName
                    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                    : profile.name || 'User'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                {profile.email}
            </div>

            {/* Plan badge */}
            <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: profile.plan === 'pro' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-glass)',
                color: profile.plan === 'pro' ? '#3b82f6' : 'var(--text-muted)',
                border: `1px solid ${profile.plan === 'pro' ? 'rgba(59, 130, 246, 0.2)' : 'var(--border-color)'}`,
            }}>
                {profile.plan === 'pro' ? '👑 Pro' : 'Free'}
            </span>
            {profile.plan === 'pro' && profile.planExpiresAt && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Renews {new Date(profile.planExpiresAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
            )}

            {/* Upload controls */}
            <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                {preview ? (
                    <>
                        <button className="btn-primary" onClick={handleSave} disabled={uploading}
                            style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
                            {uploading ? 'Saving…' : '✓ Save photo'}
                        </button>
                        <button className="btn-outline" onClick={handleCancel}
                            style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn-outline" onClick={() => fileRef.current?.click()}
                            style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
                            📷 Upload photo
                        </button>
                        {profile.avatarUrl && (
                            <button className="btn-outline" onClick={handleRemove} disabled={uploading}
                                style={{ padding: '7px 16px', fontSize: '0.8rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                                Remove
                            </button>
                        )}
                    </>
                )}
            </div>
            {error && <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--color-danger)' }}>{error}</div>}

            {/* Mobile Log Out - visible on mobile mostly but fine everywhere */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={logout}
                    className="btn-outline"
                    style={{
                        width: '100%',
                        borderColor: 'var(--color-danger)',
                        color: 'var(--color-danger)',
                        gap: 8,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--color-danger)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-danger)';
                    }}
                >
                    <span aria-hidden="true">🚪</span> Log Out
                </button>
            </div>
        </div>
    );
}
