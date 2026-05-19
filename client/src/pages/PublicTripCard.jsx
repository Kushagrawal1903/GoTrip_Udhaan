import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TripCard from '../components/share/TripCard';
import { THEME_CONFIGS } from '../utils/cardThemes';
import { CARD_FORMATS } from '../utils/cardFormats';
import { getRecommendedTheme } from '../utils/cardHelpers';
import { useAuth } from '../context/AuthContext';

/**
 * PublicTripCard — Public-facing page showing a shareable trip card.
 * No authentication required. Viral engine — friends see the card + CTA.
 */
export default function PublicTripCard() {
  const { tripId } = useParams();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('midnight');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiUrl}/trips/${tripId}/public`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Trip not found');
        }
        setTrip(data.data.trip);
        setSelectedTheme(getRecommendedTheme(data.data.trip.travelStyle));

        // SEO
        document.title = `${data.data.trip.destination} Trip — ${data.data.trip.duration} Days | GoTrip Pro`;
      } catch (err) {
        setError(err.message || 'This trip is no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{
        padding: '60px 24px', textAlign: 'center',
        maxWidth: 500, margin: '0 auto',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
        <h2 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          Trip Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
          {error || 'This trip may have been removed or the link is invalid.'}
        </p>
        <Link
          to="/"
          className="btn-primary"
          style={{ textDecoration: 'none', padding: '10px 28px' }}
        >
          Create Your Own Trip
        </Link>
      </div>
    );
  }

  const themes = Object.entries(THEME_CONFIGS);

  return (
    <div style={{
      padding: '40px 24px 60px',
      maxWidth: 600,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 6,
        }}>
          Trip Card
        </div>
        <h1 style={{
          fontWeight: 800,
          fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
          color: 'var(--text-primary)',
          margin: '0 0 6px',
        }}>
          {trip.destination}
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          {trip.duration}-day {(trip.travelStyle || '').replace(/^\w/, c => c.toUpperCase())} trip
        </p>
      </div>

      {/* Theme switcher */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center',
        marginBottom: 24,
      }}>
        {themes.map(([key, t]) => {
          const isSelected = selectedTheme === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedTheme(key)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: isSelected
                  ? '1.5px solid var(--color-primary)'
                  : '1px solid var(--border-color)',
                background: isSelected
                  ? 'rgba(20, 184, 166, 0.1)'
                  : 'transparent',
                color: isSelected
                  ? 'var(--color-primary)'
                  : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Card — scaled to fit screen */}
      {(() => {
        const fmt = CARD_FORMATS.whatsapp;
        const maxW = Math.min(480, window.innerWidth - 48);
        const sc = maxW / fmt.width;
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 32,
          }}>
            <div style={{
              width: fmt.width * sc,
              height: fmt.height * sc,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
              position: 'relative',
            }}>
              <div style={{
                transform: `scale(${sc})`,
                transformOrigin: 'top left',
                width: fmt.width,
                height: fmt.height,
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <TripCard trip={trip} theme={selectedTheme} format="whatsapp" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* CTA */}
      <div style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
      }}>
        <Link
          to={isAuthenticated ? '/plan' : '/register'}
          className="btn-primary"
          style={{
            textDecoration: 'none',
            padding: '12px 32px',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ✨ {isAuthenticated ? 'Plan Your Own Trip' : 'Sign Up Free — Plan Yours'}
        </Link>
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          Planned with GoTrip Pro · AI-powered travel planning
        </p>
      </div>
    </div>
  );
}
