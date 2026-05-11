import { useState } from 'react';
import DayCard from './DayCard';
import HotelCard from './HotelCard';
import BudgetChart from './BudgetChart';

/**
 * ItineraryView — Full-width trip result display
 */
export default function ItineraryView({ tripData, placeDetails, onSave, saving }) {
    const [heroImgFailed, setHeroImgFailed] = useState(false);

    if (!tripData) return null;

    const destinationImage = placeDetails?.photoUrl;
    const showHeroImg = destinationImage && !heroImgFailed;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div className="animate-fade-in-up">

                {/* ─── DESTINATION HERO BANNER ───────────────────── */}
                <div style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: 28,
                    position: 'relative',
                    height: 260,
                    background: '#1e293b',
                }}>
                    {showHeroImg && (
                        <img
                            src={destinationImage}
                            alt={tripData.destination}
                            onError={() => setHeroImgFailed(true)}
                            style={{
                                position: 'absolute', inset: 0,
                                width: '100%', height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                    {/* Overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Text */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px', zIndex: 1 }}>
                        <h1 style={{
                            fontWeight: 800,
                            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                            color: '#fff', marginBottom: 8,
                            letterSpacing: '-0.02em',
                        }}>
                            {tripData.destination}
                        </h1>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '5px 14px', borderRadius: 6,
                                background: 'rgba(255,255,255,0.18)',
                                color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                            }}>{tripData.duration} Days</span>
                            {tripData.travelers && tripData.travelers > 0 && (
                                <span style={{
                                    padding: '5px 14px', borderRadius: 6,
                                    background: 'rgba(255,255,255,0.18)',
                                    color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                                }}>{tripData.travelers} {tripData.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                            )}
                            <span style={{
                                padding: '5px 14px', borderRadius: 6,
                                background: 'rgba(255,255,255,0.18)',
                                color: '#fff', fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize',
                            }}>{tripData.budgetCategory}</span>
                            {tripData.totalEstimatedBudget && (
                                <span style={{
                                    padding: '5px 14px', borderRadius: 6,
                                    background: 'rgba(217,119,6,0.85)',
                                    color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                                }}>
                                    {tripData.totalEstimatedBudget}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── ACTION BUTTONS ────────────────────────────── */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
                    {onSave && (
                        <button
                            className="btn-primary"
                            onClick={onSave}
                            disabled={saving}
                            style={{ padding: '14px 36px', fontSize: '1rem' }}
                        >
                            {saving ? 'Saving...' : 'Save Trip to Dashboard'}
                        </button>
                    )}
                </div>

                {/* ─── BUDGET CHART ──────────────────────────────── */}
                {tripData.budgetBreakdown && (
                    <div style={{ marginBottom: 28 }} className="animate-fade-in">
                        <BudgetChart
                            budgetBreakdown={tripData.budgetBreakdown}
                            totalBudget={tripData.totalEstimatedBudget}
                        />
                    </div>
                )}

                {/* ─── TRANSPORT ─────────────────────────────────── */}
                {tripData.transportSuggestions && (
                    <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 28 }}>
                        <h3 style={{
                            fontWeight: 700, fontSize: '1.1rem',
                            marginBottom: 18,
                        }}>
                            Getting There & Around
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}>
                            <div style={{
                                padding: '18px', borderRadius: 10,
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--border-color)',
                            }}>
                                <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                                    Reaching {tripData.destination}
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {tripData.transportSuggestions.reachingDestination}
                                </p>
                            </div>
                            <div style={{
                                padding: '18px', borderRadius: 10,
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--border-color)',
                            }}>
                                <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                                    Local Transport
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {tripData.transportSuggestions.localTransport}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── HOTELS ────────────────────────────────────── */}
                {tripData.hotels?.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                        <h3 style={{
                            fontWeight: 700, fontSize: '1.1rem',
                            marginBottom: 18,
                        }}>
                            Recommended Hotels
                        </h3>
                        <div className="stagger-children" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 18,
                        }}>
                            {tripData.hotels.map((hotel, i) => (
                                <HotelCard key={i} hotel={hotel} index={i} />
                            ))}
                        </div>
                    </div>
                )}



                {/* ─── ITINERARY ─────────────────────────────────── */}
                {tripData.itinerary?.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                        <h3 style={{
                            fontWeight: 700, fontSize: '1.1rem',
                            marginBottom: 18,
                        }}>
                            Day-by-Day Itinerary
                        </h3>
                        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {tripData.itinerary.map((day, i) => (
                                <DayCard key={i} day={day} destination={tripData.destination} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── TIPS ──────────────────────────────────────── */}
                {tripData.tips?.length > 0 && (
                    <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 28 }}>
                        <h3 style={{
                            fontWeight: 700, fontSize: '1.1rem',
                            marginBottom: 14,
                        }}>
                            Travel Tips
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                            {tripData.tips.map((tip, i) => (
                                <div key={i} style={{
                                    padding: '12px 16px', borderRadius: 8,
                                    background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                                    display: 'flex', alignItems: 'baseline', gap: 8,
                                    fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                                }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
