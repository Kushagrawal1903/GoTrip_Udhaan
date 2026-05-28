import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITIES = [
  "✨ Someone just planned a Japan trip",
  "✨ Switzerland itinerary generated",
  "✨ Goa trip personalized",
  "✨ Bali romantic getaway planned",
  "✨ New passport memory added"
];

export default function ActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      pointerEvents: 'none',
      overflow: 'hidden',
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(20, 24, 32, 0.4)',
      backdropFilter: 'blur(8px)',
      padding: '4px 16px',
      borderRadius: 100,
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}
        >
          {ACTIVITIES[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
