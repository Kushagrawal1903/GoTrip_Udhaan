import { useNavigate } from 'react-router-dom';

export default function PassportNav({ currentPage, totalPages, onPrev, onNext }) {
    const navigate = useNavigate();

    return (
        <div className="passport-nav">
            <button className="passport-nav-back" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>

            <div className="passport-nav-dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`passport-nav-dot ${i === currentPage ? 'active' : ''}`}
                        onClick={() => {
                            if (i > currentPage) {
                                for(let j = currentPage; j < i; j++) onNext();
                            } else if (i < currentPage) {
                                for(let j = currentPage; j > i; j--) onPrev();
                            }
                        }}
                    />
                ))}
            </div>

            <div className="passport-nav-arrows">
                <button 
                    className="passport-nav-arrow" 
                    onClick={onPrev} 
                    disabled={currentPage === 0}
                >
                    ◀
                </button>
                <button 
                    className="passport-nav-arrow" 
                    onClick={onNext} 
                    disabled={currentPage === totalPages - 1}
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
