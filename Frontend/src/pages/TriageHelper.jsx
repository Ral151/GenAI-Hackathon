import React, { useState, useEffect } from "react";
import { useVoice } from "../hooks/useVoice";
import { useTranslation } from "react-i18next";

const mockAIResponse = (input) => {
  if (input.toLowerCase().includes("chest pain")) {
    return "Your symptom suggests urgent care. Please see cardiology or emergency.";
  } else if (input.toLowerCase().includes("cough")) {
    return "Seems like a common symptom. Consider visiting a general practitioner.";
  }
  return "Thank you for describing your symptoms. Please wait for medical assessment.";
};

function getLangCodes(i18nLang) {
  switch(i18nLang) {
    case "zh-CN":
      return { recognitionLang: "zh-CN", synthesisLang: "zh-CN" }; // Mandarin
    case "zh-HK":
      return { recognitionLang: "yue-Hant-HK", synthesisLang: "zh-HK" }; // Cantonese, use zh-HK for synthesis (more widely supported)
    case "en":
    case "en-US":
    default:
      return { recognitionLang: "en-US", synthesisLang: "en-US" };
  }
}

export default function TriageHelper() {
  const { i18n } = useTranslation();
  const { recognitionLang, synthesisLang } = getLangCodes(i18n.language);

  const { transcript, isListening, startListening, stopListening, speak } = useVoice({
    recognitionLang,
    synthesisLang,
  });

  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, please describe your symptoms or say hello to start." },
  ]);
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);

  const handleUserInput = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    const aiReply = mockAIResponse(trimmed);

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: aiReply }]);
      speak(aiReply);
    }, 1000);
  };

  const handleSend = () => {
    handleUserInput(input);
    setInput("");
  };

  useEffect(() => {
    if (transcript && voiceMode) {
      handleUserInput(transcript);
    }
  }, [transcript, voiceMode]);

  const toggleVoiceMode = () => {
    if (!voiceMode) {
      startListening();
      setVoiceMode(true);
    } else {
      stopListening();
      setVoiceMode(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 min-h-[70vh] flex flex-col">
      <h2 className="text-3xl font-semibold mb-6">Triage Helper Chatbot</h2>
      <div className="mb-3">
        <button
          onClick={toggleVoiceMode}
          className={`px-4 py-2 rounded ${
            voiceMode ? "bg-green-600 text-white" : "bg-gray-300"
          }`}
          aria-pressed={voiceMode}
          aria-label={voiceMode ? "Stop voice input" : "Start voice input"}
        >
          {voiceMode ? "Stop Voice" : "Start Voice"}
        </button>
        {isListening && <p>Listening...</p>}
      </div>
      <div
        className="flex-grow border rounded-lg p-4 overflow-y-auto mb-4 h-72"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 ${msg.from === "bot" ? "text-green-700" : "text-gray-800"}`}
            tabIndex={0}
            aria-label={`${msg.from === "bot" ? "Bot" : "User"} said: ${msg.text}`}
          >
            <strong>{msg.from === "bot" ? "Bot:" : "You:"} </strong>
            {msg.text}
          </div>
        ))}
      </div>
      {!voiceMode && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your symptoms..."
            className="flex-grow border rounded px-3 py-2"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            aria-label="User symptom input"
          />
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            aria-label="Send symptom message"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
