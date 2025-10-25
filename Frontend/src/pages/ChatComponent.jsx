// ChatComponent.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Your bot logic function
  const fetchAIResponse = async (input) => {
    try {
      // Change the URL if necessary
      const COLAB_URL = "https://violation-precious-expanded-sagem.trycloudflare.com/chat";

      const res = await fetch(COLAB_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: input }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data.reply || "Sorry, I couldn't understand that.";
    } catch (err) {
      console.error("AI fetch error:", err);
      return "There was an error connecting to the AI service. Please try again later.";
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      initializeChat();
    }
  }, [userId, location]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);
  };

  const initializeChat = async () => {
    const urlParams = new URLSearchParams(location.search);
    const sessionParam = urlParams.get('session');
    
    if (sessionParam && location.state?.sessionMessages) {
      // Continue existing session
      setSessionId(sessionParam);
      setMessages(location.state.sessionMessages);
    } else if (sessionParam) {
      // Load session from database if state wasn't passed
      await loadSessionFromDatabase(sessionParam);
    } else {
      // Start new session
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      setMessages([]);
    }
    setLoading(false);
  };

  const loadSessionFromDatabase = async (sessionId) => {
    try {
      const { data: messages, error } = await supabase
        .from("chatbot_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      setSessionId(sessionId);
      setMessages(messages || []);
    } catch (error) {
      console.error("Error loading session:", error);
      // Fallback to new session
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !userId || isSending) return;

    setIsSending(true);
    const userInput = inputMessage.trim();
    setInputMessage("");

    const userMessage = {
      id: Date.now(),
      message: userInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to database
      const { error: userError } = await supabase.from("chatbot_history").insert([
        {
          user_id: userId,
          message: userInput,
          sender: 'user',
          timestamp: new Date().toISOString(),
          session_id: sessionId
        }
      ]);

      if (userError) throw userError;

      // Get AI response using your function
      const aiResponse = await fetchAIResponse(userInput);
      
      const botMessage = {
        id: Date.now() + 1,
        message: aiResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        session_id: sessionId
      };

      // Add bot message to UI
      setMessages(prev => [...prev, botMessage]);

      // Save bot message to database
      const { error: botError } = await supabase.from("chatbot_history").insert([
        {
          user_id: userId,
          message: aiResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          session_id: sessionId
        }
      ]);

      if (botError) throw botError;

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Show error message to user
      const errorMessage = {
        id: Date.now() + 2,
        message: "Sorry, there was an error processing your message. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        session_id: sessionId
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
        {/* Chat header */}
        <div className="border-b p-4 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-semibold text-lg">
              {messages.length > 0 ? 'Healthcare Assistant' : 'New Chat - Healthcare Assistant'}
            </h3>
            <p className="text-sm text-gray-600">
              Session: {sessionId ? sessionId.substring(0, 15) + '...' : 'New'}
            </p>
          </div>
          <button
            onClick={() => navigate('/chatbot-history')}
            className="text-blue-600 hover:text-blue-800 text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50"
          >
            ← History
          </button>
        </div>
        
        {/* Messages container */}
        <div className="messages-container flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">🏥</div>
              <p className="text-lg font-medium">Welcome to Healthcare Assistant</p>
              <p className="text-sm mt-2">Ask me about hospitals, symptoms, appointments, or healthcare services in Hong Kong</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 border rounded-lg p-3 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about hospitals, symptoms, or healthcare services..."
              className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Healthcare information only
          </p>
        </div>
      </div>
    </div>
  );
}