export default function TravelIdentity({ user, stats, personality }) {
    const memberSince = new Date(user.memberSince).getFullYear();

    return (
        <div className="identity-page passport-page-inner">
            <div className="identity-personality">
                {personality?.emoji || '🌍'}
            </div>
            <h2 className="identity-personality-label">
                {personality?.label || 'Curious Traveler'}
            </h2>
            <p className="identity-personality-desc">
                "{personality?.description || 'Every trip adds a new chapter to your story.'}"
            </p>

            <div style={{ margin: '32px 0' }}>
                <div className="identity-divider" style={{ margin: '0 auto 24px' }}></div>
                <h1 className="identity-name">{user.name}</h1>
                <div className="identity-member">TRAVELER SINCE {memberSince}</div>
            </div>

            <div className="identity-stats">
                <div className="identity-stat">
                    <div className="identity-stat-value">{stats.tripsCompleted}</div>
                    <div className="identity-stat-label">Journeys</div>
                </div>
                <div className="identity-stat">
                    <div className="identity-stat-value">{stats.destinationsExplored}</div>
                    <div className="identity-stat-label">Places</div>
                </div>
                <div className="identity-stat">
                    <div className="identity-stat-value">{stats.totalDays}</div>
                    <div className="identity-stat-label">Days Away</div>
                </div>
            </div>
        </div>
    );
}
