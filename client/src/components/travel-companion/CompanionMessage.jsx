import { motion } from 'framer-motion';
import DiffPreview from './DiffPreview';

export default function CompanionMessage({ message, companion, isLast }) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="message-system">
                <span>{message.content}</span>
            </div>
        );
    }

    if (isUser) {
        return (
            <div className="message-user-wrapper">
                <div className="message-user">
                    {message.content}
                </div>
            </div>
        );
    }

    // Assistant message
    const isPendingPatch = companion.currentPatch && isLast && message.patchId;

    return (
        <motion.div 
            className="message-assistant-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="message-assistant">
                {message.intent && (
                    <div className="message-intent-badge">
                        {formatIntent(message.intent)}
                    </div>
                )}
                
                <p className="message-content">{message.content}</p>

                {isPendingPatch && (
                    <DiffPreview 
                        patch={companion.currentPatch} 
                        patchId={message.patchId}
                        companion={companion} 
                    />
                )}
            </div>
        </motion.div>
    );
}

function formatIntent(intent) {
    if (!intent) return '';
    return intent
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
