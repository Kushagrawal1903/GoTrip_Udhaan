import { Fragment } from 'react';
import { FiCreditCard, FiGlobe, FiShield, FiZap } from 'react-icons/fi';

const STATS = [
  { icon: FiGlobe, value: '50+', label: 'Destinations', delay: 0.1 },
  { icon: FiZap, value: '30s', label: 'AI Generation', delay: 0.2 },
  { icon: FiCreditCard, value: '\u20b90', label: 'Cost to Use', delay: 0.3 },
  { icon: FiShield, value: '100%', label: 'Secure & Private', delay: 0.4 },
];

export default function StatsBar() {
  return (
    <section className="stats-bar-wrapper" aria-label="GoTrip platform highlights">
      <div className="stats-glass-container">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Fragment key={stat.label}>
              <div className="stat-item">
                <span className="stat-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="stat-copy">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </span>
              </div>

              {index < STATS.length - 1 && <div className="stat-divider" aria-hidden="true" />}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
