import { motion } from 'framer-motion'

export default function WaveformVisualizer({ isListening, isSpeaking }) {
  const bars = 32

  const getColor = () => {
    if (isListening) return '#a78bfa'
    if (isSpeaking) return '#818cf8'
    return '#374151'
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Label */}
      <motion.p
        key={isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs tracking-widest uppercase"
        style={{
          color: isListening ? '#a78bfa' : isSpeaking ? '#818cf8' : '#4b5563'
        }}
      >
        {isListening ? 'Listening...' : isSpeaking ? 'GriefLink is speaking...' : ''}
      </motion.p>

      {/* Bars */}
      <div className="flex items-center justify-center gap-1 h-16">
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{ background: getColor() }}
            animate={{
              height: (isListening || isSpeaking)
                ? [
                    6,
                    Math.random() * 45 + 8,
                    Math.random() * 20 + 6,
                    Math.random() * 45 + 8,
                    6
                  ]
                : 6,
              opacity: (isListening || isSpeaking) ? 1 : 0.25
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.6,
              repeat: Infinity,
              delay: i * 0.04,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </div>
  )
}