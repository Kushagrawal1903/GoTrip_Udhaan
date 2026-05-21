import { Link } from 'react-router-dom';

export default function FinalReflection({ summary, stats }) {
    return (
        <div className="final-reflection passport-page-inner">
            <h1 className="final-reflection-title">A Journey Worth Remembering</h1>
            <div className="identity-divider" style={{ width: '40px', margin: '8px 0' }}></div>
            
            <p className="final-reflection-text">
                {summary || `${stats.tripsCompleted} journeys and counting — each one a thread in the fabric of who you are becoming.`}
            </p>

            <div style={{ marginTop: '32px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--pp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                    Where To Next?
                </div>
                <Link to="/plan" className="final-reflection-cta">
                    Plan Your Next Journey
                </Link>
            </div>
        </div>
    );
}
