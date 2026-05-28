import { motion } from 'framer-motion';
import { FiMessageSquare, FiCpu, FiMap, FiSliders, FiCamera } from 'react-icons/fi';

const STEPS = [
  { num: 1, title: 'Tell us your vibe', desc: 'Share how you want your trip to feel, not just where.', icon: FiMessageSquare },
  { num: 2, title: 'AI builds your trip', desc: 'Our AI crafts the perfect itinerary for you.', icon: FiCpu },
  { num: 3, title: 'Explore your journey', desc: 'See everything on an interactive map.', icon: FiMap },
  { num: 4, title: 'Refine with AI', desc: 'AI Companion adjusts your trip instantly, your way.', icon: FiSliders },
  { num: 5, title: 'Travel & create memories', desc: 'Every trip becomes a memory you\'ll treasure forever.', icon: FiCamera },
];

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section id="how-it-works" className="homepage-wrapper" style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ 
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', 
            color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 8 
          }}>
            — How GoTrip Works
          </div>
          <h2 className="hp-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)' }}>
            Plan smarter, travel better.
          </h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: 16 
          }}
        >
          {STEPS.map((step, index) => (
            <motion.div 
              key={step.num}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              style={{
                background: 'rgba(20, 24, 32, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                padding: '24px 16px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20, 24, 32, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(20, 24, 32, 0.4)'}
            >
              {/* Connector line (hide on last item and on mobile) */}
              {index < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: 52,
                  right: -10,
                  width: 20,
                  height: 1,
                  borderTop: '2px dotted rgba(255,255,255,0.2)',
                  display: 'none', // Handled via CSS usually, keeping it simple here
                }} className="hidden lg:block" />
              )}

              <div style={{ 
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                color: '#f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800, marginBottom: 16
              }}>
                {step.num}
              </div>

              {/* Icon placeholder (mocking the image in reference) */}
              <div style={{
                  width: '100%', height: 90, borderRadius: 10,
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                  marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.2)', fontSize: '1.5rem'
              }}>
                  <step.icon />
              </div>

              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
