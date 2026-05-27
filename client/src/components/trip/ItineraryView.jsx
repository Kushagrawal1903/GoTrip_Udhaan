import { useState } from 'react';
import DayCard from './DayCard';
import HotelCard from './HotelCard';
import BudgetChart from './BudgetChart';
import Day0Card from './Day0Card';

/**
 * ItineraryView — Full-width trip result display
 */
export default function ItineraryView({ tripData, placeDetails, onSave, saving, canEdit, editingDay, editValues, isSaving, saveError, onStartEdit, onDiscard, onSaveEdit, onEditChange, meetingPlan }) {
    const [heroImgFailed, setHeroImgFailed] = useState(false);

    if (!tripData) return null;

    const destinationImage = placeDetails?.photoUrl;
    const showHeroImg = destinationImage && !heroImgFailed;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }} className="mobile-p-md">
            <div className="animate-fade-in-up">

                {/* ─── NARRATIVE PARAGRAPH ──────────────────────── */}
                {tripData.narrativeParagraph && (
                    <div className="story-narrative">
                        <p className="story-narrative-text">
                            {tripData.narrativeParagraph}
                        </p>
                    </div>
                )}

                {/* ─── TRIP OVERVIEW ─────────────────────────────── */}
                <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    {/* Detailed Budget Range (Full width/prominent) */}
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

                {/* ─── WOW MOMENT ────────────────────────────────── */}
                {tripData.wowMoment && (
                    <div className="story-wow" style={{ marginBottom: 28, borderRadius: 16 }}>
                        <p className="story-wow-label">✦ The Moment You'll Never Forget</p>
                        <h3 className="story-wow-title">{tripData.wowMoment.title}</h3>
                        <p className="story-wow-narrative">{tripData.wowMoment.description}</p>
                        {tripData.wowMoment.reflection && (
                            <p className="story-wow-why">{tripData.wowMoment.reflection}</p>
                        )}
                    </div>
                )}

                {/* ─── MUST TRY FOOD ────────────────────────────────── */}
                {tripData.mustTryFood && (
                    <div className="glass-card animate-fade-in-up" style={{ padding: '24px 28px', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                            <div style={{ 
                                width: 48, height: 48, borderRadius: 12, 
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))', 
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: '#f59e0b', fontSize: '1.5rem', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                            }}>
                                🍜
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                    Must Try Food
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    The most iconic local flavor in {tripData.destination}
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                            <div style={{ flex: '1 1 250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                                        {tripData.mustTryFood.dishName}
                                    </h4>
                                    <span style={{ 
                                        padding: '4px 10px', borderRadius: 20, 
                                        background: 'rgba(245, 158, 11, 0.1)', 
                                        color: '#f59e0b', fontSize: '0.7rem', 
                                        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' 
                                    }}>
                                        Local Favorite
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                                    {tripData.mustTryFood.description}
                                </p>
                                
                                <div style={{ 
                                    background: 'var(--bg-glass)', 
                                    border: '1px solid var(--border-color)', 
                                    padding: '14px 18px', 
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10,
                                            background: 'rgba(13, 148, 136, 0.1)',
                                            color: 'var(--wiz-teal, #0d9488)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem'
                                        }}>
                                            <i className="ti ti-building-store" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 2 }}>
                                                Best Place to Eat
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {tripData.mustTryFood.bestPlaceToEat}
                                            </div>
                                        </div>
                                    </div>
                                    {tripData.mustTryFood.mapsLink && (
                                        <a href={tripData.mustTryFood.mapsLink} target="_blank" rel="noopener noreferrer" style={{
                                            padding: '8px 16px', borderRadius: 8,
                                            background: 'rgba(99, 102, 241, 0.08)',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            color: '#6366f1',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }} 
                                        className="hover-scale"
                                        title="View on Google Maps">
                                            <i className="ti ti-map-pin" style={{ fontSize: '1rem' }} />
                                            <span>Maps</span>
                                        </a>
                                    )}
                                </div>
                            </div>
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
                            {meetingPlan && <Day0Card meetingPlan={meetingPlan} />}
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
