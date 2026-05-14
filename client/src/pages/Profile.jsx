import { useState, useEffect } from 'react';
import api from '../services/api';
import AvatarCard from '../components/profile/AvatarCard';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import TravelStatsCard from '../components/profile/TravelStatsCard';
import BadgesCard from '../components/profile/BadgesCard';

/**
 * Profile Page — /dashboard/profile
 * Desktop: left column (avatar + stats + badges) | right column (form)
 * Mobile: single stack
 */
export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/profile').then(res => {
            setProfile(res.data.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleAvatarChange = (avatarUrl) => {
        setProfile(p => ({ ...p, avatarUrl }));
    };

    const handleSave = (changed) => {
        setProfile(p => ({ ...p, ...changed }));
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>Profile</h2>
                <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />
                        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
                    </div>
                    <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>Profile</h2>

            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Left column — sticky on desktop */}
                <div className="profile-left" style={{
                    display: 'flex', flexDirection: 'column', gap: 20,
                    position: 'sticky', top: 24,
                }}>
                    <AvatarCard profile={profile} onAvatarChange={handleAvatarChange} />
                    <TravelStatsCard />
                    <BadgesCard />
                </div>

                {/* Right column */}
                <div>
                    <PersonalInfoForm profile={profile} onSave={handleSave} />
                </div>
            </div>
        </div>
    );
}
