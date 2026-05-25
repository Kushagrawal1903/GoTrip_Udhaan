import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TravelerRow from './TravelerRow';

const DURATION_PRESETS = [
    { label: 'Weekend', value: 3 },
    { label: 'Short', value: 5 },
    { label: 'Week', value: 7 },
    { label: 'Fortnight', value: 14 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function StepDuration({ duration, travelers, destination, onUpdate }) {
    const activePreset = DURATION_PRESETS.find(p => p.value === duration);

    const handleUpdateTraveler = (id, field, value) => {
        const updated = travelers.map(t => t.id === id ? { ...t, [field]: value } : t);
        onUpdate('travelers', updated);
    };

    const handleAddTraveler = () => {
        if (travelers.length >= 10) return;
        const newTraveler = {
            id: Math.random().toString(36).substring(2, 9),
            name: '',
            origin: '',
            role: 'member'
        };
        onUpdate('travelers', [...travelers, newTraveler]);
    };

    const handleRemoveTraveler = (id) => {
        const updated = travelers.filter(t => t.id !== id);
        onUpdate('travelers', updated);
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Timeline slider section */}
            <motion.div variants={itemVariants} className="wiz-eyebrow">How long?</motion.div>
            <motion.h2 variants={itemVariants} className="wiz-headline">Plan your perfect timeline</motion.h2>
            <motion.p variants={itemVariants} className="wiz-subtext">
                Drag to set duration, then add traveler names and origins.
            </motion.p>

            {/* Big animated number */}
            <motion.div variants={itemVariants}>
                <div style={{ textAlign: 'center', marginBottom: 15 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={duration}
                            className="wiz-big-number"
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            {duration}
                        </motion.div>
                    </AnimatePresence>
                    <div className="wiz-big-number-label">
                        {duration === 1 ? 'Day' : 'Days'}
                    </div>
                </div>
            </motion.div>

            {/* Slider */}
            <motion.div variants={itemVariants}>
                <input
                    type="range"
                    className="wiz-slider"
                    min="1"
                    max="30"
                    value={duration}
                    onChange={(e) => onUpdate('duration', Number(e.target.value))}
                    style={{
                        background: `linear-gradient(to right, var(--wiz-teal) 0%, var(--wiz-teal) ${((duration - 1) / 29) * 100}%, var(--wiz-surface2) ${((duration - 1) / 29) * 100}%, var(--wiz-surface2) 100%)`,
                        marginBottom: 16
                    }}
                />
            </motion.div>

            {/* Presets */}
            <motion.div variants={itemVariants} className="wiz-presets" style={{ marginBottom: 40 }}>
                {DURATION_PRESETS.map((preset) => (
                    <button
                        key={preset.value}
                        type="button"
                        className={`wiz-preset-chip${activePreset?.value === preset.value ? ' active' : ''}`}
                        onClick={() => onUpdate('duration', preset.value)}
                    >
                        {preset.label} ({preset.value})
                    </button>
                ))}
            </motion.div>

            {/* Travelers setup section */}
            <motion.div variants={itemVariants} className="wiz-travelers" style={{ display: 'block', height: 'auto', marginBottom: 20 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 14
                }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        👥 Travelers Group Setup
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {travelers.length}/10 travelers
                    </span>
                </div>

                {/* Travelers rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {travelers.map((traveler, index) => (
                        <TravelerRow
                            key={traveler.id}
                            traveler={traveler}
                            index={index}
                            destination={destination}
                            onUpdate={handleUpdateTraveler}
                            onRemove={handleRemoveTraveler}
                        />
                    ))}
                </div>

                {/* Add traveler button */}
                {travelers.length < 10 && (
                    <button
                        type="button"
                        onClick={handleAddTraveler}
                        style={{
                            marginTop: 14,
                            padding: '10px 20px',
                            background: 'var(--color-primary-dark)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.2s',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                    >
                        <span>+ Add Traveler</span>
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
}
