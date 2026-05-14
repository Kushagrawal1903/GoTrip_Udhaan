import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ItineraryView from '../components/trip/ItineraryView';
import PackingList from '../components/PackingList';
import CollaboratorPanel from '../components/CollaboratorPanel';
import TripEmailModal from '../components/trip/TripEmailModal';
import { TripSkeleton } from '../components/ui/Skeleton';
import ErrorAlert from '../components/ui/ErrorAlert';
import usePackingList from '../hooks/usePackingList';
import useCollaboration from '../hooks/useCollaboration';
import useSocket from '../hooks/useSocket';
import useTripEmail from '../hooks/useTripEmail';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

/**
 * TripResult — view a single saved trip with packing list, PDF export, and collaboration
 */
export default function TripResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);
    const [collabOpen, setCollabOpen] = useState(false);

    // Determine ownership
    const isOwner = trip && user && trip.userId === user.id;

    // Packing list hook
    const packing = usePackingList(id, trip?.packingList);

    // Collaboration hook
    const collab = useCollaboration(id, isOwner);

    /**
     * Share on WhatsApp — Click-to-Chat (no API, no modal, no phone input).
     * Generates a premium pre-filled message and opens wa.me in a new tab.
     */
    const handleShareWhatsApp = async () => {
        if (!trip) return;

        try {
            // 1. Get or generate the public shareId from backend
            const res = await api.post(`/trips/${id}/share`);
            const shareId = res.data.data.shareId;
            
            // 2. Build the public trip URL
            const clientUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
            const tripUrl = `${clientUrl}/share/${shareId}`;

            const destination = trip.destination || 'an amazing destination';
            
            let durationStr = null;
            if (trip.duration) {
                const days = trip.duration;
                const nights = days > 1 ? days - 1 : 0;
                durationStr = nights > 0 ? `${days} Days / ${nights} Nights` : `${days} Day`;
            }

            const travelers = trip.travelers || null;

            // Budget: map tier to friendly label, prefer estimated cost from tripData
            const budgetMap = { low: 'Budget-Friendly', moderate: 'Moderate', premium: 'Premium' };
            const estimatedCost = trip.tripData?.estimatedBudget || trip.tripData?.totalBudget || trip.tripData?.budget;
            const budget = estimatedCost ? String(estimatedCost) : (budgetMap[trip.budget] || trip.budget || null);

            // Travel style (capitalize first letter)
            const travelStyle = trip.travelStyle
                ? trip.travelStyle.charAt(0).toUpperCase() + trip.travelStyle.slice(1)
                : null;

            // Build premium message matching exact requested format (using ES6 Unicode code points)
            let message = `\u{1F30D} *Your GoTrip Itinerary is Ready!* \u{2708}\u{FE0F}\n\n`;
            message += `Hey \u{1F44B}\n\n`;
            message += `Your personalized trip to *${destination}* is all set and ready to explore!\n\n`;
            message += `---------------------------------------\n`;
            
            message += `\u{1F4CD} *Destination:* ${destination}\n`;
            if (durationStr) message += `\u{1F4C5} *Duration:* ${durationStr}\n`;
            if (travelers) message += `\u{1F465} *Travelers:* ${travelers} People\n`;
            if (budget) message += `\u{1F4B0} *Budget:* ${budget}\n`;
            if (travelStyle) message += `\u{1F392} *Travel Style:* ${travelStyle}\n`;
            message += `---------------------------------------\n`;

            message += `\u{2728} *Trip Highlights*\n`;
            message += `\u{2022} Curated places to visit\n`;
            message += `\u{2022} Smart budget planning\n`;
            message += `\u{2022} Recommended stays & activities\n`;
            message += `\u{2022} Travel tips for smoother journey\n`;
            message += `---------------------------------------\n\n`;
            
            message += `\u{1F517} *View Full Trip Details:*\n`;
            message += `${tripUrl}\n\n`;
            
            message += `Happy travels \u{1F334}\n`;
            message += `*Planned with GoTrip* \u{1F30D}`;

            // Open WhatsApp Click-to-Chat in new tab using official API endpoint
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Failed to generate share link:', error);
            alert('Could not generate share link. Please try again.');
        }
    };

    // Email delivery hook
    const tripEmail = useTripEmail(id);

    // Socket.io for real-time collaboration
    useSocket(id, {
        onNewComment: collab.onNewComment,
        onCommentUpdated: collab.onCommentUpdated,
        onCollaboratorRemoved: (data) => {
            if (data.userId === user?.id) {
                navigate('/dashboard');
            }
        },
    });

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/trips/${id}`);
                setTrip(res.data.data.trip);

                // Load comments from trip
                if (res.data.data.trip.comments) {
                    collab.setComments(res.data.data.trip.comments);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load trip.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
        collab.fetchCollaborators();
    }, [id]);

    // PDF export handler
    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('gotrip-token');
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${apiUrl}/export/pdf/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('PDF generation failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GoTrip-${trip?.destination || 'Trip'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('PDF generation failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px 24px' }}>
                <TripSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 24px' }}>
                <ErrorAlert message={error} onRetry={() => window.location.reload()} />
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/dashboard" className="btn-outline" style={{ textDecoration: 'none' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!trip) return null;

    const placeDetails = {
        photoUrl: trip.destinationImage,
        coordinates: trip.coordinates,
    };

    const collabCount = (trip.collaborators || []).length;

    return (
        <div className="animate-fade-in-up" style={{ padding: '40px 24px' }}>
            {/* Back + Action buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: 1000,
                margin: '0 auto 24px',
                flexWrap: 'wrap',
                gap: 10,
            }}>
                <Link to="/dashboard" style={{
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: 'rgba(13, 148, 136, 0.06)',
                    border: '1px solid rgba(13, 148, 136, 0.12)',
                    transition: 'all 0.2s',
                }}>
                    ← Back to My Trips
                </Link>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* Export PDF button */}
                    <button
                        className="btn-primary"
                        onClick={handleExportPDF}
                        disabled={exporting}
                        aria-label="Export trip as PDF"
                        style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        {exporting ? (
                            <>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                Generating PDF...
                            </>
                        ) : (
                            <>📄 Export PDF</>
                        )}
                    </button>

                    {/* Collaborate button */}
                    <button
                        className="btn-outline"
                        onClick={() => setCollabOpen(true)}
                        aria-label="Open collaboration panel"
                        style={{
                            padding: '8px 20px', fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: 6,
                            position: 'relative',
                        }}
                    >
                        👥 Collaborate
                        {collabCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -6, right: -6,
                                width: 20, height: 20, borderRadius: '50%',
                                background: 'var(--color-primary)', color: '#fff',
                                fontSize: '0.65rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {collabCount}
                            </span>
                        )}
                    </button>

                    {/* WhatsApp Click-to-Chat share — opens wa.me directly */}
                    {isOwner && (
                        <button
                            onClick={handleShareWhatsApp}
                            aria-label="Share trip on WhatsApp"
                            id="share-whatsapp-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '8px 20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#fff',
                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.25)';
                            }}
                        >
                            <FaWhatsapp size={16} />
                            Share on WhatsApp
                        </button>
                    )}

                    {/* Email button — only for trip owner */}
                    {isOwner && (
                        <button
                            onClick={tripEmail.open}
                            aria-label="Receive trip via email"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '8px 20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#fff',
                                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(13, 148, 136, 0.25)';
                            }}
                        >
                            <FaEnvelope size={15} />
                            Receive via Email
                        </button>
                    )}

                    <button
                        className="btn-outline"
                        onClick={() => navigate('/plan')}
                        style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    >
                        Plan New Trip
                    </button>
                </div>
            </div>

            {/* Trip Content */}
            <ItineraryView
                tripData={trip.tripData}
                placeDetails={placeDetails}
            />

            {/* Packing List Section */}
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <PackingList
                    packingList={packing.packingList}
                    generating={packing.generating}
                    error={packing.error}
                    onGenerate={packing.generate}
                    onToggle={packing.toggleItem}
                    progress={packing.progress}
                    onDownload={packing.downloadAsText}
                />
            </div>

            {/* Collaborator Panel */}
            <CollaboratorPanel
                isOpen={collabOpen}
                onClose={() => setCollabOpen(false)}
                isOwner={isOwner}
                tripId={id}
                tripData={trip.tripData}
                collaborators={collab.collaborators}
                comments={collab.comments}
                onInvite={collab.inviteByEmail}
                onGenerateLink={collab.generateInviteLink}
                onRemove={collab.removeCollaborator}
                onAddComment={collab.addComment}
                onHandleComment={collab.handleComment}
                error={collab.error}
            />

            {/* WhatsApp: No modal needed — Click-to-Chat opens wa.me directly */}

            {/* Email Modal */}
            <TripEmailModal
                isOpen={tripEmail.isOpen}
                onClose={tripEmail.close}
                onSend={tripEmail.send}
                sending={tripEmail.sending}
                error={tripEmail.error}
                success={tripEmail.success}
                destination={trip.destination}
                defaultEmail={user?.email || ''}
            />
        </div>
    );
}
