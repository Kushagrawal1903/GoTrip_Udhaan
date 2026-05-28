import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function FinalCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="homepage-wrapper" style={{ padding: '32px 24px', background: '#080a0d', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative subtle arc */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '150%',
        height: '150px',
        background: 'radial-gradient(ellipse at center, rgba(217, 119, 6, 0.05) 0%, transparent 60%)',
        borderTop: '1px solid rgba(255,255,255,0.02)',
        borderRadius: '50% 50% 0 0',
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>✈️</div>
          <h2 className="hp-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', marginBottom: 16 }}>
            Ready to plan your dream trip?
          </h2>
          <p className="hp-subtitle" style={{ fontSize: '0.95rem', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Join thousands of travelers exploring the world with GoTrip.
          </p>

          <Link 
            to={isAuthenticated ? "/plan" : "/register"} 
            className="cta-glow" 
            style={{ 
              display: 'inline-block', 
              textDecoration: 'none', 
              padding: '12px 32px', 
              fontSize: '0.9rem',
              width: 'auto',
              borderRadius: '10px'
            }}
          >
            Start Planning — It's Free ✨
          </Link>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 20, 
            marginTop: 24,
            flexWrap: 'wrap'
          }}>
            {['No Signup Needed', 'Free Forever', 'Cancel Anytime'].map((text, i) => (
              <span key={i} style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4 
              }}>
                <span style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}><FiCheck /></span>
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
