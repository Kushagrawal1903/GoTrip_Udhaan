import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * useMapData — Fetches and manages normalized map location data for a trip.
 * Handles loading state, error recovery, and caching.
 *
 * @param {string} tripId - Trip document ID
 * @param {object} tripData - Existing tripData from the trip (for quick checks)
 * @returns {object} { locations, center, destination, loading, error, retry }
 */
export default function useMapData(tripId, tripData) {
    const [locations, setLocations] = useState([]);
    const [center, setCenter] = useState(null);
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    const fetchMapData = useCallback(async () => {
        if (!tripId || !tripData) {
            setLoading(false);
            return;
        }

        // Quick check: does the trip have enough data to show a map?
        const hasItinerary = tripData.itinerary && tripData.itinerary.length > 0;
        const hasHotels = tripData.hotels && tripData.hotels.length > 0;
        if (!hasItinerary && !hasHotels) {
            setLoading(false);
            setError('No location data available for map.');
            return;
        }

        setLoading(true);
        setError(null);

        // Cancel any in-flight request
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await api.post(`/trips/${tripId}/map-data`, {}, {
                signal: controller.signal,
                timeout: 120000, // Geocoding can take time for many places
            });

            // Ignore response if this request was already superseded
            if (controller.signal.aborted) return;

            if (res.data.success) {
                const { locations: locs, center: ctr, destination: dest } = res.data.data;
                setLocations(locs || []);
                setCenter(ctr || null);
                setDestination(dest || '');

                if (!locs || locs.length === 0) {
                    setError('Could not locate any places on the map.');
                }
            } else {
                setError('Failed to load map data.');
            }
        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                console.error('Map data fetch error:', err);
                setError('Failed to load map data. Please try again.');
            }
            return; // Don't set loading=false in catch; finally handles it
        } finally {
            // Only set loading to false if this is still the active request
            if (abortRef.current === controller) {
                setLoading(false);
            }
        }
    }, [tripId, tripData]);

    useEffect(() => {
        fetchMapData();

        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [fetchMapData]);

    const retry = useCallback(() => {
        fetchMapData();
    }, [fetchMapData]);

    return {
        locations,
        center,
        destination,
        loading,
        error,
        retry,
    };
}
