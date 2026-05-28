import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StepVibes.css';

/* ─── Framer Motion Variants (reuse wizard pattern) ─────────── */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

/* ─── Vibe Definitions ──────────────────────────────────────── */
const POPULAR_VIBES = [
  { id: 'slow_mornings', emoji: '🌅', label: 'Slow Peaceful Mornings', desc: 'Late starts & calm beginnings' },
  { id: 'local_food', emoji: '🍜', label: 'More Local Food', desc: 'Authentic eateries & street food' },
  { id: 'less_crowded', emoji: '🌿', label: 'Less Crowded Places', desc: 'Hidden gems over tourist spots' },
  { id: 'cafe_hopping', emoji: '☕', label: 'Café Hopping', desc: 'Scenic cafés & cozy spots' },
  { id: 'romantic', emoji: '❤️', label: 'Romantic Atmosphere', desc: 'Intimate & couples-friendly' },
  { id: 'adventure', emoji: '🏔', label: 'Adventure-Filled Days', desc: 'Thrilling outdoor experiences' },
  { id: 'nightlife', emoji: '🌆', label: 'Nightlife Energy', desc: 'Vibrant evenings & night markets' },
];

const MORE_VIBES = [
  // Pace & Energy
  { id: 'relaxed_afternoons', emoji: '🌤', label: 'Relaxed Afternoons', desc: 'Unhurried afternoon leisure' },
  { id: 'calm_evenings', emoji: '🌙', label: 'Calm Evenings', desc: 'Peaceful evening wind-down' },
  { id: 'fast_paced', emoji: '⚡', label: 'Fast-Paced Exploration', desc: 'Pack in maximum experiences' },
  { id: 'slow_travel', emoji: '🧘', label: 'Slow Travel Pace', desc: 'Deeper immersion, fewer spots' },
  { id: 'less_walking', emoji: '🚶', label: 'Less Walking', desc: 'Prefer transport between stops' },
  { id: 'avoid_hectic', emoji: '😌', label: 'Avoid Hectic Days', desc: 'Generous time between activities' },
  // Experience Type
  { id: 'scenic_moments', emoji: '📸', label: 'Scenic Moments', desc: 'Stunning viewpoints & vistas' },
  { id: 'cultural', emoji: '🎭', label: 'Cultural Experiences', desc: 'Museums, heritage & local art' },
  { id: 'quiet_spots', emoji: '🕊', label: 'Quiet Hidden Spots', desc: 'Secluded peaceful corners' },
  { id: 'shopping', emoji: '🛍', label: 'Shopping Friendly', desc: 'Markets, boutiques & souvenirs' },
  { id: 'luxury', emoji: '💎', label: 'Luxury Experiences', desc: 'Premium & exclusive access' },
  { id: 'leisure', emoji: '🏖', label: 'Leisure & Relaxation', desc: 'Spa, pool & slow moments' },
  // Emotional Feel
  { id: 'cozy_evenings', emoji: '🌌', label: 'Cozy Evenings', desc: 'Warm intimate night settings' },
  { id: 'memorable', emoji: '✨', label: 'Memorable Experiences', desc: 'Once-in-a-lifetime moments' },
  { id: 'photogenic', emoji: '🎨', label: 'Photogenic Places', desc: 'Instagram-worthy locations' },
  { id: 'sunset_sunrise', emoji: '🌄', label: 'Sunset/Sunrise Moments', desc: 'Golden hour experiences' },
  { id: 'peaceful', emoji: '🍃', label: 'Peaceful Environment', desc: 'Serene nature & calm vibes' },
];

const ALL_VIBES = [...POPULAR_VIBES, ...MORE_VIBES];

/* ─── Smart Presets ─────────────────────────────────────────── */
const VIBE_PRESETS = [
  { id: 'slow_peaceful', emoji: '🌿', label: 'Slow & Peaceful', vibes: ['slow_mornings', 'relaxed_afternoons', 'less_crowded', 'quiet_spots'] },
  { id: 'romantic_escape', emoji: '❤️', label: 'Romantic Escape', vibes: ['cozy_evenings', 'sunset_sunrise', 'romantic'] },
  { id: 'adventure_mode', emoji: '🏔', label: 'Adventure Mode', vibes: ['adventure', 'scenic_moments', 'fast_paced'] },
  { id: 'cafe_culture', emoji: '☕', label: 'Café & Culture', vibes: ['cafe_hopping', 'local_food', 'cultural'] },
  { id: 'city_energy', emoji: '🌆', label: 'City Energy', vibes: ['nightlife', 'photogenic', 'shopping'] },
];

