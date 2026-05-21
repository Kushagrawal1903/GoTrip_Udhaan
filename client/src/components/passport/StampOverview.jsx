import TravelStamp from './TravelStamp';

export default function StampOverview({ trips }) {
    return (
        <div className="stamp-overview passport-page-inner">
            <h2 className="stamp-overview-title">Collected Stamps</h2>
            <div className="identity-divider" style={{ width: '40px' }}></div>
            
            <div className="stamp-overview-grid">
                {trips.map((trip, idx) => (
                    <div key={idx} style={{ transform: `scale(0.85) rotate(${Math.random() * 20 - 10}deg)`, margin: '-10px' }}>
                        <TravelStamp 
                            destination={trip.destination} 
                            date={trip.createdAt} 
                            color={trip.stampColor} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
