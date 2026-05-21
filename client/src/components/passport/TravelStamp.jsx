import { motion } from 'framer-motion';

export default function TravelStamp({ destination, date, color = '#8b2500' }) {
    // Determine short date format like "MAY 2026"
    const parsedDate = new Date(date);
    const dateStr = !isNaN(parsedDate.getTime()) 
        ? parsedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
        : 'VISITED';

    // Create a 2-3 letter abbreviation for the stamp background if needed
    const abbr = destination.substring(0, 3).toUpperCase();

    return (
        <motion.div 
            className="travel-stamp"
            style={{ color, borderColor: color }}
            initial={{ opacity: 0, scale: 1.4, rotate: -25 }}
            whileInView={{ opacity: 0.8, scale: 1, rotate: -12 + (Math.random() * 8 - 4) }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
        >
            <div className="travel-stamp-destination">{abbr}</div>
            <div className="travel-stamp-label">ARRIVED</div>
            <div className="travel-stamp-date">{dateStr}</div>
        </motion.div>
    );
}
