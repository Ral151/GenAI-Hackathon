import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ChatbotHistory() {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchChatHistory() {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) {
        setLoading(false);
        return;
      }

      const userId = user.user.id;

      const { data, error } = await supabase
        .from("chatbot_history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: true });

      if (error) {
        alert("Error loading chat history: " + error.message);
      } else {
        setChatHistory(data);
      }
      setLoading(false);
    }

    fetchChatHistory();
  }, []);

  const handleContinueChat = () => {
    navigate("/triage-helper"); // Assuming "/triage-helper" is your chatbot route
  };

  if (loading) return <p className="text-center mt-10">Loading chat history...</p>;
  if (chatHistory.length === 0)
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <p>No chat history found.</p>
        <button
          onClick={handleContinueChat}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start Chatting
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Chatbot Conversation History</h2>
      <ul className="space-y-2 border rounded p-4 max-h-[60vh] sm:max-h-[50vh] md:max-h-[60vh] overflow-auto">
        {chatHistory.map((msg) => (
          <li
            key={msg.id}
            className={`p-3 rounded break-words ${
              msg.sender === "bot" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"
            }`}
            aria-label={`${msg.sender === "bot" ? "Bot" : "You"} said: ${msg.message}`}
          >
            <strong>{msg.sender === "bot" ? "Bot:" : "You:"} </strong>
            {msg.message}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <button
          onClick={handleContinueChat}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue Chatting
        </button>
      </div>
    </div>
  );
}
