export default function PassportTimeline({ trips }) {
    return (
        <div className="passport-timeline passport-page-inner">
            <h2 className="passport-timeline-title">Your Travel Timeline</h2>
            
            <div className="timeline-list">
                {trips.map((trip, idx) => {
                    const date = new Date(trip.createdAt);
                    const year = date.getFullYear();
                    const prevYear = idx > 0 ? new Date(trips[idx-1].createdAt).getFullYear() : null;
                    const showYear = year !== prevYear;

                    return (
                        <div key={trip.tripId} className="timeline-item">
                            {showYear && (
                                <div className="timeline-year" style={{ marginBottom: '4px' }}>
                                    {year}
                                </div>
                            )}
                            <div className="timeline-destination">{trip.destination}</div>
                            <div className="timeline-duration">{trip.duration} Days • {trip.travelStyle || 'Exploration'}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
