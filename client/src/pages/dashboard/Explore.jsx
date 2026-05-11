export default function Explore() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }} aria-hidden="true">🧭</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 10 }}>Explore — Coming Soon</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                Discover popular destinations, curated itineraries, and travel inspiration from the GoTrip community.
            </p>
            <div style={{
                marginTop: 24, padding: '14px 24px', borderRadius: 10,
                background: 'rgba(13, 148, 136, 0.06)', border: '1px solid rgba(13, 148, 136, 0.15)',
                display: 'inline-block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)',
            }}>
                ✨ We're building something amazing
            </div>
        </div>
    );
}
