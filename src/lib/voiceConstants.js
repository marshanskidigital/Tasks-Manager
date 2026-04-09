export const VOICE_LANGUAGES = [
  { code: 'he-IL', label: 'HE', name: 'עברית' },
  { code: 'en-US', label: 'EN', name: 'English' },
];

export const DEFAULT_VOICE_LANG = 'he-IL';
export const VOICE_LANG_STORAGE_KEY = 'voiceInputLang';

export function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognition();
}

export function getStoredLang() {
  return localStorage.getItem(VOICE_LANG_STORAGE_KEY) || DEFAULT_VOICE_LANG;
}

export function setStoredLang(lang) {
  localStorage.setItem(VOICE_LANG_STORAGE_KEY, lang);
}

export const VOICE_ERRORS = {
  'not-allowed': 'Microphone access denied. Enable it in browser settings.',
  'no-speech': 'No speech detected. Try again.',
  'audio-capture': 'Could not access microphone.',
  'network': 'Voice input requires an internet connection.',
  'service-not-allowed': 'Speech recognition service is not available.',
};
