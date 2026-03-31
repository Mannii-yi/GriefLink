import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingScreen from './components/LandingScreen'
import LanguageSelect from './components/LanguageSelect'
import ConversationScreen from './components/ConversationScreen'

function EndingScreen({ onEndSession }) {
  const [stars, setStars] = useState([])

  useEffect(() => {
    const STAR_COUNT = 30
    const next = Array.from({ length: STAR_COUNT }, (_, i) => {
      const size = Math.random() * 2.0 + 1.0
      const delay = Math.random() * 4.0
      const duration = Math.random() * 2.8 + 1.6
      const opacity = Math.random() * 0.45 + 0.25
      return {
        id: `end_star_${i}_${Math.random().toString(16).slice(2)}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size,
        delay,
        duration,
        opacity,
      }
    })
    setStars(next)
  }, [])

  const orb = useMemo(
    () => (
      <div style={{ position: 'relative', width: 120, height: 78, marginTop: 8 }}>
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 88,
            height: 88,
            borderRadius: 999,
            background:
              'radial-gradient(circle at 35% 35%, rgba(167, 139, 250, 0.6), rgba(124, 58, 237, 0.14) 58%, rgba(124, 58, 237, 0) 74%)',
            filter: 'blur(14px)',
            opacity: 0.95,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 34,
            height: 34,
            borderRadius: 999,
            background:
              'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.92), rgba(167, 139, 250, 0.65) 45%, rgba(124, 58, 237, 0.55) 75%)',
            boxShadow: '0 0 18px rgba(124, 58, 237, 0.35)',
            opacity: 0.98,
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    ),
    [],
  )

  return (
    <motion.div
      key="ending"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        minHeight: '100vh',
        background: '#0f0f1a',
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

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 520px at 50% 10%, rgba(124, 58, 237, 0.18) 0%, rgba(15, 15, 26, 0) 60%), radial-gradient(800px 520px at 20% 80%, rgba(167, 139, 250, 0.10) 0%, rgba(15, 15, 26, 0) 62%)',
          pointerEvents: 'none',
        }}
      />

      {/* Twinkling stars */}
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
              boxShadow: `0 0 ${Math.max(6, s.size * 8)}px rgba(255, 255, 255, 0.22)`,
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 620 }}>
        {orb}

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              border: '1px solid rgba(124, 58, 237, 0.35)',
              background: 'rgba(124, 58, 237, 0.12)',
              boxShadow: '0 0 28px rgba(124, 58, 237, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Soft heart icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 21s-7-4.534-9.5-8.5C.5 9 .7 5.8 3.6 4.6c2.1-.9 4.3-.2 5.7 1.6C10.7 4.4 12.9 3.7 15 4.6c2.9 1.2 3.1 4.4 1.1 7.9C19 16.466 12 21 12 21Z"
                stroke="rgba(167, 139, 250, 0.95)"
                strokeWidth="1.6"
                fill="rgba(124, 58, 237, 0.25)"
              />
            </svg>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
          style={{
            marginTop: 14,
            marginBottom: 10,
            fontSize: 44,
            fontWeight: 300,
            letterSpacing: 0.2,
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 0 28px rgba(124, 58, 237, 0.12)',
          }}
        >
          You were heard.
        </motion.h1>

        <div
          style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.68)',
            marginBottom: 18,
          }}
        >
          Thank you for trusting GriefLink tonight.
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45, ease: 'easeOut' }}
          style={{
            margin: 0,
            fontStyle: 'italic',
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.58)',
            lineHeight: 1.6,
          }}
        >
          &quot;Healing takes time. Be gentle with yourself.&quot;
        </motion.p>

        <motion.button
          type="button"
          onClick={onEndSession}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: 'easeOut' }}
          style={{
            marginTop: 24,
            padding: '12px 22px',
            borderRadius: 999,
            border: '1px solid rgba(255, 255, 255, 0.10)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.62)',
            cursor: 'pointer',
            boxShadow: '0 0 26px rgba(124, 58, 237, 0.10)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          End Session
        </motion.button>

        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.38)',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          Your conversation was private and has not been stored.
        </div>
      </div>
    </motion.div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [language, setLanguage] = useState('en')

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
    setScreen('conversation')
  }

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingScreen onStart={() => setScreen('language')} />
          </motion.div>
        )}
        {screen === 'language' && (
          <motion.div key="language" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LanguageSelect onSelect={handleLanguageSelect} />
          </motion.div>
        )}
        {screen === 'conversation' && (
          <motion.div key="conversation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConversationScreen
              language={language}
              onEnd={() => setScreen('ending')}
            />
          </motion.div>
        )}

        {screen === 'ending' && (
          <EndingScreen
            key="ending_screen"
            onEndSession={() => {
              setScreen('landing')
              setLanguage('en')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}