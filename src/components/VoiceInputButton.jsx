import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VOICE_LANGUAGES } from '../lib/voiceConstants';

export default function VoiceInputButton({ onTranscript, mode = 'replace', className = '' }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const handleResult = useCallback((text, isFinal) => {
    if (isFinal && onTranscript) {
      onTranscript(text);
    }
  }, [onTranscript]);

  const {
    isListening,
    isSupported,
    toggle,
    cycleLang,
    error,
    errorMessage,
    lang,
  } = useVoiceInput({ onResult: handleResult });

  // Show error briefly then clear
  useEffect(() => {
    if (errorMessage) {
      setErrorMsg(errorMessage);
      const t = setTimeout(() => setErrorMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [error, errorMessage]);

  // Long-press to toggle language (mobile)
  const handlePointerDown = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      const next = cycleLang();
      setErrorMsg(`Voice: ${next.name}`);
      setTimeout(() => setErrorMsg(null), 2000);
    }, 500);
  }, [cycleLang]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    if (!isLongPress.current) {
      toggle();
    }
  }, [toggle]);

  const handlePointerLeave = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  // Shift+click for language toggle on desktop
  const handleClick = useCallback((e) => {
    if (e.shiftKey) {
      e.preventDefault();
      const next = cycleLang();
      setErrorMsg(`Voice: ${next.name}`);
      setTimeout(() => setErrorMsg(null), 2000);
    }
    // Regular click handled by pointerUp
  }, [cycleLang]);

  if (!isSupported) return null;

  const langLabel = VOICE_LANGUAGES.find((l) => l.code === lang)?.label || 'HE';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        aria-pressed={isListening}
        className={`relative flex items-center justify-center rounded-lg border transition min-w-[38px] min-h-[38px] p-2 select-none touch-none ${
          isListening
            ? 'border-red-500/50 text-red-400 bg-red-500/10 voice-recording'
            : error
              ? 'border-red-500/50 text-red-400'
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        {error && !isListening ? <MicOff size={18} /> : <Mic size={18} className={isListening ? 'animate-pulse' : ''} />}
        {isListening && (
          <span className="absolute -top-1.5 -end-1.5 text-[9px] font-bold bg-red-500 text-white rounded px-0.5 leading-tight">
            {langLabel}
          </span>
        )}
      </button>

      {errorMsg && (
        <span className="absolute top-full mt-1 start-0 text-[10px] text-red-400 whitespace-nowrap z-10">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
