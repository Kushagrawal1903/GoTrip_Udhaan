import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../layout/ThemeToggle';
import './TripWizard.css';

/* ─── Constants ──────────────────────────────────────────────── */
const TOTAL_STEPS = 5;

const DESTINATIONS = [
  { emoji: '🏖️', name: 'Goa', tags: 'Beach · Party' },
  { emoji: '🏔️', name: 'Manali', tags: 'Mountains · Trek' },
  { emoji: '🏯', name: 'Rajasthan', tags: 'Culture · Heritage' },
  { emoji: '🌴', name: 'Kerala', tags: 'Backwaters · Nature' },
  { emoji: '🌺', name: 'Bali', tags: 'Temples · Rice fields' },
  { emoji: '❄️', name: 'Shimla', tags: 'Snow · Colonial' },
];

const DURATION_PRESETS = [
  { label: 'Weekend', value: 3 },
  { label: 'Week', value: 5 },
  { label: 'Long', value: 7 },
  { label: 'Fortnight', value: 14 },
];

const STYLE_OPTIONS = [
  { id: 'adventure', emoji: '🧗', name: 'Adventure' },
  { id: 'relaxation', emoji: '🧘', name: 'Relaxation' },
  { id: 'cultural', emoji: '🏛️', name: 'Cultural' },
  { id: 'family', emoji: '👨‍👩‍👧', name: 'Family' },
  { id: 'romantic', emoji: '💑', name: 'Romantic' },
];

const BUDGET_OPTIONS = [
  { id: 'low', emoji: '🎒', name: 'Budget', desc: 'Hostels, street food, public transport', price: '₹800–2,500/night' },
  { id: 'moderate', emoji: '🏨', name: 'Mid-Range', desc: '3-star hotels, mixed transport, cafés', price: '₹3,000–8,000/night' },
  { id: 'premium', emoji: '✨', name: 'Premium', desc: '5-star luxury, private car, fine dining', price: '₹10,000+/night' },
];

const TRAVEL_FACTS = [
  "Did you know? The shortest commercial flight lasts just 57 seconds.",
  "Did you know? Japan has one vending machine for every 40 people.",
  "Did you know? There are no clocks in Las Vegas casinos.",
  "Did you know? France is the most visited country in the world.",
  "Did you know? The Great Wall of China is a collection of multiple walls.",
  "Did you know? Antarctica is technically the world's largest desert.",
  "Did you know? Istanbul is the only city in the world located on two continents."
];

/* ─── Framer Motion Variants ─────────────────────────────────── */
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.15 },
    },
  }),
};

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

/* ─── Glow positions per step ────────────────────────────────── */
const GLOW_POSITIONS = [
  { g1: { top: -100, right: -100 }, g2: { bottom: -50, left: -50 } },
  { g1: { top: -50, right: -150 }, g2: { bottom: -100, left: -100 } },
  { g1: { top: -120, right: 50 }, g2: { bottom: 50, left: -120 } },
  { g1: { top: 0, right: -80 }, g2: { bottom: -80, left: 50 } },
  { g1: { top: -80, right: -50 }, g2: { bottom: 0, left: -80 } },
];

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — Destination
   ═══════════════════════════════════════════════════════════════ */
