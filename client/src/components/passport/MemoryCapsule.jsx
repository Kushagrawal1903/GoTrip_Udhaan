export default function MemoryCapsule({ text, mood }) {
    if (!text) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p className="memory-capsule-text">
                "{text}"
            </p>
            {mood && (
                <div className="memory-mood-badge">
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                </div>
            )}
        </div>
    );
}
