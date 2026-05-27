import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUndo } from 'react-icons/fa';

export default function UndoToast({ companion }) {
    const [show, setShow] = useState(false);
    const [lastAppliedPatch, setLastAppliedPatch] = useState(null);
    const [undoing, setUndoing] = useState(false);

    // Watch for applied patches (when currentPatch clears but we had one)
    // In a real implementation, you'd want a more explicit signal from the hook
    // Let's use the messages array to find the last applied patch
    
    useEffect(() => {
        // If a patch was just applied, the hook's currentPatch becomes null
        // We need to look at the last assistant message
        const lastMsg = companion.messages[companion.messages.length - 1];
        
        // This is a simplified trigger. A robust implementation would have a dedicated event or state in the hook.
        // For MVP, if there's no current patch but we are open, we don't know exactly when it was applied vs just closed.
        // Let's assume the hook sets a specific flag or we check the UI state.
    }, [companion.messages, companion.currentPatch]);

    // Expose a method on window for easy triggering from DiffPreview
    useEffect(() => {
        window.triggerUndoToast = (patchId) => {
            setLastAppliedPatch(patchId);
            setShow(true);
            
            // Auto hide after 8s
            const timer = setTimeout(() => {
                setShow(false);
            }, 8000);
            
            return () => clearTimeout(timer);
        };
        
        return () => {
            delete window.triggerUndoToast;
        };
    }, []);

    const handleUndo = async () => {
        if (!lastAppliedPatch || undoing) return;
        
        setUndoing(true);
        const success = await companion.undoPatch(lastAppliedPatch);
        if (success) {
            setShow(false);
        }
        setUndoing(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    className="undo-toast-container"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                >
                    <div className="undo-toast-content">
                        <span>Changes applied successfully</span>
                        <button 
                            className="undo-toast-btn"
                            onClick={handleUndo}
                            disabled={undoing}
                        >
                            <FaUndo /> {undoing ? 'Undoing...' : 'Undo'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
