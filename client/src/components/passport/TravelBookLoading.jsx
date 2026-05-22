import React from 'react';
import { motion } from 'framer-motion';

export default function TravelBookLoading() {
    return (
        <motion.div 
            className="pp-travel-book-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="pp-loading-content">
                <motion.div 
                    className="pp-loading-book"
                    animate={{ rotateY: [0, -180] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                    <div className="pp-loading-page left" />
                    <div className="pp-loading-page right" />
                </motion.div>
                
                <h2 className="pp-h2" style={{ color: 'var(--pp-gold)', marginTop: '30px' }}>
                    Preserving Your Memory Journal...
                </h2>
                <div className="pp-body" style={{ color: 'var(--pp-gold)', opacity: 0.7, marginTop: '10px' }}>
                    Binding your journeys, photos, and kept thoughts into a keepsake.
                </div>
                
                <div className="pp-loading-bar-container">
                    <motion.div 
                        className="pp-loading-bar"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
