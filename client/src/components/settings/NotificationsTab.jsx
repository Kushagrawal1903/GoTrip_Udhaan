import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ToggleRow from './ToggleRow';

export default function NotificationsTab({ profile }) {
    const notifs = profile.notifications || {};
    const [email, setEmail] = useState({
        tripReminders: notifs.email?.tripReminders ?? true,
        collaborationActivity: notifs.email?.collaborationActivity ?? true,
        inviteAccepted: notifs.email?.inviteAccepted ?? true,
        productUpdates: notifs.email?.productUpdates ?? false,
    });
    const [whatsapp, setWhatsapp] = useState({
        dailyDigest: notifs.whatsapp?.dailyDigest ?? true,
        preTripReminder: notifs.whatsapp?.preTripReminder ?? true,
        weatherAlerts: notifs.whatsapp?.weatherAlerts ?? false,
    });
    const [digestTime, setDigestTime] = useState(notifs.digestTime || '07:30');
    const [timezone, setTimezone] = useState(notifs.timezone || 'Asia/Kolkata');
    const [savingTiming, setSavingTiming] = useState(false);
    const [timingSaved, setTimingSaved] = useState(false);
    const hasPhone = !!profile.phone;

    const toggle = async (group, key, value) => {
        const setter = group === 'email' ? setEmail : setWhatsapp;
        const prev = group === 'email' ? email[key] : whatsapp[key];
        setter(s => ({ ...s, [key]: value }));
        try { await api.patch('/user/notifications', { [group]: { [key]: value } }); }
        catch { setter(s => ({ ...s, [key]: prev })); }
    };

    const saveTiming = async () => {
        setSavingTiming(true);
        try { await api.patch('/user/notifications', { digestTime, timezone }); setTimingSaved(true); setTimeout(() => setTimingSaved(false), 2000); } catch {}
        setSavingTiming(false);
    };

    const sel = { width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:'0.88rem',outline:'none',cursor:'pointer' };

    return (
        <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
            <div style={{ background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border-color)',padding:24 }}>
                <h3 style={{ fontSize:'0.95rem',fontWeight:700,marginBottom:12,color:'var(--text-primary)' }}>📧 Email Notifications</h3>
                <ToggleRow label="Trip reminders" description="Email the day before trip starts" checked={email.tripReminders} onChange={v=>toggle('email','tripReminders',v)} />
                <ToggleRow label="Collaboration activity" description="When someone comments or edits" checked={email.collaborationActivity} onChange={v=>toggle('email','collaborationActivity',v)} />
                <ToggleRow label="Invite accepted" description="When a collaborator joins" checked={email.inviteAccepted} onChange={v=>toggle('email','inviteAccepted',v)} />
                <ToggleRow label="GoTrip tips & updates" description="Product newsletter" checked={email.productUpdates} onChange={v=>toggle('email','productUpdates',v)} />
            </div>
            <div style={{ background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border-color)',padding:24 }}>
                <h3 style={{ fontSize:'0.95rem',fontWeight:700,marginBottom:8,color:'var(--text-primary)' }}>💬 WhatsApp Alerts</h3>
                {!hasPhone && <div style={{ padding:'12px 16px',borderRadius:10,marginBottom:16,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}><span style={{ fontSize:'0.82rem' }}>Add your WhatsApp number in Profile to enable alerts.</span><Link to="/dashboard/profile" style={{ fontSize:'0.8rem',fontWeight:600,color:'var(--color-primary)',textDecoration:'none' }}>Go to Profile →</Link></div>}
                <ToggleRow label="Daily trip digest" checked={whatsapp.dailyDigest} onChange={v=>toggle('whatsapp','dailyDigest',v)} disabled={!hasPhone} />
                <ToggleRow label="Pre-trip reminder" description="24h before trip" checked={whatsapp.preTripReminder} onChange={v=>toggle('whatsapp','preTripReminder',v)} disabled={!hasPhone} />
                <ToggleRow label="Weather alerts" checked={whatsapp.weatherAlerts} onChange={v=>toggle('whatsapp','weatherAlerts',v)} disabled={!hasPhone} />
            </div>
            <div style={{ background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border-color)',padding:24 }}>
                <h3 style={{ fontSize:'0.95rem',fontWeight:700,marginBottom:16,color:'var(--text-primary)' }}>⏰ Alert Timing</h3>
                <div className="settings-timing-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:18 }}>
                    <div><label style={{ fontSize:'0.78rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Digest Time</label><select value={digestTime} onChange={e=>setDigestTime(e.target.value)} style={sel}>{['06:00','06:30','07:00','07:30','08:00','08:30','09:00'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label style={{ fontSize:'0.78rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Timezone</label><select value={timezone} onChange={e=>setTimezone(e.target.value)} style={sel}>{['Asia/Kolkata','UTC','Europe/London','America/New_York'].map(tz=><option key={tz} value={tz}>{tz.replace('_',' ')}</option>)}</select></div>
                </div>
                <button className="btn-primary" onClick={saveTiming} disabled={savingTiming} style={{ padding:'9px 24px',fontSize:'0.85rem' }}>{savingTiming?'Saving…':timingSaved?'✓ Saved':'Save preferences'}</button>
            </div>
        </div>
    );
}
