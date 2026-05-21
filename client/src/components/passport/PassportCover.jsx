import { motion } from 'framer-motion';

export default function PassportCover({ userName, onClick }) {
    return (
        <motion.div 
            className="passport-cover"
            onClick={onClick}
            initial={{ rotateY: 0 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
            style={{ transformOrigin: 'left center' }}
        >
            <div className="passport-cover-globe">🌐</div>
            <h1 className="passport-cover-title">PASSPORT</h1>
            <div className="passport-cover-divider"></div>
            <div className="passport-cover-name">{userName}</div>
            
            <div style={{ position: 'absolute', bottom: '32px', fontSize: '0.7rem', color: 'rgba(184, 148, 30, 0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                GoTrip Pro
            </div>
        </motion.div>
    );
}
