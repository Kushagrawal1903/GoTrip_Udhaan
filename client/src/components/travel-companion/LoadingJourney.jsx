import { motion } from 'framer-motion';

export default function LoadingJourney() {
    return (
        <div className="loading-journey-container">
            <span className="loading-journey-text">Thinking about your journey...</span>
            <div className="loading-route">
                <div className="route-dot start"></div>
                <div className="route-line-container">
                    <motion.div 
                        className="route-line-progress"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    />
                </div>
                <div className="route-dot end"></div>
            </div>
        </div>
    );
}
