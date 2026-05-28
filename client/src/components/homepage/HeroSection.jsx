import { FiZap } from 'react-icons/fi';
import InteractiveTripCard from './InteractiveTripCard';
import StatsBar from './StatsBar';
import heroBg from '../../assets/hero-bg.png';

export default function HeroSection() {
  return (
    <section id="home" className="hero-container homepage-wrapper" aria-label="GoTrip AI travel planner">
      <div className="hero-bg-wrapper">
        <div
          className="hero-bg-image active"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-shell">
        <div className="hero-text-content">
          <div className="hero-kicker">
            <span className="hero-kicker-icon" aria-hidden="true">
              <FiZap />
            </span>
            <span>AI TRAVEL PLANNER</span>
          </div>

          <h1 className="hp-title hero-title">
            Your next
            <br />
            <span className="hp-accent">unforgettable</span>
            <br />
            <span className="hero-title-nowrap">journey starts here.</span>
          </h1>

          <p className="hp-subtitle hero-subtitle">
            Personalized AI travel experiences designed around how you want your trip to feel.
          </p>
        </div>

        <div className="hero-card-wrap">
          <InteractiveTripCard />
        </div>
      </div>

      <StatsBar />
    </section>
  );
}
