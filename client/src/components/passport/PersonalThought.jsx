import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PersonalThought({ thought, tripId, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempThought, setTempThought] = useState(thought || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (!isEditing) {
            setTempThought(thought || '');
        }
    }, [thought, isEditing]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        const success = await onUpdate(tripId, { personalThought: tempThought });
        setIsSaving(false);
        if (success) {
            setIsEditing(false);
        } else {
            setSaveError('Could not save. Please try again.');
        }
    };

    if (isEditing) {
        return (
            <div className="pp-thought-note editing">
                <div className="pp-tape" />
                <textarea 
                    className="pp-thought-textarea"
                    value={tempThought}
                    onChange={(e) => setTempThought(e.target.value)}
                    placeholder="A thought waiting to be kept..."
                    autoFocus
                    maxLength={1000}
                />
                <div className="pp-thought-actions">
                    {saveError && <span className="pp-thought-error">{saveError}</span>}
                    <button onClick={() => { setIsEditing(false); setSaveError(''); }} disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Keep'}</button>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="pp-thought-note"
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.02 }}
            style={{ cursor: 'pointer' }}
        >
            <div className="pp-tape" />
            <div className="pp-h3" style={{ fontSize: '0.55rem', margin: '0 0 10px 10px' }}>A Thought Worth Keeping</div>
            <div className="pp-handwriting" style={{ padding: '0 20px 20px', minHeight: '60px' }}>
                {thought ? (
                    <span>{thought}</span>
                ) : (
                    <span style={{ opacity: 0.5 }}>A thought waiting to be kept...</span>
                )}
            </div>
        </motion.div>
    );
}
