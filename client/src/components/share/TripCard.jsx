import { THEME_CONFIGS } from '../../utils/cardThemes';
import { CARD_FORMATS } from '../../utils/cardFormats';
import {
  getDestinationEmoji,
  getDestinationTagline,
  extractHighlights,
  getEyebrow,
  getTravelerLabel,
} from '../../utils/cardHelpers';

/**
 * TripCard — Cinematic travel poster for shareable trip cards.
 *
 * Architecture:
 *   1. Background image layer (destination photo, object-fit cover)
 *   2. Cinematic gradient overlay (theme-specific)
 *   3. Content layer (flex column, z-indexed above overlay)
 *
 * ALL styles are inline for html2canvas compatibility.
 * No hooks, no state — pure props → HTML.
 */
export default function TripCard({ trip, theme = 'midnight', format = 'story' }) {
  const t = THEME_CONFIGS[theme] || THEME_CONFIGS.midnight;
  const { width, height } = CARD_FORMATS[format] || CARD_FORMATS.story;
  const isWide = format === 'twitter';
  const isSquare = format === 'post';

  // Data extraction
  const emoji = getDestinationEmoji(trip.destination);
  const highlights = extractHighlights(trip.tripData?.itinerary);
  const eyebrow = getEyebrow(trip.travelStyle);
  const tagline = getDestinationTagline(trip.destination, trip.travelStyle);
  const travelerLabel = getTravelerLabel(trip.travelers);
  const styleName = (trip.travelStyle || '').replace(/^\w/, (c) => c.toUpperCase());
  const destinationImage = trip.destinationImage || null;

  // ─── Adaptive Scaling ─────────────────────────────────────────
  // Base reference: 1080px width for story
  const s = width / 1080;

  // ─── Typography Sizes (large for readability at preview scale) ─
  const destFontSize = isWide ? Math.round(72 * s) : isSquare ? Math.round(100 * s) : Math.round(120 * s);
  const eyebrowSize = Math.round(30 * s);
  const taglineSize = Math.round(28 * s);
  const bodySize = Math.round(30 * s);
  const brandSize = Math.round(26 * s);
  const highlightTitleSize = Math.round(34 * s);
  const highlightLabelSize = Math.round(24 * s);
  const statsSize = Math.round(26 * s);
  const locationSize = Math.round(26 * s);

  // ─── Spacing ──────────────────────────────────────────────────
  const padX = Math.round(56 * s);
  const padY = Math.round(56 * s);

  // ─── Sub-components (all inline-styled) ───────────────────────

  const LocationBadge = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: Math.round(12 * s),
    }}>
      <div style={{
        width: Math.round(12 * s),
        height: Math.round(12 * s),
        borderRadius: '50%',
        background: t.accent,
        boxShadow: `0 0 ${Math.round(12 * s)}px rgba(${t.accentRgb},0.6)`,
      }} />
      <span style={{
        fontFamily: t.bodyFont,
        fontSize: locationSize,
        fontWeight: 600,
        color: t.textSecondary,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {trip.destination}
      </span>
    </div>
  );

  const TravelBadge = () => (
    <div style={{
      width: Math.round(100 * s),
      height: Math.round(100 * s),
      borderRadius: '50%',
      border: `${Math.round(2 * s)}px solid ${t.badgeBorder}`,
      background: t.badgeBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{
        fontSize: Math.round(16 * s),
        fontWeight: 800,
        color: t.accent,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontFamily: t.bodyFont,
        lineHeight: 1.15,
        textAlign: 'center',
      }}>
        {styleName}
      </span>
    </div>
  );

  const HeroSection = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: Math.round(12 * s),
    }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily: t.headingFont,
        fontSize: eyebrowSize,
        fontWeight: 400,
        fontStyle: 'italic',
        color: t.textSecondary,
        letterSpacing: '0.02em',
      }}>
        {eyebrow}
      </div>

      {/* DESTINATION — massive */}
      <div style={{
        fontFamily: t.headingFont,
        fontSize: destFontSize,
        fontWeight: theme === 'editorial' ? 900 : 700,
        color: t.text,
        lineHeight: 0.95,
        letterSpacing: theme === 'editorial' ? '-0.02em' : '0.01em',
        textTransform: theme === 'editorial' ? 'uppercase' : 'none',
        wordBreak: 'break-word',
        textShadow: `0 ${Math.round(4 * s)}px ${Math.round(20 * s)}px rgba(0,0,0,0.4)`,
      }}>
        {trip.destination}
      </div>

      {/* Tagline with accent underline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: Math.round(14 * s),
        marginTop: Math.round(8 * s),
      }}>
        <div style={{
          width: Math.round(36 * s),
          height: Math.round(3 * s),
          background: t.accent,
          borderRadius: Math.round(2 * s),
        }} />
        <span style={{
          fontFamily: t.headingFont,
          fontSize: taglineSize,
          fontWeight: 500,
          fontStyle: 'italic',
          color: t.accent,
          letterSpacing: '0.02em',
        }}>
          {tagline}
        </span>
      </div>
    </div>
  );

  const StatsPill = () => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: Math.round(16 * s),
      padding: `${Math.round(16 * s)}px ${Math.round(32 * s)}px`,
      borderRadius: Math.round(40 * s),
      background: t.pillBg,
      border: `${Math.round(1.5 * s)}px solid ${t.pillBorder}`,
      backdropFilter: 'blur(8px)',
      marginTop: Math.round(24 * s),
    }}>
      {[
        `${trip.duration} Days`,
        travelerLabel,
        styleName,
      ].map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: Math.round(10 * s) }}>
          {i > 0 && (
            <span style={{
              width: Math.round(6 * s),
              height: Math.round(6 * s),
              borderRadius: '50%',
              background: t.accent,
              opacity: 0.6,
            }} />
          )}
          <span style={{
            fontFamily: t.bodyFont,
            fontSize: statsSize,
            fontWeight: 700,
            color: t.pillText,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            {item}
          </span>
        </span>
      ))}
    </div>
  );

  const HighlightsSection = () => {
    if (highlights.length === 0) return null;
    return (
      <div style={{
        background: t.glassBg,
        border: `${Math.round(1 * s)}px solid ${t.glassBorder}`,
        borderRadius: Math.round(20 * s),
        padding: `${Math.round(28 * s)}px ${Math.round(32 * s)}px`,
        backdropFilter: 'blur(12px)',
      }}>
        {/* Section label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: Math.round(14 * s),
          marginBottom: Math.round(20 * s),
        }}>
          <div style={{
            flex: 1,
            height: Math.round(1 * s),
            background: t.dividerColor,
          }} />
          <span style={{
            fontFamily: t.bodyFont,
            fontSize: highlightLabelSize,
            fontWeight: 700,
            color: t.textMuted,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Trip Highlights
          </span>
          <div style={{
            flex: 1,
            height: Math.round(1 * s),
            background: t.dividerColor,
          }} />
        </div>

        {/* Highlight rows */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: Math.round(20 * s),
        }}>
          {highlights.map((h, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: Math.round(18 * s),
            }}>
              <span style={{
                fontSize: Math.round(36 * s),
                lineHeight: 1,
                width: Math.round(44 * s),
                textAlign: 'center',
                flexShrink: 0,
              }}>
                {h.emoji}
              </span>
              <span style={{
                fontFamily: t.bodyFont,
                fontSize: highlightTitleSize,
                fontWeight: 600,
                color: t.text,
                letterSpacing: '0.01em',
                lineHeight: 1.3,
              }}>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Branding = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Math.round(10 * s),
    }}>
      <span style={{ fontSize: Math.round(24 * s), lineHeight: 1 }}>✈</span>
      <span style={{
        fontFamily: t.bodyFont,
        fontSize: brandSize,
        fontWeight: 500,
        color: t.textMuted,
        letterSpacing: '0.03em',
      }}>
        Crafted with{' '}
        <span style={{ fontWeight: 700, color: t.textSecondary }}>GoTrip</span>
      </span>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // WIDE LAYOUT (Twitter / X)
  // ═══════════════════════════════════════════════════════════════
  if (isWide) {
    return (
      <div style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: t.bodyFont,
      }}>
        {/* Background image */}
        {destinationImage && (
          <img
            src={destinationImage}
            crossOrigin="anonymous"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}

        {/* Fallback + overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: destinationImage ? t.overlay : t.fallbackBg,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: `${Math.round(36 * s)}px ${Math.round(48 * s)}px`,
          boxSizing: 'border-box',
          gap: Math.round(40 * s),
        }}>
          {/* Left side — Hero */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: Math.round(12 * s) }}>
            <LocationBadge />
            <div style={{
              fontFamily: t.headingFont,
              fontSize: Math.round(72 * s),
              fontWeight: theme === 'editorial' ? 900 : 700,
              color: t.text,
              lineHeight: 0.95,
              textShadow: `0 ${Math.round(2 * s)}px ${Math.round(12 * s)}px rgba(0,0,0,0.4)`,
              textTransform: theme === 'editorial' ? 'uppercase' : 'none',
              letterSpacing: theme === 'editorial' ? '-0.02em' : '0.01em',
            }}>
              {trip.destination}
            </div>
            <div style={{
              fontFamily: t.headingFont,
              fontSize: Math.round(24 * s),
              fontStyle: 'italic',
              color: t.accent,
              marginTop: Math.round(4 * s),
            }}>
              {tagline}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: Math.round(10 * s),
              marginTop: Math.round(12 * s),
            }}>
              {[`${trip.duration} Days`, travelerLabel, styleName].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: Math.round(8 * s) }}>
                  {i > 0 && <span style={{ color: t.textMuted, fontSize: Math.round(16 * s) }}>·</span>}
                  <span style={{
                    fontFamily: t.bodyFont,
                    fontSize: Math.round(20 * s),
                    fontWeight: 700,
                    color: t.pillText,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>{item}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right side — Highlights + Brand */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: Math.round(18 * s),
            minWidth: Math.round(380 * s),
          }}>
            {highlights.slice(0, 2).map((h, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: Math.round(14 * s),
                background: t.glassBg,
                border: `1px solid ${t.glassBorder}`,
                borderRadius: Math.round(14 * s),
                padding: `${Math.round(14 * s)}px ${Math.round(20 * s)}px`,
              }}>
                <span style={{ fontSize: Math.round(28 * s) }}>{h.emoji}</span>
                <span style={{
                  fontFamily: t.bodyFont,
                  fontSize: Math.round(22 * s),
                  fontWeight: 600,
                  color: t.text,
                }}>{h.text}</span>
              </div>
            ))}
            <Branding />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // VERTICAL LAYOUT (Story, Post, WhatsApp)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{
      width,
      height,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: t.bodyFont,
    }}>
      {/* Background image */}
      {destinationImage && (
        <img
          src={destinationImage}
          crossOrigin="anonymous"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: destinationImage ? t.overlay : t.fallbackBg,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: `${padY}px ${padX}px`,
        boxSizing: 'border-box',
      }}>
        {/* ─ Top Bar ─ */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <LocationBadge />
          <TravelBadge />
        </div>

        {/* ─ Hero Section ─ */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: Math.round(8 * s),
          marginTop: isSquare ? Math.round(-20 * s) : 0,
        }}>
          <HeroSection />
          <StatsPill />
        </div>

        {/* ─ Bottom Content ─ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: Math.round(20 * s),
        }}>
          <HighlightsSection />
          <Branding />
        </div>
      </div>
    </div>
  );
}
