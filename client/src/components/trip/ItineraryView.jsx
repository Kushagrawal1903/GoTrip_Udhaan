import { useState } from 'react';
import DayCard from './DayCard';
import HotelCard from './HotelCard';
import BudgetChart from './BudgetChart';

/**
 * ItineraryView — Full-width trip result display
 */
export default function ItineraryView({ tripData, placeDetails, onSave, saving, canEdit, editingDay, editValues, isSaving, saveError, onStartEdit, onDiscard, onSaveEdit, onEditChange }) {
    const [heroImgFailed, setHeroImgFailed] = useState(false);

    if (!tripData) return null;

    const destinationImage = placeDetails?.photoUrl;
    const showHeroImg = destinationImage && !heroImgFailed;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }} className="mobile-p-md">
            <div className="animate-fade-in-up">

                {/* ─── DESTINATION HERO BANNER ───────────────────── */}
                <div style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 24,
                    position: 'relative',
                    height: 'clamp(200px, 30vh, 280px)',
                    background: '#1e293b',
                    boxShadow: 'var(--shadow-lg)',
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
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.3) 100%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Text */}
                    <div style={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, 
                        padding: 'clamp(16px, 4vw, 28px)', 
                        zIndex: 1 
                    }}>
                        <h1 style={{
                            fontWeight: 800,
                            fontSize: 'clamp(1.5rem, 5vw, 2.4rem)',
                            color: '#fff', marginBottom: 8,
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}>
                            {tripData.destination}
                        </h1>
                    </div>
                </div>

                {/* ─── TRIP OVERVIEW BADGES ──────────────────────── */}
                <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    {/* Top row: Days, Travelers, Category */}
                    <div style={{ 
                        display: 'flex', gap: 8, flexWrap: 'nowrap', 
                        overflowX: 'auto', width: '100%', justifyContent: 'center',
                        scrollbarWidth: 'none', msOverflowStyle: 'none',
                        padding: '0 4px'
                    }} className="no-scrollbar">
                        {[
                            { val: `${tripData.duration} Days`, icon: '📅' },
                            { val: `${tripData.travelers} ${tripData.travelers === 1 ? 'Traveler' : 'Travelers'}`, icon: '👤', hide: !tripData.travelers },
                            { val: tripData.budgetCategory, icon: '💰' }
                        ].map((badge, idx) => !badge.hide && (
                            <div key={idx} style={{
                                padding: '6px 12px', borderRadius: 10,
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontSize: '0.78rem', fontWeight: 700,
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex', alignItems: 'center', gap: 5,
                                whiteSpace: 'nowrap', flexShrink: 0,
                            }}>
                                <span style={{ opacity: 0.8 }}>{badge.icon}</span>
                                {badge.val}
                            </div>
                        ))}
                    </div>

                    {/* Bottom row: Detailed Budget Range (Full width/prominent) */}
                    {tripData.totalEstimatedBudget && (
                        <div style={{
                            padding: '12px 20px', borderRadius: 14,
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem', fontWeight: 600,
                            border: '1.5px solid var(--color-primary)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex', alignItems: 'center', gap: 10,
                            textAlign: 'center', maxWidth: '100%',
                            lineHeight: 1.4,
                        }}>
                            <span style={{ 
                                background: 'rgba(13, 148, 136, 0.1)', 
                                padding: '6px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>✨</span>
                            </span>
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                                    Estimated Total Budget
                                </span>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {tripData.totalEstimatedBudget}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── ACTION BUTTONS ────────────────────────────── */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                    {onSave && (
                        <button
                            className="btn-primary"
                            onClick={onSave}
                            disabled={saving}
                            style={{ padding: '12px 32px', fontSize: '0.95rem', width: '100%', maxWidth: 300 }}
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
                        <div className="transport-grid" style={{
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
                        <div className="hotel-grid stagger-children" style={{
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
                                <DayCard
                                    key={i}
                                    day={day}
                                    dayIndex={i}
                                    destination={tripData.destination}
                                    canEdit={canEdit}
                                    isEditing={editingDay === i}
                                    editValues={editingDay === i ? editValues : null}
                                    isSaving={isSaving}
                                    saveError={editingDay === i ? saveError : null}
                                    onStartEdit={onStartEdit}
                                    onDiscard={onDiscard}
                                    onSaveEdit={onSaveEdit}
                                    onEditChange={onEditChange}
                                />
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
                        <div className="tips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
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
