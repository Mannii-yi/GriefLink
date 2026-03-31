import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LanguageSelect({ onSelect }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const STAR_COUNT = 30;
    const next = Array.from({ length: STAR_COUNT }, (_, i) => {
      const size = Math.random() * 2.0 + 1.0; // px
      const delay = Math.random() * 4.0; // s
      const duration = Math.random() * 2.6 + 1.8; // s
      const opacity = Math.random() * 0.45 + 0.25;
      return {
        id: `star_${i}_${Math.random().toString(16).slice(2)}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size,
        delay,
        duration,
        opacity,
      };
    });
    setStars(next);
  }, []);

  const bg = '#0f0f1a';
  const accent = '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        background: bg,
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 20px',
        textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(0.95); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.25); }
        }
      `}</style>

      {/* Background: subtle gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 520px at 50% 5%, rgba(124, 58, 237, 0.18) 0%, rgba(15, 15, 26, 0) 60%), radial-gradient(900px 520px at 20% 85%, rgba(167, 139, 250, 0.10) 0%, rgba(15, 15, 26, 0) 62%)',
          pointerEvents: 'none',
        }}
      />

      {/* Background: twinkling stars (CSS animation) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `0 0 ${Math.max(6, s.size * 8)}px rgba(255, 255, 255, 0.20)`,
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560 }}>
        {/* Small soft orb top */}
        <div style={{ position: 'relative', width: '100%', height: 72, marginBottom: 14 }}>
          <motion.div
            style={{
              position: 'absolute',
              top: 4,
              left: '50%',
              width: 88,
              height: 88,
              borderRadius: 999,
              transform: 'translateX(-50%)',
              background: `radial-gradient(circle at 35% 35%, rgba(167, 139, 250, 0.55), rgba(124, 58, 237, 0.14) 58%, rgba(124, 58, 237, 0.0) 74%)`,
              filter: 'blur(14px)',
              opacity: 0.95,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              top: 18,
              left: '50%',
              width: 34,
              height: 34,
              borderRadius: 999,
              transform: 'translateX(-50%)',
              background: `radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.92), rgba(167, 139, 250, 0.65) 45%, rgba(124, 58, 237, 0.55) 75%)`,
              boxShadow: `0 0 18px rgba(124, 58, 237, 0.35)`,
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

      {/* Heading */}
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            margin: 0,
            fontSize: 13,
            color: 'rgba(196, 181, 253, 0.95)',
            letterSpacing: '0.02em',
          }}
        >
          अपनी भाषा चुनें
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            margin: '6px 0 0 0',
            fontSize: 18,
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.78)',
          }}
        >
          Choose your language
        </motion.p>

      {/* Language Cards */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginTop: 22,
            flexWrap: 'wrap',
          }}
        >
          {[
            { main: 'English', value: 'en', sub: 'Speak freely' },
            { main: 'हिंदी', value: 'hi', sub: 'अपनी भाषा में बोलें' },
          ].map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.55, ease: 'easeOut' }}
              whileHover={{
                scale: 1.03,
                borderColor: accent,
                boxShadow: `0 0 0 1px rgba(124, 58, 237, 0.35), 0 0 26px rgba(124, 58, 237, 0.25)`,
                background: 'rgba(124, 58, 237, 0.10)',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(opt.value)}
              style={{
                width: 180,
                height: 156,
                borderRadius: 18,
                border: '1px solid rgba(255, 255, 255, 0.10)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: 14,
                transition: 'box-shadow 180ms ease, border-color 180ms ease, background 180ms ease',
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 300, letterSpacing: 0.2 }}>
                {opt.main}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.55)' }}>
                {opt.sub}
              </span>
            </motion.button>
          ))}
        </div>

      {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            margin: '26px 0 0 0',
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.32)',
            fontStyle: 'italic',
          }}
        >
          GriefLink samjhega
        </motion.p>
      </div>
    </motion.div>
  )
}
        