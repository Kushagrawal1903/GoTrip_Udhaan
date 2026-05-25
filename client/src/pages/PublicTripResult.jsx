import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ItineraryView from '../components/trip/ItineraryView';
import PackingList from '../components/PackingList';
import GettingThereSection from '../components/trip/GettingThereSection';
import { TripSkeleton } from '../components/ui/Skeleton';
import ErrorAlert from '../components/ui/ErrorAlert';
import StoryHero from '../components/story/StoryHero';
import TripMap from '../components/map/TripMap';
import '../styles/story.css';

/**
 * PublicTripResult — public read-only view of a shared trip.
 * No authentication required. No edit/collaborate/export controls.
 */
export default function PublicTripResult() {
    const { shareId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPublicTrip = async () => {
            try {
                // Using axios instance directly or api wrapper if it doesn't enforce auth token for this route
                // Wait, our `api` interceptor might attach token if it exists, but the backend doesn't require it.
                // We'll use the api wrapper which is fine.
                const res = await api.get(`/share/${shareId}`);
                setTrip(res.data.data.trip);
            } catch (err) {
                setError(err.response?.data?.message || 'This trip is no longer available or the link is invalid.');
            } finally {
                setLoading(false);
            }
        };
        fetchPublicTrip();
    }, [shareId]);

    if (loading) {
        return (
            <div style={{ padding: '40px 24px' }}>
                <TripSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                <ErrorAlert message={error} onRetry={() => window.location.reload()} />
                <div style={{ marginTop: 24 }}>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
                        Create Your Own Trip with GoTrip
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

    // Calculate packing list progress for read-only display
    const packingList = trip.packingList || { categories: [] };
    let checked = 0;
    let total = 0;
    packingList.categories.forEach(cat => {
        cat.items?.forEach(item => {
            total++;
            if (item.checked) checked++;
        });
    });
    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    const progress = { checked, total, percent };

    return (
        <>
            <StoryHero story={{
                destination: trip.destination,
                destinationImage: trip.destinationImage,
                duration: trip.duration,
                budget: trip.budget,
                travelers: trip.travelers,
                travelStyle: trip.travelStyle,
                tripData: trip.tripData,
                story: trip.story || {}
            }} />
        <div className="animate-fade-in-up" style={{ padding: '40px 24px' }}>
            {/* Header banner for public viewers */}
            <div style={{
                maxWidth: 1000,
                margin: '0 auto 24px',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(15, 118, 110, 0.1) 100%)',
                borderRadius: 12,
                border: '1px solid rgba(13, 148, 136, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '1.5rem' }}>✨</div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            Shared Itinerary
                        </h2>
                        <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: 'var(--text-muted)' }}>
                            This is a read-only view of a trip planned with GoTrip.
                        </p>
                    </div>
                </div>
                <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '0.9rem' }}>
                    Plan Your Own Trip
                </Link>
            </div>

            {trip.hasOrigins && (
                <div style={{ maxWidth: 1000, margin: '0 auto', marginBottom: 20 }}>
                    <GettingThereSection
                        trip={trip}
                        loading={false}
                        error={null}
                        optimizeTravel={undefined}
                    />
                </div>
            )}

            <ItineraryView
                tripData={trip.tripData}
                placeDetails={placeDetails}
                meetingPlan={trip.meetingPlan}
            />
        </div> {/* End of first animated section */}

        {/* Interactive Travel Map Section (At root level to allow position: fixed for fullscreen) */}
        <div style={{ padding: '0 24px' }}>
            <TripMap 
                tripId={trip._id} 
                tripData={trip.tripData} 
                totalDays={trip.duration} 
            />
        </div>

        {/* Second animated section */}
        <div className="animate-fade-in-up" style={{ padding: '0 24px 40px' }}>
            {/* Packing List Section (Read Only) */}
            {packingList.categories && packingList.categories.length > 0 && (
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <PackingList
                        packingList={packingList}
                        generating={false}
                        error={null}
                        onGenerate={undefined}
                        onToggle={undefined} // Undefined makes it read-only
                        progress={progress}
                        onDownload={() => {
                            // Simple text download for public view
                            let text = `Packing List for ${trip.destination}\n\n`;
                            packingList.categories.forEach(cat => {
                                text += `[ ${cat.name} ]\n`;
                                cat.items.forEach(item => {
                                    text += `${item.checked ? '☑' : '☐'} ${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}\n`;
                                });
                                text += '\n';
                            });
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `PackingList-${trip.destination}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    />
                </div>
            )}
        </div>
        </>
    );
}
