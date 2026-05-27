import { useState } from 'react';
import { motion } from 'framer-motion';
import ChangeCard from './ChangeCard';

export default function DiffPreview({ patch, patchId, companion }) {
    const [applying, setApplying] = useState(false);

    if (!patch || !patch.changes || patch.changes.length === 0) return null;

    const handleApply = async () => {
        if (applying) return;
        setApplying(true);
        const success = await companion.applyPatch(patchId);
        if (success && window.triggerUndoToast) {
            window.triggerUndoToast(patchId);
        }
        setApplying(false);
    };

    return (
        <div className="diff-preview-container">
            <div className="diff-preview-header">
                <h4>Suggested Changes</h4>
                <span className="diff-days-badge">
                    Day {patch.targetDays.join(', ')}
                </span>
            </div>

            <div className="diff-changes-list">
                {patch.changes.map((change, idx) => (
                    <ChangeCard key={idx} change={change} />
                ))}
            </div>

            {patch.benefits && patch.benefits.length > 0 && (
                <div className="diff-benefits">
                    {patch.benefits.map((benefit, idx) => (
                        <div key={idx} className="diff-benefit-item">
                            <span className="benefit-icon">✨</span>
                            {benefit}
                        </div>
                    ))}
                </div>
            )}

            <div className="diff-actions">
                <button 
                    className="btn-primary diff-apply-btn"
                    onClick={handleApply}
                    disabled={applying}
                >
                    {applying ? 'Applying...' : 'Apply Changes'}
                </button>
            </div>
        </div>
    );
}
