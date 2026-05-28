import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAward,
  FiCamera,
  FiChevronDown,
  FiCoffee,
  FiCompass,
  FiHeart,
  FiHome,
  FiMapPin,
  FiMoon,
  FiStar,
  FiTriangle,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const VIBES = [
  {
    id: 'slow',
    icon: FiCompass,
    label: 'Slow & Peaceful',
    color: '#5eead4',
    soft: 'rgba(20, 184, 166, 0.16)',
    border: 'rgba(94, 234, 212, 0.38)',
  },
  {
    id: 'adventure',
    icon: FiTriangle,
    label: 'Adventure',
    color: '#fb923c',
    soft: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(251, 146, 60, 0.34)',
  },
  {
    id: 'romantic',
    icon: FiHeart,
    label: 'Romantic',
    color: '#fb7185',
    soft: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(251, 113, 133, 0.34)',
  },
  {
    id: 'scenic',
    icon: FiCamera,
    label: 'Scenic',
    color: '#7dd3fc',
    soft: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(125, 211, 252, 0.34)',
  },
];

const EXTRA_VIBES = [
  {
    id: 'culture',
    icon: FiHome,
    label: 'Culture',
    color: '#c084fc',
    soft: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(192, 132, 252, 0.34)',
  },
  {
    id: 'foodie',
    icon: FiCoffee,
    label: 'Foodie',
    color: '#facc15',
    soft: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(250, 204, 21, 0.34)',
  },
  {
    id: 'luxury',
    icon: FiAward,
    label: 'Luxury',
    color: '#fbbf24',
    soft: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(251, 191, 36, 0.34)',
  },
  {
    id: 'nightlife',
    icon: FiMoon,
    label: 'Nightlife',
    color: '#d946ef',
    soft: 'rgba(217, 70, 239, 0.12)',
    border: 'rgba(217, 70, 239, 0.34)',
  },
  {
    id: 'wellness',
    icon: FiStar,
    label: 'Wellness',
    color: '#86efac',
    soft: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(134, 239, 172, 0.3)',
  },
  {
    id: 'hidden-gems',
    icon: FiZap,
    label: 'Hidden Gems',
    color: '#f0abfc',
    soft: 'rgba(232, 121, 249, 0.1)',
    border: 'rgba(240, 171, 252, 0.3)',
  },
];

export default function InteractiveTripCard() {
  const [destination, setDestination] = useState('Switzerland');
  const [selectedVibes, setSelectedVibes] = useState(['slow']);
  const [showMoreVibes, setShowMoreVibes] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const visibleVibes = showMoreVibes ? [...VIBES, ...EXTRA_VIBES] : VIBES;

  const toggleVibe = (id) => {
    setSelectedVibes((prev) => (
      prev.includes(id) ? prev.filter((vibe) => vibe !== id) : [...prev, id]
    ));
  };

  const handleGenerate = () => {
    navigate(isAuthenticated ? '/plan' : '/register');
  };

  return (
    <article
      className="trip-builder-card"
      aria-label="Trip generator preview"
    >
      <div className="trip-card-heading">
        <span className="trip-heading-icon" aria-hidden="true">
          <FiZap />
        </span>
        <h2>Let's build your perfect trip</h2>
      </div>

      <div className="trip-field">
        <label htmlFor="hero-destination">Where do you want to go?</label>
        <div className="destination-select">
          <FiMapPin className="destination-leading-icon" aria-hidden="true" />
          <select
            id="hero-destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            aria-label="Choose destination"
          >
            <option value="Switzerland">Switzerland</option>
            <option value="Japan">Japan</option>
            <option value="Bali">Bali</option>
            <option value="Santorini">Santorini</option>
            <option value="Norway">Norway</option>
            <option value="Paris">Paris</option>
          </select>
          <FiChevronDown className="destination-chevron" aria-hidden="true" />
        </div>
      </div>

      <div className="trip-field trip-vibe-field">
        <span className="trip-label">How do you want your trip to feel?</span>
        <div className="vibe-grid">
          {visibleVibes.map((vibe) => {
            const Icon = vibe.icon;
            const isSelected = selectedVibes.includes(vibe.id);

            return (
              <button
                key={vibe.id}
                type="button"
                className={`vibe-chip${isSelected ? ' selected' : ''}`}
                style={{
                  '--vibe-color': vibe.color,
                  '--vibe-soft': vibe.soft,
                  '--vibe-border': vibe.border,
                }}
                onClick={() => toggleVibe(vibe.id)}
              >
                <Icon aria-hidden="true" />
                <span>{vibe.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="more-vibes-button"
          onClick={() => setShowMoreVibes((value) => !value)}
          aria-expanded={showMoreVibes}
        >
          {showMoreVibes ? 'Less vibes' : 'More vibes'}
          <FiChevronDown aria-hidden="true" />
        </button>
      </div>

      <button type="button" className="cta-glow trip-generate-button" onClick={handleGenerate}>
        <span>Generate My Journey</span>
        <FiZap aria-hidden="true" />
      </button>

      <div className="trip-free-note">
        {'Free \u2022 No Card Required'}
      </div>
    </article>
  );
}