/* ─── AI Hint Generator ─────────────────────────────────────── */
const HINT_FRAGMENTS = {
  slow_mornings: 'relaxed mornings',
  relaxed_afternoons: 'leisurely afternoons',
  calm_evenings: 'gentle evenings',
  fast_paced: 'packed schedules',
  slow_travel: 'deeper immersion',
  less_walking: 'minimal walking',
  avoid_hectic: 'a calmer pace',
  local_food: 'authentic local food',
  cafe_hopping: 'scenic cafés',
  scenic_moments: 'stunning viewpoints',
  cultural: 'cultural depth',
  less_crowded: 'off-the-beaten-path spots',
  quiet_spots: 'quiet hidden corners',
  shopping: 'shopping stops',
  nightlife: 'vibrant nightlife',
  luxury: 'premium touches',
  adventure: 'thrilling adventures',
  leisure: 'leisure time',
  romantic: 'romantic settings',
  cozy_evenings: 'cozy evenings',
  memorable: 'unforgettable moments',
  photogenic: 'photogenic locations',
  sunset_sunrise: 'golden hour magic',
  peaceful: 'peaceful surroundings',
  surprise_me: 'a creative mix of experiences',
};

function generateAIHint(selectedVibes) {
  if (selectedVibes.length === 0) return '';
  if (selectedVibes.includes('surprise_me') && selectedVibes.length === 1) {
    return 'GoTrip will creatively design a balanced itinerary with hidden gems and unexpected delights.';
  }

  const fragments = selectedVibes
    .filter(v => v !== 'surprise_me')
    .slice(0, 4)
    .map(v => HINT_FRAGMENTS[v])
    .filter(Boolean);

  if (fragments.length === 0) return '';
  if (fragments.length === 1) {
    return `GoTrip will shape your itinerary around ${fragments[0]}.`;
  }

  const last = fragments.pop();
  return `GoTrip will create an itinerary with ${fragments.join(', ')} and ${last}.`;
}

/* ─── Personality Sentence Generator ─────────────────────────── */
function generatePersonalitySentence(selectedVibes) {
  if (selectedVibes.length === 0) return '';
  if (selectedVibes.includes('surprise_me') && selectedVibes.length === 1) {
    return 'Your trip will feel fresh, creative, and full of surprises.';
  }

  const paceVibes = ['slow_mornings', 'relaxed_afternoons', 'calm_evenings', 'slow_travel', 'avoid_hectic', 'less_walking'];
  const energyVibes = ['fast_paced', 'adventure', 'nightlife'];
  const emotionalVibes = ['romantic', 'cozy_evenings', 'peaceful', 'memorable'];

  const hasPace = selectedVibes.some(v => paceVibes.includes(v));
  const hasEnergy = selectedVibes.some(v => energyVibes.includes(v));
  const hasEmotional = selectedVibes.some(v => emotionalVibes.includes(v));

  let sentence = 'Your trip will feel';
  const descriptors = [];

  if (hasPace && !hasEnergy) descriptors.push('slower', 'calmer');
  if (hasEnergy && !hasPace) descriptors.push('energetic', 'action-packed');
  if (hasPace && hasEnergy) descriptors.push('thoughtfully balanced');
  if (hasEmotional) descriptors.push('deeply personal');
  if (selectedVibes.includes('local_food') || selectedVibes.includes('cafe_hopping')) descriptors.push('experience-focused');
  if (selectedVibes.includes('less_crowded') || selectedVibes.includes('quiet_spots')) descriptors.push('off the beaten path');
  if (selectedVibes.includes('photogenic') || selectedVibes.includes('scenic_moments')) descriptors.push('visually stunning');

  if (descriptors.length === 0) descriptors.push('uniquely personalized');
  const unique = [...new Set(descriptors)].slice(0, 3);

  if (unique.length === 1) {
    sentence += ` ${unique[0]}.`;
  } else {
    const last = unique.pop();
    sentence += ` ${unique.join(', ')} and ${last}.`;
  }

  return sentence;
}

