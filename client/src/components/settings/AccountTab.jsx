import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

/**
 * AccountTab — Plan, connected accounts, password, and preferences
 */
export default function AccountTab({ profile }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <PlanCard profile={profile} />
            <ConnectedAccountsCard profile={profile} />
            {profile.googleConnected && !profile._hasPassword ? (
                <div style={{
                    background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24,
                }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>ℹ️</span>
                        Your account uses Google sign-in. You don't have a separate GoTrip password.
                    </div>
                </div>
            ) : (
                <PasswordCard />
            )}
            <PreferencesCard profile={profile} />
        </div>
    );
}

/* ─── Plan Card ──────────────────────────────────────────────── */
function PlanCard({ profile }) {
    if (profile.plan === 'pro') {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.06))',
                borderRadius: 16, border: '1px solid rgba(59,130,246,0.15)', padding: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.3rem' }}>👑</span>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>GoTrip Pro</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹499/month • All premium features</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {['View invoices', 'Update payment', 'Cancel plan'].map(label => (
                        <button key={label} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                            onClick={() => alert('Contact support@gotrippro.com to manage billing')}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>📦</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>GoTrip Free</div>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Upgrade to unlock unlimited trips, AI packing lists, and collaboration tools.
            </div>
            <button className="btn-primary" style={{ padding: '9px 24px', fontSize: '0.85rem' }}
                onClick={() => window.location.href = '/pricing'}>
                Upgrade to Pro →
            </button>
        </div>
    );
}

/* ─── Connected Accounts Card ────────────────────────────────── */
function ConnectedAccountsCard({ profile }) {
    return (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Connected Accounts</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>🔗</span>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Google</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{profile.email}</div>
                    </div>
                </div>
                {profile.googleConnected ? (
                    <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                    }}>Connected</span>
                ) : (
                    <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--text-muted)', background: 'var(--bg-glass)',
                    }}>Not connected</span>
                )}
            </div>
        </div>
    );
}

/* ─── Password Card ──────────────────────────────────────────── */
function PasswordCard() {
    const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const getStrength = (pw) => {
        if (!pw || pw.length < 8) return { label: 'Weak', color: '#ef4444', width: '33%' };
        const hasNum = /\d/.test(pw);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
        if (pw.length >= 12 && hasNum && hasSpecial) return { label: 'Strong', color: '#10b981', width: '100%' };
        if (hasNum) return { label: 'Fair', color: '#f59e0b', width: '66%' };
        return { label: 'Weak', color: '#ef4444', width: '33%' };
    };

    const strength = getStrength(form.newPw);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await api.patch('/user/password', {
                currentPassword: form.current,
                newPassword: form.newPw,
                confirmPassword: form.confirm,
            });
            setMessage({ text: res.data.message, type: 'success' });
            setForm({ current: '', newPw: '', confirm: '' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to update password.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10,
        border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)',
        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
    };

    return (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Change Password</h3>
            <form onSubmit={handleSubmit}>
                {['current', 'newPw', 'confirm'].map((field) => {
                    const labels = { current: 'Current Password', newPw: 'New Password', confirm: 'Confirm New Password' };
                    return (
                        <div key={field} style={{ marginBottom: 14, position: 'relative' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                                {labels[field]}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPw[field] ? 'text' : 'password'}
                                    value={form[field]}
                                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                    placeholder={labels[field]}
                                    style={inputStyle}
                                />
                                <button type="button" onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}
                                    style={{
                                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                                        color: 'var(--text-muted)', padding: 4,
                                    }}>
                                    {showPw[field] ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {field === 'newPw' && form.newPw && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{
                                        height: 4, borderRadius: 2, background: 'var(--bg-glass)',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%', width: strength.width,
                                            background: strength.color, borderRadius: 2,
                                            transition: 'width 0.3s ease',
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600, marginTop: 3 }}>
                                        {strength.label}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {message.text && (
                    <div style={{
                        padding: '8px 12px', borderRadius: 8, marginBottom: 14, fontSize: '0.8rem',
                        background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)',
                        color: message.type === 'success' ? '#10b981' : 'var(--color-danger)',
                    }}>{message.text}</div>
                )}

                <button type="submit" className="btn-primary" disabled={saving || !form.current || !form.newPw || !form.confirm}
                    style={{ padding: '9px 24px', fontSize: '0.85rem', opacity: (saving || !form.current || !form.newPw || !form.confirm) ? 0.5 : 1 }}>
                    {saving ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

/* ─── Preferences Card ───────────────────────────────────────── */
function PreferencesCard({ profile }) {
    const prefs = profile.preferences || {};
    const [style, setStyle] = useState(prefs.defaultStyle || 'adventure');
    const [budget, setBudget] = useState(prefs.defaultBudget || 'mid');
    const [currency, setCurrency] = useState(prefs.currency || 'INR');
    const [savedField, setSavedField] = useState('');
    const debounceRef = useRef(null);

    const save = (updates) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                await api.patch('/user/preferences', updates);
                setSavedField(Object.keys(updates)[0]);
                setTimeout(() => setSavedField(''), 1500);
            } catch {}
        }, 500);
    };

    const selectStyle = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)',
        color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
        cursor: 'pointer', appearance: 'auto',
    };

    return (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Trip Preferences</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                These are used as defaults when you plan a new trip.
            </div>

            {[
                { label: 'Default Travel Style', value: style, field: 'defaultStyle',
                    options: [['adventure','Adventure'],['relaxation','Relaxation'],['cultural','Cultural'],['family','Family'],['romantic','Romantic']],
                    setter: (v) => { setStyle(v); save({ defaultStyle: v }); } },
                { label: 'Default Budget', value: budget, field: 'defaultBudget',
                    options: [['low','Budget-Friendly'],['mid','Moderate'],['high','Premium']],
                    setter: (v) => { setBudget(v); save({ defaultBudget: v }); } },
                { label: 'Currency', value: currency, field: 'currency',
                    options: [['INR','INR (₹)'],['USD','USD ($)'],['EUR','EUR (€)'],['GBP','GBP (£)']],
                    setter: (v) => { setCurrency(v); save({ currency: v }); } },
            ].map(item => (
                <div key={item.field} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {item.label}
                        {savedField === item.field && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, animation: 'fadeIn 0.3s ease' }}>Saved</span>
                        )}
                    </label>
                    <select value={item.value} onChange={e => item.setter(e.target.value)} style={selectStyle}>
                        {item.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                </div>
            ))}
        </div>
    );
}
