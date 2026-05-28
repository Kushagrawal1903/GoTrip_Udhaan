import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';

const BAD_FEATURES = [
  'Generic recommendations',
  'Static plans, no flexibility',
  'No personalization',
  'No memory of your journeys'
];

const GOOD_FEATURES = [
  'Plans around how you want to feel',
  'AI Companion that adapts',
  'Personalized for you',
  'Memories that stay forever'
];

export default function ComparisonSection() {
  return (
    <section id="features" className="homepage-wrapper" style={{ padding: '30px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
        
        <div className="comparison-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 32,
          position: 'relative'
        }}>
          {/* Left: Not another itinerary generator */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'rgba(20, 24, 32, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 20,
              padding: '32px 28px'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
              Not another itinerary generator.
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BAD_FEATURES.map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: '#ef4444', fontSize: '1rem', display: 'flex', alignItems: 'center' }}><FiX /></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* VS Badge */}
          <div className="vs-badge" style={{ width: '38px', height: '38px', fontSize: '0.8rem' }}>VS</div>

          {/* Right: GoTrip is different */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(20, 24, 32, 0.8) 100%)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              borderRadius: 20,
              padding: '32px 28px',
              boxShadow: '0 15px 30px -10px rgba(217, 119, 6, 0.1)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 24, color: '#f59e0b' }}>
              GoTrip is different.
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {GOOD_FEATURES.map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 20, height: 20, borderRadius: '50%', 
                    background: '#10b981', color: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem'
                  }}>
                    <FiCheck />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
