import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
    { id: 'peaceful', emoji: '🌿', label: 'Peaceful' },
    { id: 'adventurous', emoji: '🏔️', label: 'Adventurous' },
    { id: 'emotional', emoji: '❤️', label: 'Emotional' },
    { id: 'cultural', emoji: '🏛️', label: 'Cultural' },
    { id: 'relaxing', emoji: '🌊', label: 'Relaxing' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic' },
    { id: 'reflective', emoji: '🍃', label: 'Reflective' },
];

export default function MoodSelector({ currentMood, defaultMood, tripId, onUpdate }) {
    const [isSelecting, setIsSelecting] = useState(false);
    const badgeRef = useRef(null);
    const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 });

    // If user has selected a mood, show it. Otherwise, fallback to the AI generated mood.
    const displayMood = currentMood 
        ? (MOODS.find(m => m.id === currentMood) || { emoji: '✨', label: 'Journey' })
        : { emoji: defaultMood?.emoji || '✨', label: defaultMood?.label || 'Journey' };

    useEffect(() => {
        if (!isSelecting || !badgeRef.current) return;
        const rect = badgeRef.current.getBoundingClientRect();
        setPopupStyle({
            top: rect.bottom + 6,
            left: rect.left,
        });
    }, [isSelecting]);

    const handleSelect = async (moodId) => {
        setIsSelecting(false);
        if (moodId !== currentMood) {
            await onUpdate(tripId, { userMood: moodId });
        }
    };

    const popup = (
        <AnimatePresence>
            {isSelecting && (
                <motion.div 
                    className="pp-mood-selector-popup pp-mood-selector-popup--portal"
                    style={{ top: popupStyle.top, left: popupStyle.left }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {MOODS.map(mood => (
                        <div 
                            key={mood.id}
                            className={`pp-mood-option ${currentMood === mood.id ? 'active' : ''}`}
                            onClick={() => handleSelect(mood.id)}
                        >
                            <span>{mood.emoji}</span> {mood.label}
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="pp-mood-container" style={{ position: 'relative', display: 'inline-block' }}>
            <motion.div 
                ref={badgeRef}
                className="pp-mood-badge"
                onClick={() => setIsSelecting(!isSelecting)}
                whileHover={{ scale: 1.05 }}
                style={{ cursor: 'pointer' }}
            >
                <span>{displayMood.emoji}</span>
                <span style={{ textTransform: 'capitalize' }}>{displayMood.label}</span>
            </motion.div>

            {typeof document !== 'undefined' && createPortal(popup, document.body)}
        </div>
    );
}
