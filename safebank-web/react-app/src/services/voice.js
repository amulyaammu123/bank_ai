// Voice & Speech Synthesis Service for SafeBank AI Portal
// Provides Text-to-Speech (TTS) and Speech Recognition (STT) across all languages (EN, TEL, HIN, TAM)

const LANG_LOCALE_MAP = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN'
};

const LANG_NAMES = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil'
};

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.activeUtterance = null;
    this.voices = [];
    this.recognition = null;

    if (typeof window !== 'undefined') {
      // Load voices asynchronously
      if (this.synth) {
        this.updateVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.updateVoices();
        }
      }
    }
  }

  updateVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getBestVoice(langCode) {
    if (!this.voices || this.voices.length === 0) {
      this.updateVoices();
    }
    const targetLocale = LANG_LOCALE_MAP[langCode] || 'en-IN';
    const baseLang = targetLocale.split('-')[0];

    // 1. Exact locale match (e.g. te-IN)
    let found = this.voices.find(v => v.lang && v.lang.toLowerCase() === targetLocale.toLowerCase());
    // 2. Base language match (e.g. te)
    if (!found) {
      found = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith(baseLang));
    }
    // 3. Fallback to English India or default voice
    if (!found) {
      found = this.voices.find(v => v.lang && v.lang.toLowerCase().includes('en-in'));
    }
    return found || null;
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  speak(text, langCode = 'en', onEndCallback = null) {
    if (!this.synth) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    if (!text || typeof text !== 'string') return;

    // Clean text of markdown, icons, special symbols before speaking
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Stop current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = this.getBestVoice(langCode);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = LANG_LOCALE_MAP[langCode] || 'en-IN';
    utterance.rate = 0.95; // Slightly relaxed pace for maximum accessibility
    utterance.pitch = 1.0;

    if (onEndCallback) {
      utterance.onend = () => onEndCallback();
      utterance.onerror = () => onEndCallback();
    }

    this.activeUtterance = utterance;
    this.synth.speak(utterance);
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  // Web Speech Recognition for Voice Input & Commands
  createRecognition(langCode = 'en') {
    const SpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_LOCALE_MAP[langCode] || 'en-IN';
    return recognition;
  }

  startListening(langCode, onTranscript, onError, onEnd) {
    const rec = this.createRecognition(langCode);
    if (!rec) {
      if (onError) onError("Speech Recognition not supported in this browser. Please use Google Chrome or Edge.");
      return null;
    }

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
    };

    rec.onerror = (event) => {
      console.warn("Voice Recognition error:", event.error);
      if (onError) onError(`Voice error: ${event.error}`);
    };

    rec.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      rec.start();
      return rec;
    } catch (e) {
      console.error(e);
      if (onError) onError("Failed to start microphone listener");
      return null;
    }
  }
}

export const voiceService = new VoiceService();
