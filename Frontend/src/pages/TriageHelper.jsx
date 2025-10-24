import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";
import { useVoice } from "../hooks/useVoice";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import removeMd from "remove-markdown";

const fetchAIResponse = async (input) => {
  try {
    const res = await fetch("https://noisy-dolphin-94.ral151.deno.net", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.reply || "Sorry, I couldn't understand that.";
  } catch (err) {
    console.error("AI fetch error:", err);
    return "There was an error connecting to the AI service.";
  }
};

const languageOptions = {
  en: { label: "English", recognitionLang: "en-US", synthesisLang: "en-US" },
  zhCN: {
    label: "普通话",
    recognitionLang: "zh-CN",
    synthesisLang: "zh-CN",
  },
  zhHK: {
    label: "粤语",
    recognitionLang: "yue-Hant-HK",
    synthesisLang: "zh-HK",
  },
};

const Message = React.memo(({ msg }) => (
  <div className={`mb-3 ${msg.from === "bot" ? "text-green-700" : "text-gray-800"}`}>
    <strong>{msg.from === "bot" ? "Bot:" : "You:"} </strong>
    {msg.from === "bot" ? (
      <ReactMarkdown>{msg.text}</ReactMarkdown>
    ) : (
      msg.text
    )}
  </div>
));

Message.displayName = 'Message';

export default function TriageHelper() {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState("en");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi, please describe your symptoms or say hello to start.",
    },
  ]);
  const [userId, setUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const mapI18nToLangKey = useCallback((lang) => {
    if (lang === "zh-CN") return "zhCN";
    if (lang === "zh-HK") return "zhHK";
    return "en";
  }, []);

  const { recognitionLang, synthesisLang } = languageOptions[selectedLang];

  // Simple voice state management
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser");
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = recognitionLang;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log("Speech recognition result received");
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      console.log("Interim:", interimTranscript);
      console.log("Final:", finalTranscript);

      // Show interim results in real-time
      if (interimTranscript) {
        setVoiceTranscript(interimTranscript);
      }

      // When we have final results, update the transcript
      if (finalTranscript) {
        setVoiceTranscript(finalTranscript);
        console.log("Final voice input:", finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone permissions and try again.");
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    return recognition;
  }, [recognitionLang]);

  // Start listening
  const startListening = useCallback(() => {
    if (isListening) return;

    console.log("Starting voice recognition...");
    setVoiceTranscript(""); // Clear previous transcript

    const recognition = initializeSpeechRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  }, [isListening, initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log("Stopping voice recognition...");
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, [isListening]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize language from i18n
  useEffect(() => {
    const defaultLang = mapI18nToLangKey(i18n.language);
    setSelectedLang(defaultLang);
  }, [i18n.language, mapI18nToLangKey]);

  // Fetch user on component mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Save message to database
  const saveMessage = useCallback(async (text, sender) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("chatbot_history").insert([
        {
          user_id: userId,
          message: text,
          sender: sender,
          timestamp: new Date(),
        },
      ]);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to save message", error);
    }
  }, [userId]);

  // Handle user input and AI response
  const handleUserInput = useCallback(async (text) => {
    const trimmed = text.trim();
    
    if (!trimmed || trimmed.length > 1000) {
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Add user message
      const userMessage = { from: "user", text: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      await saveMessage(trimmed, "user");

      // Get AI response
      const aiReply = await fetchAIResponse(trimmed);
      
      // Add bot message after a short delay for better UX
      setTimeout(async () => {
        const botMessage = { from: "bot", text: aiReply };
        setMessages((prev) => [...prev, botMessage]);

        // Clean Markdown before speaking
        const cleanReply = removeMd(aiReply);
        
        // Use simple speech synthesis
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(cleanReply);
          utterance.lang = synthesisLang;
          window.speechSynthesis.speak(utterance);
        }

        await saveMessage(aiReply, "bot");
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      console.error("Error in chat flow:", error);
      const errorMessage = { 
        from: "bot", 
        text: "Sorry, I encountered an error. Please try again." 
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  }, [saveMessage, isProcessing, synthesisLang]);

  // Handle manual send
  const handleSend = useCallback(() => {
    if (input.trim() && !isProcessing) {
      handleUserInput(input);
      setInput("");
    }
  }, [input, handleUserInput, isProcessing]);

  // Handle voice input submission
  const handleVoiceSubmit = useCallback(() => {
    if (voiceTranscript.trim() && !isProcessing) {
      console.log("Submitting voice input:", voiceTranscript);
      handleUserInput(voiceTranscript);
      setVoiceTranscript("");
      stopListening();
    }
  }, [voiceTranscript, handleUserInput, isProcessing, stopListening]);

  // Toggle voice mode
  const toggleVoiceMode = useCallback(() => {
    if (!isListening) {
      // Start listening
      startListening();
    } else {
      // Stop listening and submit if we have text
      if (voiceTranscript.trim()) {
        handleVoiceSubmit();
      } else {
        stopListening();
        setVoiceTranscript("");
      }
    }
  }, [isListening, voiceTranscript, startListening, stopListening, handleVoiceSubmit]);

  // Stop speech playback
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Handle Enter key press
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Check browser support
  const isSpeechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[70vh] flex flex-col">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
        Triage Helper Chatbot
      </h2>

      

      {/* Voice controls */}
      <div className="mb-3 flex flex-wrap gap-2">
        {!isSpeechSupported ? (
          <div className="w-full p-2 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ Voice input is not supported in your browser. Please use Chrome or Edge.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={toggleVoiceMode}
              disabled={isProcessing}
              className={`px-4 py-2 rounded w-full sm:w-auto transition-colors ${
                isListening 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-pressed={isListening}
              aria-label={isListening ? "Submit voice input" : "Start voice input"}
            >
              {isListening ? "Submit Voice Input" : "Start Voice Input"}
            </button>

            {isListening && (
              <button
                onClick={stopListening}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto transition-colors"
                aria-label="Cancel voice input"
              >
                Cancel
              </button>
            )}
          </>
        )}

        <button
          onClick={stopSpeaking}
          disabled={!window.speechSynthesis?.speaking}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Stop voice playback"
        >
          Stop Voice Playback
        </button>

        {isListening && (
          <div className="w-full">
            <p className="text-sm text-green-600 font-medium animate-pulse">
              🎤 Listening... Speak now
            </p>
            {voiceTranscript && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 font-medium">Voice input:</p>
                <p className="text-lg text-gray-800 mt-1">"{voiceTranscript}"</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click "Submit Voice Input" to send this message
                </p>
              </div>
            )}
          </div>
        )}
        
        {isProcessing && (
          <p className="w-full text-sm text-blue-600 font-medium">
            ⏳ Processing your message...
          </p>
        )}
      </div>

      {/* Chat window */}
      <div
        className="flex-grow border rounded-lg p-4 overflow-y-auto mb-4 h-72 sm:h-96 bg-white shadow-inner"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-atomic="false"
        tabIndex={0}
      >
        {messages.map((msg, i) => (
          <Message key={`${msg.from}-${i}-${msg.text.slice(0, 10)}`} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
        
        {messages.length === 1 && (
          <div className="text-gray-500 text-sm italic mt-4">
            Tip: You can type your symptoms or use voice input for convenience.
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isProcessing ? "Processing..." : "Type your symptoms..."}
          className="flex-grow border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          disabled={isProcessing}
          aria-label="User symptom input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send symptom message"
        >
          {isProcessing ? "Sending..." : "Send"}
        </button>
      </div>

      {/* debug */}
      {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <p>Speech Support: {isSpeechSupported ? "Yes" : "No"} | Listening: {isListening ? "Yes" : "No"} | Processing: {isProcessing ? "Yes" : "No"}</p>
        <p>Current Voice Input: "{voiceTranscript}"</p>
        <p>Browser: {navigator.userAgent}</p>
      </div> */}
    </div>
  );
}