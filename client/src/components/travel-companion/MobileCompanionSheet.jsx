import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { FaPaperPlane, FaCompass, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import CompanionMessage from './CompanionMessage';
import SuggestionChips from './SuggestionChips';
import LoadingJourney from './LoadingJourney';

export default function MobileCompanionSheet({ companion, trip, isOwner }) {
    const [sheetState, setSheetState] = useState('collapsed'); // collapsed, peek, full
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const dragControls = useDragControls();

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    useEffect(() => {
        if (companion.messages.length > 0 && sheetState === 'collapsed') {
            setSheetState('full');
        }
    }, [companion.messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (sheetState === 'full') {
            scrollToBottom();
        }
    }, [companion.messages, companion.loading, sheetState]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || companion.loading) return;
        
        companion.sendMessage(inputValue);
        setInputValue('');
        if (sheetState !== 'full') setSheetState('full');
    };

    const handleChipClick = (prompt) => {
        if (companion.loading) return;
        companion.sendMessage(prompt);
        if (sheetState !== 'full') setSheetState('full');
    };

    const toggleSheet = () => {
        if (sheetState === 'collapsed') {
            companion.loadHistory();
            setSheetState('peek');
        } else if (sheetState === 'peek') {
            setSheetState('full');
        } else {
            setSheetState('collapsed');
        }
    };

    if (!isMobile) return null;

    const variants = {
        collapsed: { y: '100%' }, // Start completely off-screen on mobile
        peek: { y: 'calc(100% - 280px)' },
        full: { y: 0 }
    };

    // Determine initial active state when opened
    const activeState = companion.messages.length > 0 ? 'full' : 'peek';

    return (
        <AnimatePresence>
            {companion.isOpen && (
                <motion.div 
                    className={`mobile-companion-sheet state-${sheetState}`}
                    variants={variants}
                    initial="collapsed"
                    animate={sheetState === 'collapsed' ? activeState : sheetState}
                    exit="collapsed"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    drag="y"
                    dragControls={dragControls}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                        if (info.offset.y > 150) {
                            // Dragging down closes it completely
                            companion.setIsOpen(false);
                        } else if (info.offset.y < -100 && sheetState !== 'full') {
                            setSheetState('full');
                        }
                    }}
                >
                {/* Drag Handle & Header */}
                <div 
                    className="sheet-header" 
                    onClick={toggleSheet}
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <div className="drag-handle"></div>
                    <div className="sheet-title-row">
                        <div className="sheet-title">
                            <FaCompass className="companion-icon icon-spin" />
                            <span>Travel Companion</span>
                        </div>
                        <button 
                            className="sheet-close-btn"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent drag toggle
                                companion.setIsOpen(false);
                            }}
                            aria-label="Close Companion"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Content Area (only visible in peek/full) */}
                <div className="sheet-content">
                    {/* Quick Chips in Peek state */}
                    {sheetState === 'peek' && companion.messages.length === 0 && (
                        <div className="peek-chips">
                            <p className="peek-prompt">How can I improve this trip?</p>
                            <SuggestionChips onSelect={handleChipClick} trip={trip} />
                        </div>
                    )}

                    {/* Full Messages Area */}
                    {sheetState === 'full' && (
                        <div className="companion-messages-container">
                            {companion.messages.length === 0 ? (
                                <div className="companion-empty-state">
                                    <div className="empty-state-icon">✨</div>
                                    <h4>Your Intelligent Co-Pilot</h4>
                                    <p>I can help refine your trip without rewriting it completely.</p>
                                    <SuggestionChips onSelect={handleChipClick} trip={trip} />
                                </div>
                            ) : (
                                <div className="companion-messages-list">
                                    {companion.messages.map((msg, idx) => (
                                        <CompanionMessage 
                                            key={idx} 
                                            message={msg} 
                                            companion={companion}
                                            isLast={idx === companion.messages.length - 1}
                                        />
                                    ))}
                                    {companion.loading && <LoadingJourney />}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Input Area */}
                    {isOwner && (sheetState === 'full' || (sheetState === 'peek' && companion.messages.length > 0)) && (
                        <div className="companion-input-area">
                            <form onSubmit={handleSubmit} className="companion-form">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Make day 2 relaxing..."
                                    className="companion-input"
                                    disabled={companion.loading}
                                    onFocus={() => setSheetState('full')}
                                />
                                <button 
                                    type="submit" 
                                    className="companion-submit"
                                    disabled={!inputValue.trim() || companion.loading}
                                    aria-label="Send message"
                                >
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    );
}
