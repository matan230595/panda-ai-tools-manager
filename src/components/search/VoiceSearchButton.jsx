import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';

/**
 * כפתור חיפוש קולי המשתמש ב-Web Speech API.
 * מזהה דיבור בעברית ומעביר את הטקסט לפונקציית החיפוש.
 */
export default function VoiceSearchButton({ onResult, className = '' }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch {} };
  }, [onResult]);

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? 'עצור הקלטה' : 'חיפוש קולי'}
      className={`flex items-center justify-center rounded-full transition-all ${
        listening
          ? 'bg-red-500/20 text-red-400 border border-red-400/40 animate-pulse'
          : 'text-cyan-400 hover:bg-cyan-500/10 border border-transparent'
      } ${className}`}
    >
      {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}