import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ItineraryView from '../components/trip/ItineraryView';
import PackingList from '../components/PackingList';
import CollaboratorPanel from '../components/CollaboratorPanel';
import { TripSkeleton } from '../components/ui/Skeleton';
import ErrorAlert from '../components/ui/ErrorAlert';
import usePackingList from '../hooks/usePackingList';
import useCollaboration from '../hooks/useCollaboration';
import useSocket from '../hooks/useSocket';

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
        </div>
    );
}