function StepDestination({ destination, onUpdate }) {
  const [selectedCard, setSelectedCard] = useState(
    DESTINATIONS.findIndex(d => d.name === destination) >= 0
      ? DESTINATIONS.findIndex(d => d.name === destination)
      : -1
  );

  const handleCardClick = (dest, index) => {
    setSelectedCard(index);
    onUpdate('destination', dest.name);
  };

  const handleInputChange = (e) => {
    setSelectedCard(-1);
    onUpdate('destination', e.target.value);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="wiz-eyebrow">Where to?</motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline">Your next adventure awaits</motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext">
        Type a destination or pick from our most loved spots below.
      </motion.p>

      <motion.div variants={itemVariants} className="wiz-search-wrapper">
        <span className="wiz-search-icon">🌍</span>
        <input
          type="text"
          className="wiz-search-input"
          placeholder="Goa, Manali, Jaipur, Bali…"
          value={destination}
          onChange={handleInputChange}
          autoFocus
        />
      </motion.div>

      <motion.div variants={itemVariants} className="wiz-dest-grid">
        {DESTINATIONS.map((dest, i) => (
          <div
            key={dest.name}
            className={`wiz-card wiz-dest-card${selectedCard === i ? ' selected' : ''}`}
            onClick={() => handleCardClick(dest, i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(dest, i)}
          >
            <span className="wiz-dest-emoji">{dest.emoji}</span>
            <div className="wiz-dest-name">{dest.name}</div>
            <div className="wiz-dest-tags">{dest.tags}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — Duration + Travelers
   ═══════════════════════════════════════════════════════════════ */
function StepDuration({ duration, travelers, onUpdate }) {
  const activePreset = DURATION_PRESETS.find(p => p.value === duration);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="wiz-eyebrow">How long?</motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline">Plan your perfect timeline</motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext">
        Drag to set duration, then choose how many are joining.
      </motion.p>

      {/* Big animated number */}
      <motion.div variants={itemVariants}>
        <div style={{ textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={duration}
              className="wiz-big-number"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {duration}
            </motion.div>
          </AnimatePresence>
          <div className="wiz-big-number-label">
            {duration === 1 ? 'Day' : 'Days'}
          </div>
        </div>
      </motion.div>

      {/* Slider */}
      <motion.div variants={itemVariants}>
        <input
          type="range"
          className="wiz-slider"
          min="1"
          max="30"
          value={duration}
          onChange={(e) => onUpdate('duration', Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--wiz-teal) 0%, var(--wiz-teal) ${((duration - 1) / 29) * 100}%, var(--wiz-surface2) ${((duration - 1) / 29) * 100}%, var(--wiz-surface2) 100%)`,
          }}
        />
      </motion.div>

      {/* Presets */}
      <motion.div variants={itemVariants} className="wiz-presets">
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`wiz-preset-chip${activePreset?.value === preset.value ? ' active' : ''}`}
            onClick={() => onUpdate('duration', preset.value)}
          >
            {preset.label} ({preset.value})
          </button>
        ))}
      </motion.div>

      {/* Travelers */}
      <motion.div variants={itemVariants} className="wiz-travelers">
        <div className="wiz-travelers-eyebrow">Who's coming?</div>
        <div className="wiz-travelers-controls">
          <button
            type="button"
            className="wiz-travelers-btn"
            disabled={travelers <= 1}
            onClick={() => onUpdate('travelers', travelers - 1)}
          >
            −
          </button>
          <AnimatePresence mode="wait">
            <motion.div
              key={travelers}
              className="wiz-travelers-count"
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {travelers}
            </motion.div>
          </AnimatePresence>
          <button
            type="button"
            className="wiz-travelers-btn"
            disabled={travelers >= 10}
            onClick={() => onUpdate('travelers', travelers + 1)}
          >
            +
          </button>
        </div>
        <div className="wiz-travelers-label">
          {travelers === 1 ? 'Traveler' : 'Travelers'}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — Travel Style
   ═══════════════════════════════════════════════════════════════ */
function StepStyle({ style, onUpdate }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="wiz-eyebrow">Your vibe</motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline">What is your travel style?</motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext">
        Pick the style that fits your mood. This shapes every recommendation.
      </motion.p>

      <motion.div variants={itemVariants} className="wiz-style-grid">
        {STYLE_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={`wiz-card wiz-style-card${style === opt.id ? ' selected' : ''}`}
            onClick={() => onUpdate('style', opt.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onUpdate('style', opt.id)}
          >
            <span className="wiz-style-emoji">{opt.emoji}</span>
            <span className="wiz-style-name">{opt.name}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4 — Budget
   ═══════════════════════════════════════════════════════════════ */
function StepBudget({ budget, onUpdate }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="wiz-eyebrow">Your budget</motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline">How do you like to travel?</motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext">
        We'll tailor hotels, dining, and activities to your comfort level.
      </motion.p>

      <motion.div variants={itemVariants} className="wiz-budget-list">
        {BUDGET_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={`wiz-card wiz-budget-card${budget === opt.id ? ' selected' : ''}`}
            onClick={() => onUpdate('budget', opt.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onUpdate('budget', opt.id)}
          >
            <span className="wiz-budget-emoji">{opt.emoji}</span>
            <div className="wiz-budget-info">
              <div className="wiz-budget-name">{opt.name}</div>
              <div className="wiz-budget-desc">{opt.desc}</div>
            </div>
            <div className="wiz-budget-right">
              <span className="wiz-budget-price">{opt.price}</span>
              <div className={`wiz-radio${budget === opt.id ? ' selected' : ''}`} />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP LOADING (AI GENERATION)
   ═══════════════════════════════════════════════════════════════ */
function StepLoading({ generationStartTime }) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % TRAVEL_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showTimeout = generationStartTime && (Date.now() - generationStartTime > 30000);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="wiz-loading-container">
      <motion.div variants={itemVariants} className="wiz-loading-spinner-wrapper">
         <div className="wiz-loading-ring"></div>
         <div className="wiz-loading-center-dot"></div>
      </motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline" style={{ textAlign: 'center', marginTop: '24px' }}>
        Crafting your journey
      </motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext" style={{ textAlign: 'center', marginBottom: '40px' }}>
        Our AI is curating the best hotels, dining, and activities for you.
      </motion.p>

      <motion.div variants={itemVariants} className="wiz-fact-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="wiz-fact-text"
          >
            {TRAVEL_FACTS[factIndex]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {showTimeout && (
        <motion.p
          className="wiz-timeout-msg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginTop: '24px' }}
        >
          This is taking longer than usual… still working on it.
        </motion.p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 5 — Summary + Generate
   ═══════════════════════════════════════════════════════════════ */
function StepSummary({ tripData, loading, error, onGenerate }) {
  const styleName = STYLE_OPTIONS.find(s => s.id === tripData.style)?.name || tripData.style;
  const budgetName = BUDGET_OPTIONS.find(b => b.id === tripData.budget)?.name || tripData.budget;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="wiz-eyebrow">All set!</motion.div>
      <motion.h2 variants={itemVariants} className="wiz-headline">Your trip looks amazing</motion.h2>
      <motion.p variants={itemVariants} className="wiz-subtext">
        Here's what we're generating. AI will craft every detail.
      </motion.p>

      <motion.div variants={itemVariants} className="wiz-summary-grid">
        <div className="wiz-summary-cell">
          <div className="wiz-summary-label">Destination</div>
          <div className="wiz-summary-value">{tripData.destination}</div>
        </div>
        <div className="wiz-summary-cell">
          <div className="wiz-summary-label">Duration</div>
          <div className="wiz-summary-value">{tripData.duration} {tripData.duration === 1 ? 'Day' : 'Days'}</div>
        </div>
        <div className="wiz-summary-cell">
          <div className="wiz-summary-label">Travelers</div>
          <div className="wiz-summary-value">{tripData.travelers} {tripData.travelers === 1 ? 'Person' : 'People'}</div>
        </div>
        <div className="wiz-summary-cell">
          <div className="wiz-summary-label">Travel Style</div>
          <div className="wiz-summary-value">{styleName}</div>
        </div>
        <div className="wiz-summary-cell full-width">
          <div className="wiz-summary-label">Budget</div>
          <div className="wiz-summary-value">{budgetName}</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <button
          className="wiz-generate-btn"
          onClick={onGenerate}
          disabled={loading}
        >
          ✦ Generate My AI Itinerary
        </button>

        {error && (
          <motion.p
            className="wiz-error-msg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WIZARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function TripWizard({ onGenerate, loading = false, error = '' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [generationStartTime, setGenerationStartTime] = useState(null);
  const [, forceUpdate] = useState(0);
  const [tripData, setTripData] = useState({
    destination: '',
    duration: 5,
    travelers: 2,
    style: null,
    budget: null,
  });

  const updateTripData = useCallback((field, value) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  }, []);

  const canContinue = () => {
    switch (currentStep) {
      case 0: return tripData.destination.trim().length > 0;
      case 1: return true; // defaults are valid
      case 2: return tripData.style !== null;
      case 3: return tripData.budget !== null;
      case 4: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1 && canContinue()) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = () => {
    setGenerationStartTime(Date.now());
    onGenerate({
      destination: tripData.destination,
      duration: tripData.duration,
      budget: tripData.budget,
      travelStyle: tripData.style,
      travelers: tripData.travelers,
    });
  };

  // Force re-render to update timeout message
  useEffect(() => {
    if (!loading || !generationStartTime) return;
    const interval = setInterval(() => forceUpdate(v => v + 1), 5000);
    return () => clearInterval(interval);
  }, [loading, generationStartTime]);

  // Reset generation start time when loading ends
  useEffect(() => {
    if (!loading) setGenerationStartTime(null);
  }, [loading]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && canContinue() && currentStep < TOTAL_STEPS - 1) {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'Escape' && currentStep > 0) {
        goBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const glowPos = GLOW_POSITIONS[currentStep] || GLOW_POSITIONS[0];

  const renderStep = () => {
    if (loading) {
      return <StepLoading generationStartTime={generationStartTime} />;
    }
    switch (currentStep) {
      case 0:
        return <StepDestination destination={tripData.destination} onUpdate={updateTripData} />;
      case 1:
        return <StepDuration duration={tripData.duration} travelers={tripData.travelers} onUpdate={updateTripData} />;
      case 2:
        return <StepStyle style={tripData.style} onUpdate={updateTripData} />;
      case 3:
        return <StepBudget budget={tripData.budget} onUpdate={updateTripData} />;
      case 4:
        return (
          <StepSummary
            tripData={tripData}
            loading={loading}
            error={error}
            onGenerate={handleGenerate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="trip-wizard">
      {/* ─── Progress Bar ─── */}
      <div className="wiz-progress-bar">
        <motion.div
          className="wiz-progress-fill"
          animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* ─── Navigation Header ─── */}
      <div className="wiz-nav">
        <button
          className="wiz-back-btn"
          onClick={goBack}
          style={{
            opacity: (currentStep === 0 || loading) ? 0 : 1,
            pointerEvents: (currentStep === 0 || loading) ? 'none' : 'auto',
          }}
        >
          ← Back
        </button>

        <div className="wiz-dots">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className={`wiz-dot${i < currentStep ? ' completed' : ''}${i === currentStep ? ' current' : ''}`}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          ))}
        </div>

        <div className="wiz-nav-right">
          <span className="wiz-step-label">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="wiz-content-area">
        {/* Ambient glows */}
        <motion.div
          className="wiz-glow-1"
          animate={{
            top: glowPos.g1.top ?? 'auto',
            right: glowPos.g1.right ?? 'auto',
            bottom: glowPos.g1.bottom ?? 'auto',
            left: glowPos.g1.left ?? 'auto',
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        <motion.div
          className="wiz-glow-2"
          animate={{
            top: glowPos.g2.top ?? 'auto',
            right: glowPos.g2.right ?? 'auto',
            bottom: glowPos.g2.bottom ?? 'auto',
            left: glowPos.g2.left ?? 'auto',
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />

        {/* Step slides */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={loading ? 'loading' : currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="wiz-step-container"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {renderStep()}

            {/* Continue button (not on step 5) */}
            {currentStep < TOTAL_STEPS - 1 && (
              <button
                className="wiz-continue-btn"
                onClick={goNext}
                disabled={!canContinue()}
              >
                Continue <span className="wiz-continue-arrow">→</span>
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
