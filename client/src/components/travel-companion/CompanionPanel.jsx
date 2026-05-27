import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaCompass } from 'react-icons/fa';
import CompanionMessage from './CompanionMessage';
import SuggestionChips from './SuggestionChips';
import LoadingJourney from './LoadingJourney';
import '../../styles/companion.css';

export default function CompanionPanel({ companion, trip, isOwner }) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (companion.isOpen) {
            companion.loadHistory();
        }
    }, [companion.isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [companion.messages, companion.loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || companion.loading) return;
        
        companion.sendMessage(inputValue);
        setInputValue('');
    };

    const handleChipClick = (prompt) => {
        if (companion.loading) return;
        companion.sendMessage(prompt);
    };

    // Don't render sidebar on mobile
    if (!companion.isOpen || window.innerWidth < 768) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="companion-sidebar"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
                {/* Header */}
                <div className="companion-header">
                    <div className="companion-title">
                        <FaCompass className="companion-icon icon-spin" />
                        <h3>Travel Companion</h3>
                    </div>
                    <button 
                        className="companion-close"
                        onClick={() => companion.setIsOpen(false)}
                        aria-label="Close companion"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="companion-messages-container">
                    {companion.messages.length === 0 ? (
                        <div className="companion-empty-state">
                            <div className="empty-state-icon">✨</div>
                            <h4>Your Intelligent Co-Pilot</h4>
                            <p>I can help refine your trip. I'll modify specific parts without rewriting the entire itinerary.</p>
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

                {/* Input Area */}
                {isOwner && (
                    <div className="companion-input-area">
                        <form onSubmit={handleSubmit} className="companion-form">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="E.g., make day 2 more relaxing..."
                                className="companion-input"
                                disabled={companion.loading}
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
            </motion.div>
        </AnimatePresence>
    );
}
