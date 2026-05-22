import { motion, AnimatePresence } from 'framer-motion';

/**
 * PassportBook handles the 3D page turning physics.
 * On desktop, it renders a left and right page spread.
 * On mobile, it renders a single page.
 */
export default function PassportBook({ pages, currentIndex, isMobile, onCoverClick, onPrev, onNext, userName }) {
    // If it's the cover, we render the Cover UI.
    const isCover = currentIndex === -1;
    
    // Calculate current pages to show
    let leftPage = null;
    let rightPage = null;
    let singlePage = null;

    if (!isCover) {
        if (isMobile) {
            singlePage = pages[currentIndex];
        } else {
            // Desktop: Page 0 is left, Page 1 is right. Page 2 left, Page 3 right.
            const spreadIndex = Math.floor(currentIndex / 2) * 2;
            leftPage = pages[spreadIndex];
            rightPage = pages[spreadIndex + 1];
        }
    }

    return (
        <div className="passport-stage">
            <motion.div 
                className="passport-book-wrapper"
                initial={{ scale: 0.8, opacity: 0, rotateX: 5 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            >
                <AnimatePresence initial={false} mode="wait">
                    {isCover ? (
                        <motion.div 
                            key="cover"
                            className="passport-page left pp-texture-leather passport-cover-ui"
                            style={{ width: isMobile ? '100%' : '50%', left: isMobile ? 0 : '25%', transformOrigin: 'left center' }}
                            initial={{ rotateY: -90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: -110, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            onClick={onCoverClick}
                        >
                            <div className="passport-cover-emboss-text" style={{ fontSize: '1rem', letterSpacing: '0.3em' }}>GOTRIP</div>
                            <div className="passport-cover-title passport-cover-emboss-text">PASSPORT</div>
                            
                            <div className="passport-cover-globe">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <ellipse cx="12" cy="12" rx="4" ry="10" />
                                    <path d="M2 12h20" />
                                </svg>
                            </div>
                            
                            <div className="passport-cover-emboss-text" style={{ fontSize: '0.85rem', marginTop: '40px' }}>
                                TRAVEL PASSPORT
                            </div>
                            {userName && (
                                <div className="passport-cover-emboss-text" style={{ fontSize: '1.5rem', marginTop: '12px', fontFamily: 'var(--pp-font-handwriting)', fontWeight: '500', color: 'var(--pp-gold)', opacity: 0.95, textTransform: 'none', letterSpacing: '0.05em' }}>
                                    Belongs to {userName}
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: '20px', color: 'var(--pp-gold-dark)', fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                ^ Open Your Passport
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`spread-${currentIndex}`}
                            style={{ position: 'absolute', inset: 0 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                        >
                            {isMobile ? (
                                <div className="passport-page pp-texture-paper pp-spine-shadow-left">
                                    <div className="passport-page-content">
                                        {singlePage}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="passport-page left pp-texture-paper pp-spine-shadow-left">
                                        <div className="passport-page-content">
                                            {leftPage}
                                        </div>
                                        <button
                                            type="button"
                                            className="passport-page-turn-zone passport-page-turn-zone--prev"
                                            onClick={onPrev}
                                            aria-label="Previous page"
                                        />
                                    </div>
                                    <div className="passport-page right pp-texture-paper pp-spine-shadow-right">
                                        <div className="passport-page-content">
                                            {rightPage}
                                        </div>
                                        <button
                                            type="button"
                                            className="passport-page-turn-zone passport-page-turn-zone--next"
                                            onClick={onNext}
                                            aria-label="Next page"
                                        />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
