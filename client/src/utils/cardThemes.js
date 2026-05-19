/**
 * Theme configuration for cinematic share cards.
 * Designed for photo-overlay cards — all values are inline-style compatible.
 * html2canvas does NOT reliably pick up external CSS, so everything is inline.
 *
 * Each theme controls:
 *   - Gradient overlay on the destination photo
 *   - Typography colors + fonts
 *   - Glass card styling (for highlights section)
 *   - Accent color for decorative elements
 *   - Fallback gradient if no destination image exists
 */

export const THEME_CONFIGS = {
  midnight: {
    name: 'Midnight',
    // Gradient overlay on top of the destination photo — cool dark teal
    overlay:
      'linear-gradient(180deg, rgba(5,10,25,0.15) 0%, rgba(8,18,35,0.45) 35%, rgba(5,10,25,0.92) 75%, rgba(5,10,25,0.98) 100%)',
    // Core accent
    accent: '#14B8A6',
    accentRgb: '20,184,166',
    // Text hierarchy
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.85)',
    textMuted: 'rgba(255,255,255,0.55)',
    // Glass card
    glassBg: 'rgba(255,255,255,0.07)',
    glassBorder: 'rgba(255,255,255,0.12)',
    // Typography
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'DM Sans', 'Inter', sans-serif",
    // Fallback if no destination image
    fallbackBg:
      'linear-gradient(160deg, #050a19 0%, #0d1f3c 30%, #0a1628 60%, #050a19 100%)',
    // Pill styling
    pillBg: 'rgba(20,184,166,0.12)',
    pillBorder: 'rgba(20,184,166,0.35)',
    pillText: '#5eead4',
    // Decorative
    dividerColor: 'rgba(20,184,166,0.4)',
    badgeBg: 'rgba(255,255,255,0.08)',
    badgeBorder: 'rgba(255,255,255,0.18)',
  },

  golden: {
    name: 'Golden Hour',
    overlay:
      'linear-gradient(180deg, rgba(25,12,5,0.1) 0%, rgba(35,18,8,0.4) 35%, rgba(20,10,5,0.9) 75%, rgba(15,8,3,0.98) 100%)',
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    text: '#fff8e7',
    textSecondary: 'rgba(255,248,231,0.85)',
    textMuted: 'rgba(255,248,231,0.55)',
    glassBg: 'rgba(245,158,11,0.06)',
    glassBorder: 'rgba(245,158,11,0.18)',
    headingFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: "'DM Sans', 'Inter', sans-serif",
    fallbackBg:
      'linear-gradient(160deg, #0f0805 0%, #2a1a0a 30%, #1a1005 60%, #0f0805 100%)',
    pillBg: 'rgba(245,158,11,0.1)',
    pillBorder: 'rgba(245,158,11,0.3)',
    pillText: '#fcd34d',
    dividerColor: 'rgba(245,158,11,0.35)',
    badgeBg: 'rgba(245,158,11,0.06)',
    badgeBorder: 'rgba(245,158,11,0.2)',
  },

  editorial: {
    name: 'Editorial',
    overlay:
      'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.88) 75%, rgba(0,0,0,0.96) 100%)',
    accent: '#ffffff',
    accentRgb: '255,255,255',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.78)',
    textMuted: 'rgba(255,255,255,0.42)',
    glassBg: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.1)',
    headingFont: "'Syne', 'Arial Black', sans-serif",
    bodyFont: "'DM Sans', 'Inter', sans-serif",
    fallbackBg:
      'linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 30%, #111 60%, #0a0a0a 100%)',
    pillBg: 'rgba(255,255,255,0.08)',
    pillBorder: 'rgba(255,255,255,0.18)',
    pillText: 'rgba(255,255,255,0.85)',
    dividerColor: 'rgba(255,255,255,0.2)',
    badgeBg: 'rgba(255,255,255,0.05)',
    badgeBorder: 'rgba(255,255,255,0.15)',
  },
};
