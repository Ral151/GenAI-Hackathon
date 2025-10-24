import { useState, useRef, useCallback } from "react";

export function useVoice({
  recognitionLang = "en-US",
  synthesisLang = "en-US",
  interimResults = true,
  onRecognizedText,
} = {}) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const isManualStopRef = useRef(false);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported by your browser.");
      return;
    }

    // Clean up any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Change to false for better control

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
      isManualStopRef.current = false;
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      
      // Auto-restart only if not manually stopped and not speaking
      if (!isManualStopRef.current && !isSpeaking && recognitionRef.current) {
        console.log("Auto-restarting speech recognition");
        setTimeout(() => {
          if (recognitionRef.current && !isManualStopRef.current) {
            recognitionRef.current.start();
          }
        }, 100);
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      // Update interim results for real-time feedback
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      // Process final results
      if (finalTranscript) {
        console.log("Final recognized text:", finalTranscript);
        setTranscript(finalTranscript);
        if (onRecognizedText) {
          onRecognizedText(finalTranscript);
        }
        
        // Auto-stop after final result to prevent continuous listening during processing
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      isManualStopRef.current = true;
      
      // Don't auto-restart on error
      if (recognitionRef.current) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [recognitionLang, interimResults, onRecognizedText, isSpeaking]);

  const stopListening = useCallback(() => {
    console.log("Manually stopping speech recognition");
    isManualStopRef.current = true;
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis not supported by your browser.");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = synthesisLang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      console.log("Started speaking:", text);
      setIsSpeaking(true);
      
      // Pause recognition while speaking
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };

    utterance.onend = () => {
      console.log("Finished speaking");
      setIsSpeaking(false);
      
      // Resume recognition after speaking if it was active
      if (!recognitionRef.current && !isManualStopRef.current) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [synthesisLang, isListening, startListening]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    transcript,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    clearTranscript,
    stopSpeaking
  };
}