import { useState, useRef } from "react";

export function useVoice({
  recognitionLang = "en-US",
  synthesisLang = "en-US",
  interimResults = false,
} = {}) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = recognitionLang;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      setTranscript(event.results[0][0].transcript);
    };
    recognition.onerror = (e) => {
      console.error("Speech recognition error", e);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech Synthesis not supported by your browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = synthesisLang;
    window.speechSynthesis.speak(utterance);
  };

  return { transcript, isListening, startListening, stopListening, speak };
}
