import { useState } from 'react';

/**
 * HotelCard — Hotel card with reliable image display
 */
export default function HotelCard({ hotel, index = 0 }) {
    const photoSrc = hotel.imageUrl || hotel.photoUrl;
    const [imgFailed, setImgFailed] = useState(false);
    const showImage = photoSrc && !imgFailed;

    const stars = [];
    const rating = Number(hotel.rating) || 4;
    for (let i = 0; i < 5; i++) {
        stars.push(i < Math.round(rating) ? '⭐' : '☆');
    }

    return (
        <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Photo Section */}
            <div style={{
                height: 180,
                position: 'relative',
                background: '#334155',
                overflow: 'hidden',
            }}>
                {showImage && (
                    <img
                        src={photoSrc}
                        alt={hotel.name}
                        onError={() => setImgFailed(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                )}

                {!showImage && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🏨</span>
                    </div>
                )}

                {/* Dark overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }} />

                {/* Rating badge */}
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '4px 10px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: 6,
                    color: '#fbbf24',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    ⭐ {hotel.rating}
                </div>

                {/* Hotel name */}
                <h3 style={{
                    position: 'absolute',
                    bottom: 12, left: 14, right: 14,
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#fff',
                    lineHeight: 1.3,
                    zIndex: 1,
                }}>
                    {hotel.name}
                </h3>
            </div>

            {/* Card Body */}
            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {hotel.description && (
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.83rem',
                        lineHeight: 1.5,
                        marginBottom: 12,
                        flex: 1,
                    }}>
                        {hotel.description}
                    </p>
                )}

                {/* Price */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 12, flexWrap: 'wrap', gap: 8,
                }}>
                    <div>
                        <span style={{
                            fontSize: '1rem', fontWeight: 700,
                            color: 'var(--text-primary)',
                        }}>
                            {hotel.priceRange}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 1, fontSize: '0.6rem' }}>
                        {stars.map((s, i) => <span key={i}>{s}</span>)}
                    </div>
                </div>

                {/* Maps Link */}
                {hotel.mapsLink && (
                    <a
                        href={hotel.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '10px',
                            background: 'var(--color-primary)',
                            color: '#fff', fontWeight: 600, borderRadius: 8,
                            textDecoration: 'none', fontSize: '0.85rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        View on Google Maps
                    </a>
                )}
            </div>
        </div>
    );
}
