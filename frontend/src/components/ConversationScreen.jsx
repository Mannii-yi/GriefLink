import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import CrisisBanner from './CrisisBanner';
import WaveformVisualizer from './WaveformVisualizer';

const API_BASE = 'http://localhost:5000';
const BACKEND = API_BASE;

function extractTranscript(data) {
  if (!data || typeof data !== 'object') return '';
  const t =
    data.text ??
    data.transcript ??
    data.transcription ??
    data.transcribed_text;
  return typeof t === 'string' ? t.trim() : '';
}

function extractRespond(data) {
  if (!data || typeof data !== 'object') {
    return { text: '', isCrisis: false };
  }
  const text =
    data.response ??
    data.reply ??
    data.message ??
    data.content ??
    '';
  const crisis = Boolean(
    data.isCrisis ?? data.crisis ?? data.is_crisis ?? false,
  );
  return { text: String(text), isCrisis: crisis };
}

async function playAudioBlob(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const audio = new Audio(url);
    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = () => reject(new Error('audio playback failed'));
      audio.play().catch(reject);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function speakBrowser(text, language) {
  return new Promise((resolve, reject) => {
    if (!text || !window.speechSynthesis) {
      resolve();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error('speech synthesis failed'));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

export default function ConversationScreen({ language = 'en', onEnd }) {
  const lang = language === 'hi' ? 'hi' : 'en';
  const affirmations = useMemo(
    () => [
      'Your feelings are valid.',
      'You are not alone in this.',
      'It is okay to not be okay.',
      'Take all the time you need.',
    ],
    [],
  );

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastResponse, setLastResponse] = useState('');
  const [lastUserText, setLastUserText] = useState('');
  const [isCrisis, setIsCrisis] = useState(false);
  const [status, setStatus] = useState('Tap the mic to speak');
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [stars, setStars] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const busyRef = useRef(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      window.speechSynthesis?.cancel();
    };
  }, [stopStream]);

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
      setAffirmationIndex((v) => (v + 1) % affirmations.length);
    }, 8000);
    return () => clearInterval(t);
  }, [affirmations.length]);

  const runPipeline = useCallback(
    async (audioBlob) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setIsProcessing(true);
      setStatus('Sending your voice...');

      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', lang);

        const transcribeRes = await axios.post(
          `${API_BASE}/transcribe`,
          formData,
        );

        const userText = extractTranscript(transcribeRes.data);
        if (!userText) {
          setStatus('Could not hear that. Try again.');
          return;
        }

        setLastUserText(userText);
        setStatus('Thinking...');

        const messages = [...history, { role: 'user', content: userText }];
        const text = userText;
        const respondRes = await axios.post(`${BACKEND}/respond`, {
          message: text,
          history: history,
          language: language,
        });

        const { text: assistantText, isCrisis: crisisFlag } = extractRespond(
          respondRes.data,
        );

        const nextHistory = [
          ...messages,
          { role: 'assistant', content: assistantText },
        ];
        setHistory(nextHistory);
        setLastResponse(assistantText);
        setIsCrisis(crisisFlag);
        setIsProcessing(false);
        setStatus('');

        setIsSpeaking(true);
        try {
          const synthRes = await axios.post(
            `${API_BASE}/synthesize`,
            { text: assistantText, language: lang },
            { responseType: 'blob' },
          );
          const blob = synthRes.data;
          if (!blob || blob.size === 0) {
            throw new Error('empty audio');
          }
          const type = blob.type || '';
          if (type.includes('json') || type.includes('text')) {
            throw new Error('not audio');
          }
          await playAudioBlob(blob);
        } catch {
          setStatus('Playing with built-in voice...');
          try {
            await speakBrowser(assistantText, lang);
          } catch {
            setStatus('Could not play audio. Read the reply above.');
          }
        } finally {
          setIsSpeaking(false);
          setStatus('Tap the mic to speak');
        }
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && err.response?.data
            ? 'Something went wrong. Check the server.'
            : 'Could not reach the server. Is it running?';
        setStatus(msg);
        setIsProcessing(false);
      } finally {
        busyRef.current = false;
      }
    },
    [history, lang],
  );

  const stopRecordingAndSend = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') {
      rec.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isProcessing || isSpeaking) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopStream();
        mediaRecorderRef.current = null;
        setIsListening(false);
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        chunksRef.current = [];
        if (blob.size > 0) {
          runPipeline(blob);
        } else {
          setStatus('No audio captured. Tap the mic to speak');
        }
      };

      recorder.start();
      setIsListening(true);
      setStatus('Listening... Tap again to send');
    } catch {
      setStatus('Microphone access denied or unavailable.');
      setIsListening(false);
    }
  }, [isProcessing, isSpeaking, runPipeline, stopStream]);

  const onMicClick = useCallback(() => {
    if (isProcessing || isSpeaking) return;
    if (isListening) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  }, [
    isListening,
    isProcessing,
    isSpeaking,
    startRecording,
    stopRecordingAndSend,
  ]);

  const screenStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: isCrisis ? '140px 20px 32px' : '24px 20px 32px',
    boxSizing: 'border-box',
    background: '#0c0712',
    color: '#e9e4f0',
    position: 'relative',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 300,
    letterSpacing: '0.06em',
    margin: '0 0 8px 0',
    background: 'linear-gradient(90deg, #c4b5fd, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const flexCenterStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
  };

  const cardStyle = {
    width: '100%',
    maxWidth: 480,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    background: 'rgba(91, 33, 182, 0.12)',
    border: '1px solid rgba(167, 139, 250, 0.35)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
  };

  const statusStyle = {
    marginTop: 16,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    minHeight: 22,
  };

  const micRecording = isListening;
  const micDisabled = isProcessing || isSpeaking;
  const micIdle = !micRecording && !micDisabled;
  const micStyle = {
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: 'none',
    cursor: micDisabled ? 'not-allowed' : 'pointer',
    opacity: micDisabled ? 0.55 : 1,
    background: micRecording
      ? 'linear-gradient(145deg, #dc2626, #b91c1c)'
      : 'linear-gradient(145deg, #7c3aed, #5b21b6)',
    boxShadow: micRecording
      ? '0 0 28px rgba(220, 38, 38, 0.55)'
      : '0 0 28px rgba(124, 58, 237, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="conversation-screen" style={screenStyle}>
      <motion.button
        type="button"
        onClick={() => onEnd?.()}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          zIndex: 3,
          padding: '8px 12px',
          fontSize: 12,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.10)',
          background: 'rgba(255, 255, 255, 0.04)',
          color: 'rgba(255, 255, 255, 0.55)',
          cursor: 'pointer',
          outline: 'none',
          backdropFilter: 'blur(6px)',
        }}
        whileHover={{ scale: 1.02, background: 'rgba(124, 58, 237, 0.10)', borderColor: 'rgba(124, 58, 237, 0.35)' }}
        whileTap={{ scale: 0.98 }}
        aria-label="End Session"
      >
        End Session
      </motion.button>

      {/* Background: soft gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 520px at 50% 0%, rgba(124, 58, 237, 0.16) 0%, rgba(12, 7, 18, 0) 62%), radial-gradient(900px 520px at 18% 78%, rgba(167, 139, 250, 0.08) 0%, rgba(12, 7, 18, 0) 62%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Background: twinkling stars */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
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
              boxShadow: `0 0 ${Math.max(6, s.size * 8)}px rgba(255, 255, 255, 0.22)`,
              opacity: s.opacity,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.12, s.opacity, 0.18, s.opacity] }}
            transition={{
              duration: s.twinkleDuration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {isCrisis && (
        <CrisisBanner onDismiss={() => setIsCrisis(false)} />
      )}

      <motion.header
        className="conversation-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <h1 className="conversation-title" style={titleStyle}>
          GriefLink
        </h1>
      </motion.header>

      <div
        className="conversation-wave-wrap"
        style={{ ...flexCenterStyle, position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <WaveformVisualizer isListening={isListening} isSpeaking={isSpeaking} />
        </motion.div>
      </div>

      <motion.div
        className="conversation-card"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.12, duration: 0.6, ease: 'easeOut' }}
        style={cardStyle}
      >
        <p
          className="conversation-last-user"
          style={{
            margin: '0 0 12px 0',
            fontStyle: 'italic',
            color: '#d8bdf9',
            fontSize: 15,
            lineHeight: 1.5,
            minHeight: 22,
          }}
        >
          {lastUserText || ' '}
        </p>
        <p
          className="conversation-last-assistant"
          style={{
            margin: 0,
            color: '#f3e8ff',
            fontSize: 15,
            lineHeight: 1.55,
            minHeight: 22,
          }}
        >
          {lastResponse || ' '}
        </p>
      </motion.div>

      <p className="conversation-status" style={{ ...statusStyle, position: 'relative', zIndex: 1 }}>
        {status}
      </p>

      <div
        style={{
          marginTop: 18,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Floating affirmation */}
        <div style={{ minHeight: 22, display: 'flex', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={affirmationIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                margin: 0,
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.62)',
                letterSpacing: 0.2,
              }}
            >
              {affirmations[affirmationIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Mic button with idle pulsing ring */}
        <div style={{ position: 'relative', width: 92, height: 92 }}>
          {micIdle && (
            <motion.div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                border: '1px solid rgba(124, 58, 237, 0.35)',
                boxShadow: '0 0 34px rgba(124, 58, 237, 0.16)',
              }}
              initial={{ opacity: 0.0, scale: 0.9 }}
              animate={{ opacity: [0.0, 0.55, 0.0], scale: [0.92, 1.12, 1.24] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <motion.button
            type="button"
            className="conversation-mic"
            style={{
              ...micStyle,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            disabled={micDisabled}
            onClick={onMicClick}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
            whileHover={micDisabled ? {} : { scale: 1.05 }}
            whileTap={micDisabled ? {} : { scale: 0.95 }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
