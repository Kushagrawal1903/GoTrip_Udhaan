import { motion } from 'framer-motion';

export function MemorySpreadLeft({ trip }) {
    const imageUrl = trip.destinationImage;
    const stampName = (trip.destination || 'Unknown').substring(0, 10);
    const year = new Date(trip.createdAt || Date.now()).getFullYear();

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '12px 0 0 12px' }} className="pp-memory-left-page">
            {imageUrl ? (
                <img src={imageUrl} alt={trip.destination} className="pp-bleed-image" />
            ) : (
                <div className="pp-bleed-image" style={{ background: '#2c3329' }} />
            )}
            <div className="pp-bleed-overlay" />
            
            <motion.div 
                className="pp-stamp"
                style={{ top: '60px', right: '40px', transform: `rotate(${Math.random() * -20 - 10}deg)` }}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.85 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.6 }}
            >
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '4px' }}>VISITED</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--pp-font-display)', marginBottom: '4px' }}>{year}</div>
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <path id="curve" d="M 20,50 A 30,30 0 1,1 80,50" fill="transparent" />
                    <text width="100" style={{ fontSize: '10px', fill: 'currentColor', letterSpacing: '3px' }}>
                        <textPath href="#curve" startOffset="50%" textAnchor="middle">{stampName.toUpperCase()}</textPath>
                    </text>
                </svg>
            </motion.div>
        </div>
    );
}

export function MemorySpreadRight({ trip, onUpdateFavorite }) {
    const startDate = new Date(trip.createdAt || Date.now());
    const duration = trip.duration || 1;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);
    
    const dateStr = `${startDate.toLocaleString('default', { month: 'short', day: 'numeric'})} - ${endDate.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric'})}`;
    
    return (
        <div className="pp-memory-right">
            <h1 className="pp-h1 pp-memory-title">{trip.destination}</h1>
            <div className="pp-body pp-memory-date">{dateStr}</div>
            
            <div className="pp-meta pp-memory-meta">
                <span>🕒 {trip.duration} Days</span>
                <span>👑 {trip.budget === 'premium' ? 'Luxury' : trip.budget === 'moderate' ? 'Moderate' : 'Budget'}</span>
                {trip.travelStyle && <span>🎒 {trip.travelStyle}</span>}
            </div>

            {trip.hotel && (
                <div className="pp-memory-section">
                    <div className="pp-h3">Hotel</div>
                    <div className="pp-body pp-memory-val">{trip.hotel}</div>
                </div>
            )}

            {trip.favoriteExperience && (
                <div className="pp-memory-section">
                    <div className="pp-h3">Favorite Experience</div>
                    <div className="pp-body pp-memory-val">{trip.favoriteExperience}</div>
                </div>
            )}

            <div className="pp-memory-section pp-memory-capsule-sec">
                <div className="pp-h3">Memory Capsule</div>
                <div className="pp-body pp-memory-val">
                    {trip.memoryCapsule}
                </div>
            </div>

            <div className="pp-tape-note" onClick={() => {
                const newNote = prompt("Update your favorite moment:", trip.favoriteMoment || "");
                if (newNote !== null && onUpdateFavorite) onUpdateFavorite(trip.tripId, newNote);
            }}>
                <div className="pp-tape" />
                <div className="pp-h3" style={{ fontSize: '0.55rem', marginLeft: '10px' }}>Favorite Moment</div>
                <div className="pp-handwriting" style={{ padding: '0 20px 20px' }}>
                    {trip.favoriteMoment || "A memory waiting to be written..."}
                    <span style={{ color: 'var(--pp-stamp-red)', marginLeft: '8px', opacity: 0.6 }}>♡</span>
                </div>
            </div>
        </div>
    );
}
