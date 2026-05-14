import { useState, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * PersonalInfoForm — Editable personal info with dirty-state tracking and partial updates
 */
export default function PersonalInfoForm({ profile, onSave }) {
    const initial = useMemo(() => ({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
    }), [profile]);

    const { refreshUser } = useAuth();
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState({});

    const isDirty = Object.keys(initial).some(k => form[k] !== initial[k]);

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
        setSaved(false);
    };

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'First name is required';
        if (/\d/.test(form.firstName)) e.firstName = 'No numbers allowed';
        if (/\d/.test(form.lastName)) e.lastName = 'No numbers allowed';
        if (form.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone format';
        if (form.bio.length > 300) e.bio = 'Max 300 characters';
        if (form.location.length > 100) e.location = 'Max 100 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate() || !isDirty) return;

        // Only send changed fields
        const changed = {};
        for (const k of Object.keys(initial)) {
            if (form[k] !== initial[k]) changed[k] = form[k];
        }

        setSaving(true);
        try {
            await api.patch('/user/profile', changed);
            onSave(changed);
            await refreshUser();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setErrors({ _general: err.response?.data?.message || 'Save failed.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setForm(initial);
        setErrors({});
        setSaved(false);
    };

    const inputStyle = (field) => ({
        width: '100%', padding: '11px 14px', borderRadius: 10,
        border: `1.5px solid ${errors[field] ? 'var(--color-danger)' : 'var(--border-color)'}`,
        background: 'var(--bg-primary)', color: 'var(--text-primary)',
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
    });

    const labelStyle = {
        fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
        display: 'block', marginBottom: 6,
    };

    return (
        <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: '1px solid var(--border-color)', padding: 24,
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
                Personal Information
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Name row */}
                <div className="profile-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                        <label style={labelStyle}>First Name</label>
                        <input value={form.firstName} onChange={e => handleChange('firstName', e.target.value)}
                            placeholder="First name" style={inputStyle('firstName')} />
                        {errors.firstName && <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: 4 }}>{errors.firstName}</div>}
                    </div>
                    <div>
                        <label style={labelStyle}>Last Name</label>
                        <input value={form.lastName} onChange={e => handleChange('lastName', e.target.value)}
                            placeholder="Last name" style={inputStyle('lastName')} />
                        {errors.lastName && <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: 4 }}>{errors.lastName}</div>}
                    </div>
                </div>

                {/* Email (read-only) */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>
                        Email
                        <span style={{
                            marginLeft: 8, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                            fontSize: '0.65rem', fontWeight: 700,
                        }}>✓ Verified</span>
                    </label>
                    <input value={profile.email} readOnly
                        style={{ ...inputStyle('email'), opacity: 0.6, cursor: 'not-allowed' }} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Email changes require re-verification — contact support.
                    </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Phone</label>
                    <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                        placeholder="+91 98765 43210" style={inputStyle('phone')} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Used for WhatsApp trip alerts
                    </div>
                    {errors.phone && <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: 4 }}>{errors.phone}</div>}
                </div>

                {/* Location */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Location</label>
                    <input value={form.location} onChange={e => handleChange('location', e.target.value)}
                        placeholder="e.g. Mumbai, India" style={inputStyle('location')} />
                    {errors.location && <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: 4 }}>{errors.location}</div>}
                </div>

                {/* Bio */}
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Bio</label>
                    <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)}
                        placeholder="Tell us about your travel adventures…"
                        rows={3}
                        style={{ ...inputStyle('bio'), resize: 'vertical', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: 4 }}>
                        <span style={{ color: form.bio.length > 300 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                            {form.bio.length}/300
                        </span>
                        {errors.bio && <span style={{ color: 'var(--color-danger)' }}>{errors.bio}</span>}
                    </div>
                </div>

                {errors._general && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: 16 }}>
                        {errors._general}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {isDirty && (
                        <button type="button" className="btn-outline" onClick={handleDiscard}
                            style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
                            Discard
                        </button>
                    )}
                    <button type="submit" className="btn-primary"
                        disabled={!isDirty || saving}
                        style={{
                            padding: '9px 20px', fontSize: '0.85rem',
                            opacity: (!isDirty || saving) ? 0.5 : 1,
                        }}>
                        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
