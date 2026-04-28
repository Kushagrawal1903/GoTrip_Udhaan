import { useState } from 'react';

const BUDGET_OPTIONS = [
    { id: 'low', label: 'Budget', desc: 'Hostels, street food, public transport', color: '#16a34a' },
    { id: 'moderate', label: 'Mid-Range', desc: '3-star hotels, mixed transport, cafes', color: '#d97706' },
    { id: 'premium', label: 'Premium', desc: '5-star luxury, private car, fine dining', color: '#e11d48' },
];

const STYLE_OPTIONS = [
    { id: 'adventure', label: 'Adventure' },
    { id: 'relaxation', label: 'Relaxation' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'family', label: 'Family' },
    { id: 'romantic', label: 'Romantic' },
];

/**
 * TripForm — Full-width step-style form
 */
export default function TripForm({ onSubmit, loading = false }) {
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState(3);
    const [budget, setBudget] = useState('moderate');
    const [travelStyle, setTravelStyle] = useState('cultural');
    const [travelers, setTravelers] = useState(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ destination, duration: Number(duration), budget, travelStyle, travelers: Number(travelers) });
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Main Search Row */}
            <div className="glass-card" style={{
                padding: '28px',
                marginBottom: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 18,
                alignItems: 'end',
            }}>
                {/* Destination */}
                <div>
                    <label className="label">Destination</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g., Goa, Manali, Jaipur..."
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                        disabled={loading}
                        style={{ fontSize: '1rem' }}
                    />
                </div>

                {/* Duration */}
                <div>
                    <label className="label">Duration</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                            type="range"
                            min="1"
                            max="14"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            disabled={loading}
                            style={{
                                flex: 1, height: 6, borderRadius: 3,
                                appearance: 'auto',
                                accentColor: 'var(--color-primary)',
                            }}
                        />
                        <span style={{
                            minWidth: 70,
                            padding: '8px 14px',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 8,
                            textAlign: 'center',
                            fontSize: '0.88rem',
                        }}>
                            {duration} {Number(duration) === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>
                </div>

                {/* Travelers */}
                <div>
                    <label className="label">Travelers</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                            type="button"
                            onClick={() => setTravelers(Math.max(1, travelers - 1))}
                            disabled={loading || travelers <= 1}
                            style={{
                                width: 40, height: 40,
                                borderRadius: 8,
                                border: '1.5px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                cursor: travelers <= 1 ? 'not-allowed' : 'pointer',
                                opacity: travelers <= 1 ? 0.4 : 1,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >−</button>
                        <span style={{
                            minWidth: 70,
                            padding: '8px 14px',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 8,
                            textAlign: 'center',
                            fontSize: '0.88rem',
                        }}>
                            {travelers} {Number(travelers) === 1 ? 'Person' : 'People'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setTravelers(Math.min(10, travelers + 1))}
                            disabled={loading || travelers >= 10}
                            style={{
                                width: 40, height: 40,
                                borderRadius: 8,
                                border: '1.5px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                cursor: travelers >= 10 ? 'not-allowed' : 'pointer',
                                opacity: travelers >= 10 ? 0.4 : 1,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >+</button>
                    </div>
                </div>
            </div>

            {/* Budget Selection */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginBottom: 12,
                }}>
                    Budget Tier
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 12,
                }}>
                    {BUDGET_OPTIONS.map((opt) => {
                        const isActive = budget === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setBudget(opt.id)}
                                disabled={loading}
                                style={{
                                    padding: '20px 18px',
                                    borderRadius: 10,
                                    border: `1.5px solid ${isActive ? opt.color : 'var(--border-color)'}`,
                                    background: isActive ? `${opt.color}0a` : 'var(--bg-card)',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    <span style={{
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        color: isActive ? opt.color : 'var(--text-primary)',
                                    }}>
                                        {opt.label}
                                    </span>
                                    {isActive && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            width: 20, height: 20,
                                            borderRadius: '50%',
                                            background: opt.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                                        }}>
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                    {opt.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Travel Style */}
            <div style={{ marginBottom: 28 }}>
                <h3 style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginBottom: 12,
                }}>
                    Travel Style
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STYLE_OPTIONS.map((opt) => {
                        const isActive = travelStyle === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setTravelStyle(opt.id)}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                    background: isActive ? 'var(--color-primary)' : 'var(--bg-card)',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.88rem',
                                }}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Generate Button */}
            <button
                type="submit"
                className="btn-primary"
                disabled={loading || !destination.trim()}
                style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1rem',
                    borderRadius: 10,
                }}
            >
                {loading ? 'Generating Itinerary...' : 'Generate AI Trip Plan'}
            </button>
        </form>
    );
}
