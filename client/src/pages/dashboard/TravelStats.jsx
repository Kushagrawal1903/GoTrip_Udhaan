import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

const STYLE_COLORS = {
    adventure: '#059669', relaxation: '#0d9488', cultural: '#d97706',
    family: '#3b82f6', romantic: '#ec4899', other: '#6b7280',
};
const BUDGET_COLORS = { low: '#16a34a', moderate: '#d97706', premium: '#8b5cf6' };
const PIE_COLORS = ['#059669', '#0d9488', '#d97706', '#3b82f6', '#ec4899', '#6b7280'];

export default function TravelStats() {
    const { user } = useAuth();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboard', 'travelStats', user?.id],
        queryFn: async () => {
            const res = await api.get('/dashboard/travel-stats');
            return res.data.data;
        },
        enabled: !!user?.id,
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: 'var(--color-danger)', marginBottom: 12 }}>Failed to load travel stats</p>
                <button onClick={() => refetch()} className="btn-outline" style={{ padding: '8px 20px' }}>Retry</button>
            </div>
        );
    }

    if (!data || data.totalTrips === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">📊</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>No travel data yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Plan some trips to see your travel stats here.</p>
            </div>
        );
    }

    const maxDest = data.topDestinations?.[0]?.count || 1;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 24 }}>
                Your travel patterns and preferences at a glance.
            </p>

            {/* Row 1: Pie + Bar */}
            <div className="stats-chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Trips by style — Donut */}
                <div style={{ padding: '20px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 16 }}>Trips by Style</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data.tripsByStyle}
                                dataKey="count"
                                nameKey="style"
                                cx="50%" cy="50%"
                                innerRadius={50} outerRadius={80}
                                paddingAngle={3}
                            >
                                {data.tripsByStyle.map((entry, i) => (
                                    <Cell key={entry.style} fill={STYLE_COLORS[entry.style] || PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
                                formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                            />
                            <Legend
                                iconSize={10}
                                formatter={(value) => <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly activity — Bar */}
                <div style={{ padding: '20px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 16 }}>Monthly Activity</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.monthlyActivity} barCategoryGap="20%">
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={24} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
                            />
                            <Bar dataKey="trips" fill="#0d9488" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Budget + Top destinations */}
            <div className="stats-chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Budget breakdown */}
                <div style={{ padding: '20px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 16 }}>Budget Breakdown</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data.tripsByBudget} layout="vertical" barCategoryGap="30%">
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis
                                type="category" dataKey="budget"
                                tick={{ fontSize: 12, fill: 'var(--text-secondary)', textTransform: 'capitalize' }}
                                axisLine={false} tickLine={false} width={72}
                                tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
                            />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.tripsByBudget.map(entry => (
                                    <Cell key={entry.budget} fill={BUDGET_COLORS[entry.budget] || '#6b7280'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top destinations */}
                <div style={{ padding: '20px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 16 }}>Top Destinations</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(data.topDestinations || []).map((d, i) => (
                            <div key={d.destination}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {i + 1}. {d.destination}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{d.count} trip{d.count > 1 ? 's' : ''}</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-glass)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 3,
                                        width: `${(d.count / maxDest) * 100}%`,
                                        background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                        {(!data.topDestinations || data.topDestinations.length === 0) && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No destinations yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Highlight cards */}
            <div className="stats-highlights" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                    { icon: '🏆', label: 'Longest Trip', value: data.longestTrip?.destination || '-', sub: `${data.longestTrip?.duration || 0} days` },
                    { icon: '🕐', label: 'Most Recent', value: data.mostRecentTrip?.destination || '-', sub: data.mostRecentTrip?.createdAt ? new Date(data.mostRecentTrip.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-' },
                    { icon: '❤️', label: 'Favourite Style', value: data.favouriteStyle ? data.favouriteStyle.charAt(0).toUpperCase() + data.favouriteStyle.slice(1) : '-', sub: 'Most planned style' },
                ].map(card => (
                    <div key={card.label} style={{
                        padding: '20px', borderRadius: 12,
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }} aria-hidden="true">{card.icon}</div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{card.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{card.value}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{card.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
