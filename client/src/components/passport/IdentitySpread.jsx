export function IdentitySpreadLeft({ name, memberSince }) {
    const year = new Date(memberSince || Date.now()).getFullYear();
    const month = new Date(memberSince || Date.now()).toLocaleString('default', { month: 'long' });

    return (
        <div className="pp-identity-left">
            <div className="pp-h2 pp-identity-belong">This Passport Belongs To</div>
            <div className="pp-h1 pp-identity-name">{name}</div>
            
            <div className="pp-h3 pp-identity-label">Member Since</div>
            <div className="pp-body pp-identity-date">{month} {year}</div>
            
            <div className="pp-body pp-identity-quote">
                Collecting memories from around the world.
            </div>
            
            {/* Mountain sketch at the bottom */}
            <div className="pp-identity-mountains">
                <svg viewBox="0 0 200 60" style={{ width: '100%', fill: 'currentColor' }}>
                    <path d="M0,60 L40,20 L70,45 L110,5 L150,35 L200,10 L200,60 Z" />
                    <path d="M30,60 L60,30 L90,50 L130,15 L170,40 L200,20 L200,60 Z" fillOpacity="0.5" />
                </svg>
            </div>
        </div>
    );
}

export function IdentitySpreadRight({ stats, personality }) {
    return (
        <div className="pp-identity-right">
            <div className="pp-stat-row">
                <div className="pp-stat-icon">🏁</div>
                <div>
                    <div className="pp-h1 pp-stat-val">{stats?.tripsCompleted || 0}</div>
                    <div className="pp-h3">Trips Completed</div>
                </div>
            </div>

            <div className="pp-stat-row">
                <div className="pp-stat-icon">🏴</div>
                <div>
                    <div className="pp-h1 pp-stat-val">{stats?.destinationsExplored || 0}</div>
                    <div className="pp-h3">Countries Explored</div>
                </div>
            </div>

            <div className="pp-stat-row">
                <div className="pp-stat-icon">📅</div>
                <div>
                    <div className="pp-h1 pp-stat-val">{stats?.totalDays || 0}</div>
                    <div className="pp-h3">Days Traveled</div>
                </div>
            </div>

            <div className="pp-personality-section">
                <div className="pp-h3">Travel Personality</div>
                <div className="pp-personality-header">
                    <div className="pp-personality-emoji">{personality?.emoji || '⛰️'}</div>
                    <div className="pp-h1 pp-personality-title">{personality?.label || 'Explorer Soul'}</div>
                </div>
                <div className="pp-body pp-personality-desc">
                    "{personality?.description || 'You chase horizons and collect experiences.'}"
                </div>
            </div>
        </div>
    );
}
