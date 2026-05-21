import { getMarkerConfig } from '../../utils/mapUtils';

/**
 * MapLegend — Shows color coding for map marker types
 */
export default function MapLegend() {
    const types = ['hotel', 'attraction', 'restaurant', 'transport', 'shopping'];

    return (
        <div className="map-legend">
            {types.map(type => {
                const config = getMarkerConfig(type);
                return (
                    <div key={type} className="map-legend-item">
                        <div
                            className="map-legend-dot"
                            style={{ background: config.color }}
                        />
                        {config.label}
                    </div>
                );
            })}
        </div>
    );
}
