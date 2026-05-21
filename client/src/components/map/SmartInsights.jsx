import { useMemo } from 'react';
import { calculateInsights } from '../../utils/mapUtils';

/**
 * SmartInsights — Displays AI-like travel geography insights based on actual distance calculations.
 */
export default function SmartInsights({ locations, totalDays }) {
    const insights = useMemo(() => calculateInsights(locations, totalDays), [locations, totalDays]);

    if (!insights || insights.length === 0) return null;

    return (
        <div className="smart-insights">
            <div className="smart-insights-title">Travel Intelligence</div>
            {insights.map((insight, index) => (
                <div key={index} className={`smart-insight-item ${insight.type}`}>
                    <span className="smart-insight-icon">{insight.icon}</span>
                    <span className="smart-insight-text">{insight.text}</span>
                </div>
            ))}
        </div>
    );
}
