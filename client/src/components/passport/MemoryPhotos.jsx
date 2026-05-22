import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryPhotos({ photos, tripId, onUpload, onDelete }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [viewingAll, setViewingAll] = useState(false);

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (photos.length + files.length > 5) {
            alert(`You can only upload up to 5 photos per trip. You currently have ${photos.length}.`);
            return;
        }

        setUploading(true);
        try {
            await onUpload(tripId, files);
        } catch (error) {
            alert('Failed to upload photos. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Calculate cluster layout
    const visiblePhotos = photos.slice(0, 3); // Max 3 in the cluster
    const hasMore = photos.length > 3;

    return (
        <div className="pp-memory-section">
            <div className="pp-h3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Moments From This Journey</span>
                {photos.length < 5 && (
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="pp-photo-upload-btn"
                        disabled={uploading}
                        title="Add Photo"
                    >
                        {uploading ? '...' : '+'}
                    </button>
                )}
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                multiple 
                accept="image/*" 
                style={{ display: 'none' }} 
            />

            {photos.length === 0 && !uploading && (
                <div className="pp-photo-empty-state" onClick={() => fileInputRef.current?.click()}>
                    <div className="pp-body" style={{ opacity: 0.5, fontSize: '0.9rem', cursor: 'pointer' }}>
                        + Add a photo memory
                    </div>
                </div>
            )}

            {uploading && (
                <div className="pp-photo-empty-state">
                    <div className="pp-body" style={{ opacity: 0.5, fontSize: '0.9rem' }}>
                        Uploading...
                    </div>
                </div>
            )}

            {photos.length > 0 && (
                <div 
                    className="pp-photo-cluster" 
                    onClick={() => setViewingAll(true)}
                    style={{ cursor: 'pointer' }}
                >
                    {visiblePhotos.map((photo, index) => (
                        <motion.div 
                            key={photo._id || index}
                            className="pp-photo-item"
                            style={{ 
                                zIndex: index + 1,
                                // Calculate subtle offset based on index
                                left: `${index * 30}px`,
                                top: `${index * 10}px`,
                            }}
                            initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                            animate={{ 
                                opacity: 1, 
                                rotate: photo.rotation || (Math.random() * 8 - 4),
                                scale: 1
                            }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {index === 0 && <div className="pp-photo-tape" />}
                            <img src={photo.url} alt="Memory" loading="lazy" />
                        </motion.div>
                    ))}
                    {hasMore && (
                        <div className="pp-photo-more-badge">
                            +{photos.length - 3}
                        </div>
                    )}
                </div>
            )}

            {/* Simple View All / Delete Modal */}
            <AnimatePresence>
                {viewingAll && (
                    <motion.div 
                        className="pp-photo-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewingAll(false)}
                    >
                        <motion.div 
                            className="pp-photo-modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="pp-photo-modal-header">
                                <h3>Preserved Memories</h3>
                                <button onClick={() => setViewingAll(false)}>✕</button>
                            </div>
                            <div className="pp-photo-modal-grid">
                                {photos.map(photo => (
                                    <div key={photo._id} className="pp-photo-modal-item">
                                        <img src={photo.url} alt="Memory" />
                                        <button 
                                            className="pp-photo-delete-btn"
                                            onClick={async () => {
                                                if (window.confirm('Remove this photo?')) {
                                                    await onDelete(tripId, photo._id);
                                                    if (photos.length === 1) setViewingAll(false);
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
