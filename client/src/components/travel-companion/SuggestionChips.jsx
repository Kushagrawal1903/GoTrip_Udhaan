import { motion } from 'framer-motion';

const ALL_CHIPS = [
    { label: "Make it more relaxing", intent: "pace_optimization" },
    { label: "Add local food", intent: "food_addition" },
    { label: "Reduce budget", intent: "budget_reduce" },
    { label: "Add hidden gems", intent: "hidden_gems" },
    { label: "Add nightlife", intent: "nightlife_addition", avoid: "family" },
    { label: "Make it romantic", intent: "romantic_upgrade", avoid: "family" },
    { label: "Less walking", intent: "walking_reduction" },
    { label: "Optimize route", intent: "route_optimization" }
];

export default function SuggestionChips({ onSelect, trip }) {
    const travelStyle = trip?.travelStyle?.toLowerCase() || '';
    
    // Filter out chips that don't make sense for the travel style
    const validChips = ALL_CHIPS.filter(chip => chip.avoid !== travelStyle);

    return (
        <div className="suggestion-chips-container">
            {validChips.map((chip, idx) => (
                <motion.button
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => onSelect(chip.label)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {chip.label}
                </motion.button>
            ))}
        </div>
    );
}
