/**
 * GlassCard — reusable glassmorphism container component
 */
export default function GlassCard({ children, style = {}, className = '', hover = true, ...props }) {
    return (
        <div
            className={`${hover ? 'glass-card' : 'glass'} ${className}`}
            style={{ padding: '24px', ...style }}
            {...props}
        >
            {children}
        </div>
    );
}
