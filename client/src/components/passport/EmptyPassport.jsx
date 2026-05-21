import { Link } from 'react-router-dom';

export default function EmptyPassport() {
    return (
        <div className="empty-passport passport-page-inner">
            <h1 className="empty-passport-title">Your Story Hasn't Started Yet ✈️</h1>
            <p className="empty-passport-text">
                "One day this passport will hold the places that changed you."
            </p>
            <div style={{ marginTop: '24px' }}>
                <Link to="/plan" className="btn-primary" style={{ textDecoration: 'none' }}>
                    Plan Your First Journey
                </Link>
            </div>
        </div>
    );
}
