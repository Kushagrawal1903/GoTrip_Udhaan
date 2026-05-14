import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ToggleRow from './ToggleRow';
import DeleteModal from './DeleteModal';

export default function PrivacyTab({ profile }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [privacy, setPrivacy] = useState({
        publicProfile: profile.privacy?.publicProfile ?? true,
        showOnExploreFeed: profile.privacy?.showOnExploreFeed ?? false,
        activityAnalytics: profile.privacy?.activityAnalytics ?? true,
    });
    const [deleteTripsOpen, setDeleteTripsOpen] = useState(false);
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const togglePrivacy = async (key, value) => {
        const prev = privacy[key];
        setPrivacy(p => ({ ...p, [key]: value }));
        try { await api.patch('/user/privacy', { [key]: value }); }
        catch { setPrivacy(p => ({ ...p, [key]: prev })); }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('gotrip-token');
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const res = await fetch(`${apiUrl}/user/export-data`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GoTrip-data-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Export failed.'); }
        setExporting(false);
    };

    const handleDeleteTrips = async () => {
        setDeleteLoading(true); setDeleteError('');
        try {
            await api.delete('/user/trips', { data: { confirm: 'DELETE MY TRIPS' } });
            setDeleteTripsOpen(false);
            navigate('/dashboard');
        } catch (err) { setDeleteError(err.response?.data?.message || 'Failed.'); }
        setDeleteLoading(false);
    };

    const handleDeleteAccount = async ({ password }) => {
        setDeleteLoading(true); setDeleteError('');
        try {
            await api.delete('/user/account', { data: { confirm: 'DELETE MY ACCOUNT', password } });
            logout();
            window.location.href = '/';
        } catch (err) { setDeleteError(err.response?.data?.message || 'Failed.'); }
        setDeleteLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Privacy toggles */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>🔒 Privacy</h3>
                <ToggleRow label="Public profile" description="Others can find you when inviting collaborators" checked={privacy.publicProfile} onChange={v => togglePrivacy('publicProfile', v)} />
                <ToggleRow label="Show trips on explore feed" description="Published trips appear publicly" checked={privacy.showOnExploreFeed} onChange={v => togglePrivacy('showOnExploreFeed', v)} />
                <ToggleRow label="Activity analytics" description="Anonymous usage sharing" checked={privacy.activityAnalytics} onChange={v => togglePrivacy('activityAnalytics', v)} />
            </div>

            {/* Danger zone */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid rgba(220,38,38,0.2)', padding: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--color-danger)' }}>⚠️ Danger Zone</h3>

                {/* Export data */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 10 }}>
                    <div><div style={{ fontSize: '0.88rem', fontWeight: 500 }}>Export all my data</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Download a JSON file of your profile and trips</div></div>
                    <button className="btn-outline" onClick={handleExport} disabled={exporting} style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
                        {exporting ? 'Preparing…' : 'Export data'}
                    </button>
                </div>

                {/* Delete all trips */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 10 }}>
                    <div><div style={{ fontSize: '0.88rem', fontWeight: 500 }}>Delete all trips</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Permanently remove all itineraries and packing lists</div></div>
                    <button onClick={() => setDeleteTripsOpen(true)} style={{ padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: 10, border: '1.5px solid var(--color-danger)', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer' }}>
                        Delete all trips
                    </button>
                </div>

                {/* Delete account */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', flexWrap: 'wrap', gap: 10 }}>
                    <div><div style={{ fontSize: '0.88rem', fontWeight: 500 }}>Delete account</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Permanently close your account and delete everything</div></div>
                    <button onClick={() => setDeleteAccountOpen(true)} style={{ padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: 10, border: 'none', background: 'var(--color-danger)', color: '#fff', cursor: 'pointer' }}>
                        Delete account
                    </button>
                </div>
            </div>

            {/* Modals */}
            <DeleteModal isOpen={deleteTripsOpen} onClose={() => { setDeleteTripsOpen(false); setDeleteError(''); }}
                title="Delete all trips?" body="This will permanently delete all saved itineraries, packing lists, and travel history. This cannot be undone."
                confirmText="DELETE" buttonLabel="Delete all trips" onConfirm={handleDeleteTrips} loading={deleteLoading} error={deleteError} />
            <DeleteModal isOpen={deleteAccountOpen} onClose={() => { setDeleteAccountOpen(false); setDeleteError(''); }}
                title="Permanently delete your account" body="This will delete all trips, packing lists, collaborations, and personal data forever."
                confirmText="DELETE" buttonLabel="Delete my account forever" requirePassword={!profile.googleConnected}
                onConfirm={handleDeleteAccount} loading={deleteLoading} error={deleteError} />
        </div>
    );
}
