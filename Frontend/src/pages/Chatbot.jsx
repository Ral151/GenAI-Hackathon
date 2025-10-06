import { useState } from "react";

const mockResponses = {
  "hello": "Hello! How can I assist you today?",
  "symptoms": "Please describe your symptoms.",
};

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    setMessages([...messages, { from: "user", text: input }]);
    const reply = mockResponses[input.toLowerCase()] || "Sorry, I don't understand.";
    setMessages([...messages, { from: "user", text: input }, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto py-8 min-h-[70vh] flex flex-col">
      <h2 className="text-2xl font-bold mb-6">AI Chatbot</h2>
      <div className="border mb-4 p-4 rounded-lg overflow-y-auto flex-grow" style={{ minHeight: 260 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.from === "bot" ? 'text-blue-600' : 'text-gray-800'}`}>
            <strong>{msg.from === "bot" ? "Bot: " : "You: "}</strong>{msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border rounded px-3 py-2 w-full mr-2"
          placeholder="Type message..."
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
