import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Parse a budget string like "₹15,000" or "₹5,000 - ₹8,000" → number
 */
function parseAmount(str) {
    if (!str) return 0;
    const match = str.replace(/,/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

/**
 * BudgetChart — Doughnut chart + stats cards for budget breakdown
 */
export default function BudgetChart({ budgetBreakdown, totalBudget }) {
    const categories = [
        { key: 'stay', label: 'Accommodation', color: '#0d9488' },
        { key: 'transport', label: 'Transport', color: '#d97706' },
        { key: 'food', label: 'Food & Dining', color: '#6366f1' },
        { key: 'activities', label: 'Activities', color: '#e11d48' },
    ];

    const values = categories.map(c => parseAmount(budgetBreakdown?.[c.key]));
    const total = values.reduce((a, b) => a + b, 0);

    const data = {
        labels: categories.map(c => c.label),
        datasets: [{
            data: values,
            backgroundColor: categories.map(c => c.color),
            borderWidth: 0,
            hoverOffset: 6,
            spacing: 2,
            borderRadius: 4,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                borderRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.raw;
                        const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
                        return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="glass-card" style={{ padding: '24px 28px' }}>
            <h3 style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                marginBottom: 4,
            }}>
                Budget Breakdown
            </h3>
            {totalBudget && (
                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    marginBottom: 20,
                    fontWeight: 500,
                }}>
                    Estimated Total: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{totalBudget}</span>
                </p>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 240px) 1fr',
                gap: 28,
                alignItems: 'center',
            }}>
                {/* Chart */}
                <div style={{ position: 'relative', height: 220 }}>
                    <Doughnut data={data} options={options} />
                    {/* Center label */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total</div>
                        <div style={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                        }}>
                            ₹{total.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                {/* Category cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {categories.map((cat, i) => {
                        const val = values[i];
                        const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
                        return (
                            <div
                                key={cat.key}
                                style={{
                                    padding: '14px 14px',
                                    borderRadius: 10,
                                    background: `${cat.color}08`,
                                    border: `1px solid ${cat.color}20`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        {cat.label}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: cat.color,
                                        background: `${cat.color}12`,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                    }}>
                                        {pct}%
                                    </span>
                                </div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: 'var(--text-primary)',
                                }}>
                                    ₹{val.toLocaleString('en-IN')}
                                </div>
                                {/* Progress bar */}
                                <div style={{
                                    marginTop: 6,
                                    height: 3,
                                    borderRadius: 2,
                                    background: `${cat.color}12`,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${pct}%`,
                                        background: cat.color,
                                        borderRadius: 2,
                                        transition: 'width 0.8s ease',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
