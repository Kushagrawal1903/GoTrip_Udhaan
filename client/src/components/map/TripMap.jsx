import { useState, useMemo, useEffect } from 'react';
import useMapData from '../../hooks/useMapData';
import MapContainer from './MapContainer';
import MapFilters from './MapFilters';
import MapLegend from './MapLegend';
import LocationSidebar from './LocationSidebar';
import SmartInsights from './SmartInsights';
import LoadingState from './LoadingState';
import { FaMapMarkedAlt, FaExpand, FaCompress } from 'react-icons/fa';
import '../../styles/map.css';

/**
 * TripMap — Main orchestrator component for the Interactive Travel Intelligence Map feature.
 * Connects data fetching, state management, and all sub-components.
 */
export default function TripMap({ tripId, tripData, totalDays }) {
    // Fetch map data
    const { locations, center, destination, loading, error, retry } = useMapData(tripId, tripData);

    // State
    const [dayFilter, setDayFilter] = useState(0); // 0 = Entire Trip
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeLocationId, setActiveLocationId] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toggle body scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFullscreen]);

    // Filter locations based on state
    const visibleLocations = useMemo(() => {
        if (!locations) return [];
        
        return locations.filter(loc => {
            // Day filter: show all if 0, otherwise match day (hotels day 0 always show)
            const dayMatch = dayFilter === 0 || loc.day === dayFilter || loc.day === 0;
            
            // Category filter
            const catMatch = categoryFilter === 'all' || loc.category === categoryFilter;
            
            return dayMatch && catMatch;
        });
    }, [locations, dayFilter, categoryFilter]);

    // Handle marker/sidebar click
    const handleLocationClick = (location) => {
        setActiveLocationId(prev => prev === location.id ? null : location.id);
    };

    // If there's an unrecoverable error and no locations, don't show the section
    if (error && (!locations || locations.length === 0)) {
        return (
            <div className="trip-map-section">
                <div className="map-error-state">
                    <div className="map-error-icon">🗺️</div>
                    <p className="map-error-text">{error}</p>
                    <button className="map-error-retry" onClick={retry}>Retry Loading Map</button>
                </div>
            </div>
        );
    }

    // Quick exit if no valid trip data yet
    if (!tripData) return null;

    return (
        <div className={`trip-map-section ${isFullscreen ? 'is-fullscreen' : ''}`}>
            <div className="trip-map-section-header">
                <div className="trip-map-section-icon">
                    <FaMapMarkedAlt color="var(--color-primary)" size={20} />
                </div>
                <div>
                    <h2 className="trip-map-section-title">Explore Your Trip</h2>
                    <p className="trip-map-section-subtitle">Interactive geography & insights</p>
                </div>
                <button 
                    className="trip-map-fullscreen-btn"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
            </div>

            {loading ? (
                <LoadingState />
            ) : (
                <div className="trip-map-layout animate-fade-in-up">
                    {/* LEFT COLUMN: Map + Filters */}
                    <div className="trip-map-left">
                        <MapFilters 
                            totalDays={totalDays}
                            dayFilter={dayFilter}
                            setDayFilter={(d) => { setDayFilter(d); setActiveLocationId(null); }}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={(c) => { setCategoryFilter(c); setActiveLocationId(null); }}
                        />
                        
                        <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
                            <MapContainer 
                                locations={visibleLocations}
                                center={center}
                                destination={destination}
                                dayFilter={dayFilter}
                                activeLocationId={activeLocationId}
                                onLocationClick={handleLocationClick}
                                isFullscreen={isFullscreen}
                            />
                            <MapLegend />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar + Insights */}
                    <div className="trip-map-right">
                        {/* Only show insights when viewing "Entire Trip" */}
                        {dayFilter === 0 && (
                            <SmartInsights 
                                locations={locations} 
                                totalDays={totalDays} 
                            />
                        )}
                        
                        <LocationSidebar 
                            locations={visibleLocations}
                            activeLocationId={activeLocationId}
                            onLocationClick={handleLocationClick}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
