import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiBook, FiStar, FiHeart, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const PASSPORT_STATS = [
  { icon: FiBook, value: '10K+', label: 'Trips Planned' },
  { icon: FiStar, value: '4.9/5', label: 'User Rating' },
  { icon: FiHeart, value: '100K+', label: 'Happy Travelers' },
  { icon: FiCamera, value: '1M+', label: 'Memories Created' },
];

export default function PassportShowcase() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="passport" className="homepage-wrapper" style={{ padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div className="passport-glow" />
      
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 40 }}>
          
          {/* Left: Image Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            style={{ flex: '1 1 360px' }}
          >
            <div style={{
              width: '100%',
              height: 280,
              background: 'linear-gradient(135deg, #1e1b18 0%, #0a0c10 100%)',
              borderRadius: 20,
              border: '1px solid rgba(217, 119, 6, 0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 0 100px rgba(217, 119, 6, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Fallback visual if no image */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'url(https://www.transparenttextures.com/patterns/aged-paper.png)' }} />
              <div style={{ textAlign: 'center', color: 'rgba(217, 119, 6, 0.5)' }}>
                 <FiBook style={{ fontSize: '3rem', marginBottom: 12, margin: '0 auto' }} />
                 <div style={{ fontSize: '1.05rem', fontFamily: 'serif', fontStyle: 'italic' }}>My Passport</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ flex: '1 1 360px' }}
          >
            <h2 className="hp-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', marginBottom: 16, lineHeight: 1.1 }}>
              Every journey deserves <br/>
              <span className="hp-accent">to be remembered.</span>
            </h2>
            
            <p className="hp-subtitle" style={{ fontSize: '0.95rem', marginBottom: 24, maxWidth: 440 }}>
              Your trips become a personal passport filled with memories, moments and stories. Keep all your journeys beautifully in one place.
            </p>

            <Link 
              to={isAuthenticated ? "/passport" : "/register"} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              Explore My Passport →
            </Link>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 12,
              marginTop: 32
            }}>
              {PASSPORT_STATS.map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(20, 24, 32, 0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#d97706', fontSize: '1.2rem', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <stat.icon />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 2 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
