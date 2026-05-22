import { useMemo } from 'react';
import { motion } from 'framer-motion';
import MemoryPhotos from './MemoryPhotos';
import PersonalThought from './PersonalThought';
import MoodSelector from './MoodSelector';

function hashRotation(seed) {
    let hash = 0;
    const str = String(seed || '');
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return (hash % 20) - 10;
}

export function MemorySpreadLeft({ trip }) {
    const imageUrl = trip.destinationImage;
    const stampName = (trip.destination || 'Unknown').substring(0, 10);
    const year = new Date(trip.createdAt || Date.now()).getFullYear();
    const stampRotation = useMemo(() => hashRotation(trip.tripId), [trip.tripId]);

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
                style={{ top: '60px', right: '40px', transform: `rotate(${stampRotation}deg)`, borderColor: trip.stampColor, color: trip.stampColor }}
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

export function MemorySpreadRight({ trip, onUpdateMemory, onUploadPhotos, onDeletePhoto }) {
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

            <div className="pp-memory-grid">
                <div className="pp-memory-col">
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
                        <div className="pp-body pp-memory-val" style={{ marginBottom: '8px' }}>
                            {trip.memoryCapsule}
                        </div>
                        <MoodSelector 
                            currentMood={trip.userMood}
                            defaultMood={trip.memoryMood}
                            tripId={trip.tripId}
                            onUpdate={onUpdateMemory}
                        />
                    </div>
                </div>

                <div className="pp-memory-col">
                    <PersonalThought 
                        thought={trip.personalThought} 
                        tripId={trip.tripId} 
                        onUpdate={onUpdateMemory}
                    />

                    <MemoryPhotos 
                        photos={trip.photos || []}
                        tripId={trip.tripId}
                        onUpload={onUploadPhotos}
                        onDelete={onDeletePhoto}
                    />
                </div>
            </div>
        </div>
    );
}
