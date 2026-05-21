export function TimelineSpreadLeft({ trips }) {
    return (
        <div className="pp-timeline-left">
            <div className="pp-h3 pp-timeline-hdr">TIMELINE</div>
            
            <div className="pp-timeline-list-container">
                <div className="pp-timeline-spine" />
                
                {trips.slice(0, 5).map((trip, idx) => {
                    const date = new Date(trip.createdAt || Date.now());
                    const year = date.getFullYear();
                    const month = date.toLocaleString('default', { month: 'short' });
                    
                    return (
                        <div key={idx} className="pp-timeline-item">
                            <div className="pp-timeline-circle">
                                {trip.destinationImage && (
                                    <img src={trip.destinationImage} alt="" />
                                )}
                            </div>
                            
                            <div className="pp-timeline-content">
                                <div className="pp-timeline-meta-row">
                                    <div className="pp-h1 pp-timeline-year">{year}</div>
                                    <div className="pp-body pp-timeline-dest">{trip.destination}</div>
                                </div>
                                <div className="pp-body pp-timeline-month">{month} {year}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="pp-timeline-stamp-bg">
                <div className="pp-timeline-stamp-circle">
                    <div className="pp-h3" style={{ fontSize: '0.5rem', margin: 0 }}>PASSPORT</div>
                </div>
            </div>
        </div>
    );
}

export function ReflectionSpreadRight({ stats, latestImage }) {
    return (
        <div className="pp-reflection-right">
            <div className="pp-h3 pp-reflection-hdr">REFLECTION</div>
            
            <h1 className="pp-h1 pp-reflection-title">A Journey Worth Remembering</h1>
            
            <div className="pp-reflection-stats">
                <div className="pp-reflection-stat-item">
                    <div className="pp-h1 pp-reflection-stat-val">{stats?.tripsCompleted || 0}</div>
                    <div className="pp-h3">Trips</div>
                </div>
                <div className="pp-reflection-stat-item">
                    <div className="pp-h1 pp-reflection-stat-val">{stats?.destinationsExplored || 0}</div>
                    <div className="pp-h3">Countries</div>
                </div>
                <div className="pp-reflection-stat-item">
                    <div className="pp-h1 pp-reflection-stat-val">{stats?.totalDays || 0}</div>
                    <div className="pp-h3">Days</div>
                </div>
            </div>

            <div className="pp-body pp-reflection-quote">
                From quiet mountain mornings to unforgettable city nights, every destination became part of your story.
            </div>

            {/* Polaroid attached with tape */}
            <div className="pp-reflection-polaroid">
                <div className="pp-tape" style={{ top: '-10px', transform: 'translateX(-50%) rotate(-2deg)' }} />
                {latestImage ? (
                    <img src={latestImage} alt="Reflection" />
                ) : (
                    <div className="pp-polaroid-placeholder" />
                )}
                <div className="pp-handwriting pp-polaroid-caption">
                    The best is yet to come. <span style={{ color: 'var(--pp-stamp-red)', fontSize: '1rem' }}>♡</span>
                </div>
            </div>
            
            <div className="pp-reflection-plan-link">
                 <a href="/plan">
                    Plan Your Next Journey →
                 </a>
            </div>
        </div>
    );
}
