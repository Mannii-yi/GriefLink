import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function LandingScreen({ onStart }) {
  const quotes = useMemo(
    () => [
      'Grief is the price we pay for love.',
      'You are allowed to grieve at your own pace.',
      'Healing is not linear — and that is okay.',
      'Your feelings are valid, always.',
    ],
    [],
  );

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const STAR_COUNT = 60;
    const next = Array.from({ length: STAR_COUNT }, (_, i) => {
      const size = Math.random() * 2.2 + 0.8; // px
      const twinkleDuration = Math.random() * 2.6 + 1.8; // s
      const delay = Math.random() * 4.0; // s
      const opacity = Math.random() * 0.55 + 0.2;
      return {
        id: `star_${i}_${Math.random().toString(16).slice(2)}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size,
        twinkleDuration,
        delay,
        opacity,
      };
    });
    setStars(next);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIndex((v) => (v + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(t);
  }, [quotes.length]);

  const accent = '#7c3aed';
  const bg = '#0f0f1a';

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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 20px',
        textAlign: 'center',
      }}
    >
      {/* Background: soft gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 520px at 50% 10%, rgba(124, 58, 237, 0.18) 0%, rgba(15, 15, 26, 0) 60%), radial-gradient(800px 520px at 20% 80%, rgba(167, 139, 250, 0.10) 0%, rgba(15, 15, 26, 0) 62%)',
          pointerEvents: 'none',
        }}
      />

      {/* Background: twinkling stars */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {stars.map((s) => (
          <motion.div
            key={s.id}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `0 0 ${Math.max(6, s.size * 8)}px rgba(255, 255, 255, 0.25)`,
              opacity: s.opacity,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, s.opacity, 0.2, s.opacity] }}
            transition={{
              duration: s.twinkleDuration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 640,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Breathing orb: glow + core */}
        <div style={{ position: 'relative', width: 220, height: 160, marginBottom: 22 }}>
          <motion.div
            style={{
              position: 'absolute',
              top: 18,
              left: '50%',
              width: 180,
              height: 180,
              borderRadius: 999,
              transform: 'translateX(-50%)',
              background: `radial-gradient(circle at 35% 35%, rgba(167, 139, 250, 0.65), rgba(124, 58, 237, 0.10) 55%, rgba(124, 58, 237, 0.0) 72%)`,
              filter: 'blur(18px)',
              opacity: 0.95,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.95, 0.65] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              top: 48,
              left: '50%',
              width: 86,
              height: 86,
              borderRadius: 999,
              transform: 'translateX(-50%)',
              background: `radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(167, 139, 250, 0.75) 42%, rgba(124, 58, 237, 0.55) 72%)`,
              boxShadow: `0 0 28px rgba(124, 58, 237, 0.45)`,
              opacity: 0.98,
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Title */}
        <motion.h1
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 200,
            letterSpacing: 6,
            lineHeight: 1.05,
            color: 'rgba(255, 255, 255, 0.96)',
          }}
        >
          GriefLink
        </motion.h1>

        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            margin: '12px 0 0 0',
            fontSize: 16,
            fontWeight: 300,
            color: 'rgba(205, 190, 255, 0.9)',
          }}
        >
          You don&apos;t have to carry this alone.
        </motion.p>

        {/* Rotating quotes */}
        <div
          style={{
            marginTop: 18,
            minHeight: 54,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                margin: 0,
                maxWidth: 520,
                fontSize: 16,
                lineHeight: 1.5,
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.80)',
                textShadow: '0 0 24px rgba(124, 58, 237, 0.12)',
              }}
            >
              {quotes[quoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

      {/* CTA Button */}
      <motion.button
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        style={{
          marginTop: 24,
          padding: '14px 28px',
          borderRadius: 999,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: `linear-gradient(135deg, ${accent}, #4f46e5)`,
          boxShadow: '0 0 34px rgba(124, 58, 237, 0.45)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: 0.3,
          cursor: 'pointer',
        }}
      >
        Start Talking
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          margin: '14px 0 0 0',
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.55)',
          letterSpacing: 0.6,
        }}
      >
        Free • Private • Always here
      </motion.p>
      </div>
    </motion.div>
  )
}