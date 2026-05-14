import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AccountTab from '../components/settings/AccountTab';
import NotificationsTab from '../components/settings/NotificationsTab';
import PrivacyTab from '../components/settings/PrivacyTab';

const TABS = [
    { id: 'account', label: 'Account', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Danger', icon: '🛡️' },
];

export default function Settings() {
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(() => {
        const hash = location.hash.replace('#', '');
        return TABS.find(t => t.id === hash)?.id || 'account';
    });

    useEffect(() => {
        api.get('/user/profile').then(res => setProfile(res.data.data))
            .catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/dashboard/settings#${tabId}`, { replace: true });
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24 }}>Settings</h2>
                <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
            </div>
        );
    }
    if (!profile) return null;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>Settings</h2>

            {/* Tab bar */}
            <div className="settings-tabs" style={{
                display: 'flex', gap: 0, marginBottom: 24,
                borderBottom: '2px solid var(--border-color)',
                overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                        style={{
                            padding: '12px 20px', border: 'none', background: 'transparent',
                            cursor: 'pointer', fontSize: '0.88rem', fontWeight: activeTab === tab.id ? 700 : 500,
                            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                            marginBottom: -2, whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        <span style={{ fontSize: '1rem' }}>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
                {activeTab === 'account' && <AccountTab profile={profile} />}
                {activeTab === 'notifications' && <NotificationsTab profile={profile} />}
                {activeTab === 'privacy' && <PrivacyTab profile={profile} />}
            </div>
        </div>
    );
}
