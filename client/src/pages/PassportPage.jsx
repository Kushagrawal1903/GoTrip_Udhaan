import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import usePassport from '../hooks/usePassport';
import { motion, AnimatePresence } from 'framer-motion';

import PassportBook from '../components/passport/PassportBook';
import { IdentitySpreadLeft, IdentitySpreadRight } from '../components/passport/IdentitySpread';
import { MemorySpreadLeft, MemorySpreadRight } from '../components/passport/MemorySpread';
import { TimelineSpreadLeft, ReflectionSpreadRight } from '../components/passport/TimelineSpread';
import PassportNav from '../components/passport/PassportNav';

import '../styles/passport.css';

export default function PassportPage() {
    const { user } = useAuth();
    const { data, loading, generating, error, generatePassport, updateFavoriteMoment } = usePassport();
    
    // -1 = Cover, 0 = Identity (Left/Right), 2 = First Memory (Left/Right), etc.
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

    // ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS
    const touchStartX = useRef(null);

    // Responsive listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial load auto-generation if needed
    useEffect(() => {
        if (!loading && data) {
            const hasTrips = data.trips && data.trips.length > 0;
            if (hasTrips && !data.isGenerated && !generating && !error) {
                generatePassport();
            }
        }
    }, [loading, data, generating, error, generatePassport]);

    // Assemble pages (memoized so it doesn't re-create on every render)
    const pages = useMemo(() => {
        if (!data?.trips || data.trips.length === 0) return [];

        const p = [];
        // Identity Spread (Pages 0 & 1)
        p.push(<IdentitySpreadLeft key="id-l" name={data?.user?.name} memberSince={data?.user?.memberSince} />);
        p.push(<IdentitySpreadRight key="id-r" stats={data?.stats} personality={data?.travelPersonality} />);

        // Memory Spreads (2 pages per trip)
        data.trips.forEach((trip, i) => {
            p.push(<MemorySpreadLeft key={`mem-l-${i}`} trip={trip} />);
            p.push(<MemorySpreadRight key={`mem-r-${i}`} trip={trip} onUpdateFavorite={updateFavoriteMoment} />);
        });

        // Timeline & Reflection Spread (Last 2 pages)
        p.push(<TimelineSpreadLeft key="tl" trips={data.trips} />);
        const latestImage = data.trips.find(t => t.destinationImage)?.destinationImage;
        p.push(<ReflectionSpreadRight key="ref" stats={data?.stats} latestImage={latestImage} />);

        return p;
    }, [data, updateFavoriteMoment]);

    const totalSpreads = Math.ceil(pages.length / 2);
    const totalMobilePages = pages.length;

    // Navigation handlers (stable references)
    const handleNext = useCallback(() => {
        if (pages.length === 0) return;
        if (isMobile) {
            setCurrentIndex(prev => Math.min(prev + 1, totalMobilePages - 1));
        } else {
            setCurrentIndex(prev => Math.min(prev + 2, pages.length - 2));
        }
    }, [isMobile, pages.length, totalMobilePages]);

    const handlePrev = useCallback(() => {
        if (isMobile) {
            setCurrentIndex(prev => Math.max(prev - 1, -1));
        } else {
            setCurrentIndex(prev => Math.max(prev - 2, -1));
        }
    }, [isMobile]);

    const handleCoverClick = useCallback(() => {
        setCurrentIndex(prev => prev === -1 ? 0 : prev);
    }, []);

    // Touch swipe navigation
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) handleNext();
        if (diff < -50) handlePrev();
        touchStartX.current = null;
    }, [handleNext, handlePrev]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (currentIndex === -1) {
                if (e.key === 'ArrowRight' || e.key === 'Enter') setCurrentIndex(0);
                return;
            }
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, handleNext, handlePrev]);

    // ─── RENDER ───────────────────────────────────────────────

    // Loading state
    if (loading || generating || (!data?.isGenerated && data?.trips?.length > 0)) {
        return (
            <div className="passport-environment">
                <div style={{ textAlign: 'center', color: 'var(--pp-gold)' }}>
                    <div className="pp-h2" style={{ color: 'var(--pp-gold)' }}>Revisiting your memories...</div>
                    <div style={{ marginTop: '20px', width: '120px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '20px auto', overflow: 'hidden' }}>
                        <motion.div 
                            style={{ height: '100%', background: 'var(--pp-gold)' }}
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="passport-environment">
                <div style={{ textAlign: 'center', color: 'var(--pp-gold)' }}>
                    <div className="pp-h2" style={{ color: 'var(--pp-stamp-red, #a44338)' }}>Something went wrong</div>
                    <div className="pp-body" style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>{error}</div>
                </div>
            </div>
        );
    }
    
    // Empty State — no trips yet
    if (!data?.trips || data.trips.length === 0) {
        return (
            <div className="passport-environment">
                <PassportNav currentPage={0} totalPages={1} onPrev={() => {}} onNext={() => {}} />
                <div className="passport-stage">
                    <motion.div className="passport-book-wrapper" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
                        <div className="passport-page left pp-texture-leather passport-cover-ui" style={{ width: isMobile ? '100%' : '50%', left: isMobile ? 0 : '25%' }}>
                            <div className="passport-cover-title passport-cover-emboss-text" style={{ fontSize: '2.5rem' }}>PASSPORT</div>
                            <div className="pp-h2" style={{ color: 'var(--pp-gold)', marginTop: '40px', fontSize: '1.2rem' }}>Your Story Hasn't Started Yet ✈️</div>
                            <div className="pp-body" style={{ color: 'var(--pp-gold)', opacity: 0.7, marginTop: '16px', fontSize: '0.9rem' }}>
                                One day this passport will hold the places that changed you.
                            </div>
                            <a href="/plan" style={{ marginTop: '40px', padding: '12px 24px', background: 'var(--pp-gold)', color: 'var(--pp-leather-dark)', textDecoration: 'none', fontWeight: 700, borderRadius: '4px', fontFamily: 'var(--pp-font-sans)', letterSpacing: '0.1em' }}>
                                Plan Your First Journey
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ─── MAIN PASSPORT EXPERIENCE ─────────────────────────────
    return (
        <div className="passport-environment" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {/* Background ambient lighting */}
            <div className="passport-desk-element" style={{ top: '10%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', filter: 'blur(40px)' }} />
            <div className="passport-desk-element" style={{ bottom: '10%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(200,150,100,0.03)', filter: 'blur(60px)' }} />

            <AnimatePresence>
                {currentIndex !== -1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
                        <PassportNav 
                            currentPage={isMobile ? currentIndex : Math.floor(currentIndex / 2)} 
                            totalPages={isMobile ? totalMobilePages : totalSpreads} 
                            onPrev={handlePrev} 
                            onNext={handleNext} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating side navigation buttons */}
            <AnimatePresence>
                {currentIndex !== -1 && (
                    <>
                        <motion.button
                            className="pp-side-nav pp-side-nav-left"
                            onClick={handlePrev}
                            disabled={currentIndex <= -1}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            aria-label="Previous page"
                        >
                            ‹
                        </motion.button>
                        <motion.button
                            className="pp-side-nav pp-side-nav-right"
                            onClick={handleNext}
                            disabled={isMobile ? currentIndex >= totalMobilePages - 1 : currentIndex >= pages.length - 2}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            aria-label="Next page"
                        >
                            ›
                        </motion.button>
                    </>
                )}
            </AnimatePresence>

            <PassportBook 
                pages={pages}
                currentIndex={currentIndex}
                isMobile={isMobile}
                onCoverClick={handleCoverClick}
                onPrev={handlePrev}
                onNext={handleNext}
                userName={data?.user?.name || user?.name}
            />
        </div>
    );
}
