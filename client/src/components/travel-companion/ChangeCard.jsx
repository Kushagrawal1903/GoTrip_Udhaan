import { FaTimes, FaCheck, FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';

export default function ChangeCard({ change }) {
    if (!change) return null;

    const slotLabel = change.slot ? change.slot.charAt(0).toUpperCase() + change.slot.slice(1) : '';

    return (
        <div className="change-card">
            <div className="change-card-header">
                <span className="change-slot">{slotLabel}</span>
            </div>
            
            <div className="change-card-body">
                {(change.type === 'replace' || change.type === 'remove' || change.type === 'modify') && change.removed && (
                    <div className="change-item removed">
                        <div className="change-icon-wrap"><FaTimes /></div>
                        <div className="change-content">
                            <span className="change-title">{change.removed.placeName}</span>
                        </div>
                    </div>
                )}
                
                {change.type === 'replace' && (
                    <div className="change-connector">
                        <div className="connector-line"></div>
                        <FaExchangeAlt className="connector-icon" />
                        <div className="connector-line"></div>
                    </div>
                )}

                {(change.type === 'replace' || change.type === 'add' || change.type === 'modify') && change.added && (
                    <div className="change-item added">
                        <div className="change-icon-wrap"><FaCheck /></div>
                        <div className="change-content">
                            <span className="change-title">{change.added.placeName}</span>
                            <span className="change-desc">{change.added.activity}</span>
                            
                            {change.added.mapsLink && (
                                <a 
                                    href={change.added.mapsLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="change-maps-link"
                                >
                                    <FaMapMarkerAlt /> View on Map
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
