import { THEME_CONFIGS } from '../../utils/cardThemes';
import { getRecommendedTheme } from '../../utils/cardHelpers';

/**
 * ThemePicker — Visual theme selector with mini gradient previews.
 * Redesigned for the cinematic photo-overlay card system.
 */
export default function ThemePicker({ selected, onSelect, travelStyle }) {
  const recommended = getRecommendedTheme(travelStyle);
  const themes = Object.entries(THEME_CONFIGS);

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
      }}>
        {themes.map(([key, t]) => {
          const isSelected = selected === key;
          const isRecommended = recommended === key;

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                width: 120,
                height: 68,
                borderRadius: 12,
                background: t.fallbackBg,
                border: isSelected
                  ? `2.5px solid ${t.accent}`
                  : '1.5px solid rgba(128,128,128,0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isSelected
                  ? `0 0 0 3px rgba(${t.accentRgb},0.15), 0 6px 20px rgba(0,0,0,0.2)`
                  : '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: 8,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Simulated card content */}
              <div style={{
                width: 24, height: 3, borderRadius: 2,
                background: t.accent, opacity: 0.9,
              }} />
              <div style={{
                fontFamily: t.headingFont,
                fontSize: 11,
                fontWeight: 700,
                color: t.text,
                opacity: 0.85,
                lineHeight: 1,
              }}>
                Dest.
              </div>
              <div style={{
                width: 40, height: 2, borderRadius: 1,
                background: t.textMuted, opacity: 0.5,
                marginTop: 1,
              }} />
              <div style={{
                display: 'flex', gap: 3, marginTop: 2,
              }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: t.glassBg,
                      border: `0.5px solid ${t.glassBorder}`,
                    }}
                  />
                ))}
              </div>

              {/* Recommended badge */}
              {isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: t.accent,
                  boxShadow: `0 0 4px rgba(${t.accentRgb},0.6)`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Theme labels */}
      <div style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        marginTop: 7,
      }}>
        {themes.map(([key, t]) => (
          <div
            key={key}
            style={{
              width: 120,
              textAlign: 'center',
              fontSize: '0.72rem',
              fontWeight: selected === key ? 700 : 500,
              color: selected === key
                ? 'var(--text-primary, #fff)'
                : 'var(--text-muted, #888)',
              transition: 'color 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}
