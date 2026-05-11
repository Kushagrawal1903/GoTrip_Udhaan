import React from 'react';

function SkeletonBlock({ width, height, borderRadius = 8, style = {} }) {
    return (
        <div style={{
            width, height, borderRadius,
            background: 'var(--bg-glass)',
            animation: 'pulse 1.5s ease-in-out infinite',
            ...style,
        }} />
    );
}

export function StatCardSkeleton() {
    return (
        <div style={{
            padding: '20px', borderRadius: 12,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        }}>
            <SkeletonBlock width="40%" height={12} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="60%" height={28} style={{ marginBottom: 10 }} />
            <SkeletonBlock width="70%" height={10} />
        </div>
    );
}

export function TripCardSkeleton() {
    return (
        <div style={{
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid var(--border-color)', background: 'var(--bg-card)',
        }}>
            <SkeletonBlock width="100%" height={80} borderRadius={0} />
            <div style={{ padding: '14px 16px' }}>
                <SkeletonBlock width="70%" height={14} style={{ marginBottom: 10 }} />
                <SkeletonBlock width="90%" height={10} style={{ marginBottom: 8 }} />
                <SkeletonBlock width="50%" height={10} />
            </div>
        </div>
    );
}

export default SkeletonBlock;
