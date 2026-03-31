import os
import re
import tempfile
import traceback
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from groq import Groq

# Force load .env from same folder as app.py
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Load and verify all keys
GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()
ELEVENLABS_API_KEY = (os.getenv("ELEVENLABS_API_KEY") or "").strip()
ELEVENLABS_VOICE_ID = (os.getenv("ELEVENLABS_VOICE_ID") or "").strip()

# Debug print so you can verify in terminal
print("=== GriefLink Backend Starting ===")
print(f"GROQ_API_KEY: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'MISSING'}")
print(f"ELEVENLABS_API_KEY: {ELEVENLABS_API_KEY[:10] if ELEVENLABS_API_KEY else 'MISSING'}")
print(f"ELEVENLABS_VOICE_ID: {ELEVENLABS_VOICE_ID if ELEVENLABS_VOICE_ID else 'MISSING'}")
print("==================================")

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

app = Flask(__name__)
CORS(app)

CRISIS_KEYWORDS = [
    "kill myself", "end my life", "want to die",
    "dont want to live", "don't want to live",
    "no reason to live", "suicide", "take my life",
    "better off dead", "cant go on", "can't go on",
    "gonna end my life", "going to end my life",
    "end it all", "its over for me", "no point living",
    "marna chahta", "marna chahti", "jeena nahi",
    "zindagi khatam", "mar jaana"
]

SYSTEM_PROMPT = """
You are Priya, a warm and deeply empathetic grief companion
who speaks like a close caring friend — not a therapist or robot.

YOUR PERSONALITY:
- Warm, soft, deeply human
- You sit with the person in their pain without rushing to fix it
- You never give advice unless asked
- You always validate feelings first

HOW YOU SPEAK:
- Maximum 2-3 short sentences only
- Use gentle phrases: "I hear you...", "That sounds so heavy...",
  "Of course you feel that way..."
- Never say "I understand how you feel"
- End with ONE gentle question only, never multiple
- Never use clinical words like "grief process" or "healing journey"
- Never say "be strong" or "time heals"

CRITICAL LANGUAGE RULE:
- If user speaks English = respond in PURE ENGLISH ONLY
- If user speaks Hindi = respond in PURE HINDI using Devanagari script ONLY
- NEVER mix languages under any circumstance
- NEVER use Hinglish

HINDI STYLE:
- Pure Devanagari script only
- Warm like a caring didi
- Use "aap" always — respectful and tender

CRISIS RULE:
- NEVER refuse to talk or shut down the conversation
- Stay warm and present always
- Gently mention iCall: 9152987821 (India)
- NEVER mention US helplines
- NEVER list resources robotically
- Always stay in the conversation
"""


def normalize_text(text: str) -> str:
    if not text:
        return ""
    t = text.strip().lower()
    t = re.sub(r"\s+", " ", t)
    return t


def detect_crisis(text: str) -> bool:
    if not text:
        return False
    norm = normalize_text(text)
    for kw in CRISIS_KEYWORDS:
        if normalize_text(kw) in norm:
            return True
    return False


@app.get("/health")
def health():
    return jsonify({"status": "running", "voice_id": ELEVENLABS_VOICE_ID})


@app.post("/transcribe")
def transcribe():
    if not groq_client:
        return jsonify({"error": "Groq API not configured"}), 500

    if "audio" not in request.files:
        return jsonify({"error": "missing audio file"}), 400

    audio = request.files["audio"]
    audio_bytes = audio.read()
    if not audio_bytes:
        return jsonify({"error": "empty audio"}), 400

    lang = request.form.get("language", "en")
    tmpdir = tempfile.mkdtemp()
    temp_path = os.path.join(tmpdir, "temp_audio.webm")

    try:
        with open(temp_path, "wb") as f:
            f.write(audio_bytes)
        with open(temp_path, "rb") as f:
            transcript = groq_client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=f,
                language=lang,
            )
        text = (transcript.text or "").strip()
    except Exception as exc:
        return jsonify({"error": "transcription failed", "detail": str(exc)}), 502
    finally:
        try:
            os.unlink(temp_path)
            os.rmdir(tmpdir)
        except OSError:
            pass

    return jsonify({"text": text, "is_crisis": detect_crisis(text)})


@app.post("/respond")
def respond():
    if not groq_client:
        return jsonify({"error": "Groq API not configured"}), 500

    data = request.get_json(silent=True) or {}
    language = data.get("language", "en")
    history = data.get("history", [])
    message = str(data.get("message", "")).strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    is_crisis = detect_crisis(message)

    if language == "en":
        lang_rule = "CRITICAL: Respond in ENGLISH ONLY. No Hindi. No Hinglish. Pure English only."
    else:
        lang_rule = "CRITICAL: Respond in HINDI ONLY using Devanagari script. No English. No Hinglish."

    groq_messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + lang_rule}]

    for entry in history:
        if isinstance(entry, dict) and entry.get("role") in ("user", "assistant"):
            groq_messages.append({
                "role": entry["role"],
                "content": str(entry.get("content", ""))
            })

    groq_messages.append({"role": "user", "content": message})

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            max_tokens=150,
            temperature=0.7,
        )
        response_text = (response.choices[0].message.content or "").strip()
    except Exception as exc:
        tb = traceback.format_exc()
        print(f"Groq /respond failed: {exc!r}\n{tb}", flush=True)
        return jsonify({"error": "model request failed", "detail": str(exc)}), 502

    return jsonify({"response": response_text, "is_crisis": is_crisis})


@app.post("/synthesize")
def synthesize():
    if not ELEVENLABS_API_KEY:
        return jsonify({"error": "ElevenLabs API key missing"}), 500

    if not ELEVENLABS_VOICE_ID:
        return jsonify({"error": "ElevenLabs Voice ID missing"}), 500

    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    print(f"Synthesizing with Voice ID: {ELEVENLABS_VOICE_ID}")
    print(f"Text: {text[:60]}")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.35,
            "similarity_boost": 0.85,
            "style": 0.6,
            "use_speaker_boost": True,
        },
    }

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=120)
        print(f"ElevenLabs response status: {r.status_code}")
        if not r.ok:
            print(f"ElevenLabs error: {r.text[:300]}")
            return jsonify({
                "error": "elevenlabs request failed",
                "status": r.status_code,
                "detail": r.text[:500],
            }), r.status_code
    except Exception as exc:
        return jsonify({"error": "synthesis failed", "detail": str(exc)}), 502

    return Response(
        r.content,
        mimetype="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"},
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)