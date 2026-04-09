import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSpeechRecognition,
  isSpeechRecognitionSupported,
  getStoredLang,
  setStoredLang,
  VOICE_ERRORS,
  VOICE_LANGUAGES,
} from '../lib/voiceConstants';

export function useVoiceInput({ onResult, continuous = false, interimResults = true } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [lang, setLangState] = useState(getStoredLang);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const timeoutRef = useRef(null);

  // Keep callback ref fresh without re-creating recognition
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  const isSupported = isSpeechRecognitionSupported();

  // Create recognition instance once
  useEffect(() => {
    if (!isSupported) return;

    const SR = getSpeechRecognition();
    const recognition = new SR();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        setTranscript(final);
        onResultRef.current?.(final, true);
      } else if (interim) {
        setTranscript(interim);
        onResultRef.current?.(interim, false);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return; // user-initiated stop
      setError(event.error);
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
      clearTimeout(timeoutRef.current);
    };
  }, [isSupported, continuous, interimResults]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync lang changes to the recognition instance
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);

      // Safety timeout for non-continuous mode (15s)
      if (!continuous) {
        timeoutRef.current = setTimeout(() => {
          try { recognitionRef.current?.stop(); } catch {}
        }, 15000);
      }
    } catch {
      // Already started or other error
      setError('audio-capture');
    }
  }, [isListening, continuous]);

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current);
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  const setLang = useCallback((newLang) => {
    const wasListening = isListening;
    if (wasListening) {
      try { recognitionRef.current?.stop(); } catch {}
    }
    setLangState(newLang);
    setStoredLang(newLang);
  }, [isListening]);

  const cycleLang = useCallback(() => {
    const idx = VOICE_LANGUAGES.findIndex((l) => l.code === lang);
    const next = VOICE_LANGUAGES[(idx + 1) % VOICE_LANGUAGES.length];
    setLang(next.code);
    return next;
  }, [lang, setLang]);

  const errorMessage = error ? (VOICE_ERRORS[error] || 'Voice input error.') : null;

  return {
    isListening,
    isSupported,
    transcript,
    start,
    stop,
    toggle,
    error,
    errorMessage,
    lang,
    setLang,
    cycleLang,
  };
}