/* ═══════════════════════════════════════════════════════════════
   STEP VIBES COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function StepVibes({ selectedVibes, customTripIntent, onUpdate }) {
  const [showMore, setShowMore] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const toggleVibe = useCallback((vibeId) => {
    const current = [...selectedVibes];
    const idx = current.indexOf(vibeId);

    // If selecting surprise_me, clear all others
    if (vibeId === 'surprise_me') {
      if (idx >= 0) {
        onUpdate('selectedVibes', []);
      } else {
        onUpdate('selectedVibes', ['surprise_me']);
        setActivePreset(null);
      }
      return;
    }

    // If surprise_me is active and user picks another vibe, remove surprise_me
    const filtered = current.filter(v => v !== 'surprise_me');

    if (idx >= 0) {
      filtered.splice(filtered.indexOf(vibeId), 1);
    } else {
      filtered.push(vibeId);
    }

    onUpdate('selectedVibes', filtered);

    // Clear active preset if user manually changes selection
    if (activePreset) {
      const preset = VIBE_PRESETS.find(p => p.id === activePreset);
      if (preset) {
        const presetMatch = preset.vibes.every(v => filtered.includes(v)) && filtered.length === preset.vibes.length;
        if (!presetMatch) setActivePreset(null);
      }
    }
  }, [selectedVibes, activePreset, onUpdate]);

  const applyPreset = useCallback((preset) => {
    if (activePreset === preset.id) {
      // Deactivate preset
      setActivePreset(null);
      onUpdate('selectedVibes', []);
    } else {
      setActivePreset(preset.id);
      onUpdate('selectedVibes', [...preset.vibes]);
    }
  }, [activePreset, onUpdate]);

  const handleCustomTextChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      onUpdate('customTripIntent', value);
    }
  }, [onUpdate]);

  const aiHint = useMemo(() => generateAIHint(selectedVibes), [selectedVibes]);
  const vibeCount = selectedVibes.filter(v => v !== 'surprise_me').length;

  const renderVibeCard = (vibe) => {
    const isSelected = selectedVibes.includes(vibe.id);
    const isSurprise = vibe.id === 'surprise_me';

    return (
      <div
        key={vibe.id}
        className={`vibe-card${isSelected ? ' selected' : ''}${isSurprise ? ' surprise-me' : ''}`}
        onClick={() => toggleVibe(vibe.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleVibe(vibe.id))}
        aria-pressed={isSelected}
        aria-label={`${vibe.label}${vibe.desc ? ': ' + vibe.desc : ''}`}
      >
        <span className="vibe-card-emoji" aria-hidden="true">{vibe.emoji}</span>
        <div className="vibe-card-content">
          <span className="vibe-card-label">{vibe.label}</span>
          {vibe.desc && <span className="vibe-card-desc">{vibe.desc}</span>}
        </div>
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* ─── Header ─── */}
      <motion.div variants={itemVariants} className="wiz-eyebrow">Personalize</motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline">
        ✨ How do you want your trip to feel?
      </motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext">
        Help GoTrip personalize your journey <span style={{ opacity: 0.6 }}>(optional)</span>
      </motion.p>

      {/* ─── Smart Presets ─── */}
      <motion.div variants={itemVariants}>
        <div className="vibe-section-label">Quick Presets</div>
        <div className="vibe-presets">
          {VIBE_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`vibe-preset-chip${activePreset === preset.id ? ' active' : ''}`}
              onClick={() => applyPreset(preset)}
              type="button"
              aria-pressed={activePreset === preset.id}
            >
              <span className="vibe-preset-emoji" aria-hidden="true">{preset.emoji}</span>
              {preset.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Selection Count ─── */}
      {vibeCount > 0 && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="vibe-count-badge">
            ✓ {vibeCount} preference{vibeCount !== 1 ? 's' : ''} selected
          </div>
        </motion.div>
      )}

      {/* ─── Soft Suggestion ─── */}
      <motion.div variants={itemVariants} className="vibe-soft-suggestion">
        Select 3–7 preferences for best results, or use a preset above.
      </motion.div>

      {/* ─── Popular Picks ─── */}
      <motion.div variants={itemVariants}>
        <div className="vibe-section-label">Popular Picks</div>
        <div className="vibe-cards-grid">
          {POPULAR_VIBES.map(renderVibeCard)}
          {/* Surprise Me card */}
          {renderVibeCard({
            id: 'surprise_me',
            emoji: '✨',
            label: 'Surprise Me',
            desc: 'Let AI creatively balance your trip',
          })}
        </div>
      </motion.div>

      {/* ─── Show More Accordion ─── */}
      <motion.div variants={itemVariants}>
        <button
          className="vibe-show-more-btn"
          onClick={() => setShowMore(!showMore)}
          type="button"
          aria-expanded={showMore}
        >
          {showMore ? 'Show fewer preferences' : 'Show more preferences'}
          <span className={`vibe-show-more-arrow${showMore ? ' expanded' : ''}`}>▼</span>
        </button>

        <div className={`vibe-more-section${showMore ? ' expanded' : ''}`}>
          <div className="vibe-cards-grid">
            {MORE_VIBES.map(renderVibeCard)}
          </div>
        </div>
      </motion.div>

      {/* ─── Guardrail ─── */}
      <AnimatePresence>
        {vibeCount > 8 && (
          <motion.div
            className="vibe-guardrail"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <span aria-hidden="true">💡</span>
            <span className="vibe-guardrail-text">
              Fewer preferences often create a more focused trip experience.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Hint ─── */}
      <AnimatePresence>
        {aiHint && (
          <motion.div
            className="vibe-ai-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
          >
            <span className="vibe-ai-hint-icon" aria-hidden="true">✨</span>
            <span className="vibe-ai-hint-text">{aiHint}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Custom Intent Textarea ─── */}
      <motion.div variants={itemVariants} className="vibe-custom-section">
        <div className="vibe-custom-label">Describe your ideal trip (optional)</div>
        <div className="vibe-custom-helper">Tell GoTrip the kind of experience you want.</div>
        <textarea
          className="vibe-custom-textarea"
          placeholder="I want slow peaceful afternoons, scenic cafés, and less rushing."
          value={customTripIntent}
          onChange={handleCustomTextChange}
          maxLength={500}
          aria-label="Describe your ideal trip experience"
        />
        {customTripIntent.length > 400 && (
          <div className={`vibe-char-count${customTripIntent.length > 480 ? ' warning' : ''}`}>
            {customTripIntent.length}/500
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Exports for StepSummary reuse ─────────────────────────── */
export { ALL_VIBES, POPULAR_VIBES, MORE_VIBES, generatePersonalitySentence };
