import { useNavigate } from 'react-router-dom';

export default function PassportNav({ currentPage, totalPages, onPrev, onNext, onDownload, isDownloading }) {
    const navigate = useNavigate();

    return (
        <div className="passport-nav">
            <div style={{ display: 'flex', gap: '16px' }}>
                <button className="passport-nav-back" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                {onDownload && (
                    <button 
                        className="passport-nav-back pp-download-btn" 
                        onClick={onDownload}
                        disabled={isDownloading}
                        style={{ 
                            borderColor: 'var(--pp-gold)', 
                            color: 'var(--pp-gold)',
                            opacity: isDownloading ? 0.5 : 1
                        }}
                    >
                        {isDownloading ? 'Preserving...' : '↓ Save Memory Journal'}
                    </button>
                )}
            </div>

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
