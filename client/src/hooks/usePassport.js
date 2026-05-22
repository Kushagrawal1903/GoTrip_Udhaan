import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function usePassport() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const fetchPassport = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/passport');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch passport.');
        } finally {
            setLoading(false);
        }
    }, []);

    const generatePassport = useCallback(async () => {
        setGenerating(true);
        setError('');
        try {
            const res = await api.post('/passport/generate');
            if (res.data.success) {
                // Fetch the updated passport data after generation
                await fetchPassport();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate passport memories.');
        } finally {
            setGenerating(false);
        }
    }, [fetchPassport]);

    const updateFavoriteMoment = useCallback(async (tripId, momentText) => {
        try {
            const res = await api.patch(`/passport/memory/${tripId}`, { favoriteMoment: momentText });
            if (res.data.success) {
                setData(prev => {
                    if (!prev || !prev.trips) return prev;
                    return {
                        ...prev,
                        trips: prev.trips.map(t => 
                            t.tripId === tripId ? { ...t, favoriteMoment: momentText } : t
                        )
                    };
                });
            }
        } catch (err) {
            console.error('Failed to update favorite moment', err);
        }
    }, []);

    const updateMemoryDetails = useCallback(async (tripId, updates) => {
        try {
            const res = await api.patch(`/passport/memory/${tripId}`, updates);
            if (res.data.success) {
                setData(prev => {
                    if (!prev || !prev.trips) return prev;
                    return {
                        ...prev,
                        trips: prev.trips.map(t => 
                            t.tripId === tripId ? { ...t, ...updates } : t
                        )
                    };
                });
            }
            return res.data.success;
        } catch (err) {
            console.error('Failed to update memory details', err);
            return false;
        }
    }, []);

    const uploadPhotos = useCallback(async (tripId, files) => {
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('photos', file);
            });

            const res = await api.post(`/passport/memory/${tripId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                setData(prev => {
                    if (!prev || !prev.trips) return prev;
                    return {
                        ...prev,
                        trips: prev.trips.map(t => 
                            t.tripId === tripId ? { ...t, photos: res.data.photos } : t
                        )
                    };
                });
                return true;
            }
        } catch (err) {
            console.error('Failed to upload photos', err);
            throw err;
        }
        return false;
    }, []);

    const deletePhoto = useCallback(async (tripId, photoId) => {
        try {
            const res = await api.delete(`/passport/memory/${tripId}/photos/${photoId}`);
            if (res.data.success) {
                setData(prev => {
                    if (!prev || !prev.trips) return prev;
                    return {
                        ...prev,
                        trips: prev.trips.map(t => 
                            t.tripId === tripId ? { ...t, photos: res.data.photos } : t
                        )
                    };
                });
                return true;
            }
        } catch (err) {
            console.error('Failed to delete photo', err);
            return false;
        }
    }, []);

    const downloadTravelBook = useCallback(async () => {
        try {
            const res = await api.get('/passport/travel-book', {
                responseType: 'blob' // Important for file downloads
            });

            const contentType = res.headers['content-type'] || '';
            if (!contentType.includes('application/pdf')) {
                const text = await res.data.text();
                let message = 'Could not save your memory journal.';
                try {
                    const parsed = JSON.parse(text);
                    message = parsed.message || message;
                } catch {
                    if (text) message = text;
                }
                throw new Error(message);
            }

            let journalName = 'My_Memory_Journal.pdf';
            const disposition = res.headers['content-disposition'] || '';
            const match = disposition.match(/filename="?([^"]+)"?/i);
            if (match?.[1]) {
                journalName = match[1];
            } else if (data?.user?.name) {
                journalName = `${data.user.name.replace(/[^a-zA-Z0-9]/g, '_')}_Memory_Journal.pdf`;
            }
            
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', journalName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (err) {
            console.error('Failed to save memory journal', err);
            throw err;
        }
    }, [data?.user?.name]);

    useEffect(() => {
        fetchPassport();
    }, [fetchPassport]);

    return {
        data,
        loading,
        generating,
        error,
        generatePassport,
        updateFavoriteMoment,
        updateMemoryDetails,
        uploadPhotos,
        deletePhoto,
        downloadTravelBook
    };
}
