import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ChatHistory() {
  const { t, i18n } = useTranslation();
  const [chatSessions, setChatSessions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchChatSessions();
    }
  }, [userId]);

  const fetchChatSessions = async () => {
    try {
      // First, get all messages for the user
      const { data: messages, error } = await supabase
        .from("chatbot_history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      // Group messages by session/conversation
      const sessions = groupMessagesIntoConversations(messages || []);
      setChatSessions(sessions);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      alert(i18n.language === 'zh-CN' ? "获取聊天记录时出错：" : "Error fetching chat history: " + error.message);
    }
  };

  const groupMessagesIntoConversations = (messages) => {
    if (messages.length === 0) return [];

    const sessions = [];
    let currentSession = {
      id: `session-${messages[0].id}`,
      messages: [],
      startTime: messages[0].timestamp,
      lastMessage: messages[0].timestamp,
      messageCount: 0,
    };

    messages.forEach((message, index) => {
      const timeDiff =
        index > 0
          ? new Date(message.timestamp) -
            new Date(messages[index - 1].timestamp)
          : 0;

      // If gap between messages is more than 30 minutes, start a new session
      if (timeDiff > 30 * 60 * 1000) {
        // 30 minutes in milliseconds
        sessions.push({ ...currentSession });
        currentSession = {
          id: `session-${message.id}`,
          messages: [message],
          startTime: message.timestamp,
          lastMessage: message.timestamp,
          messageCount: 1,
        };
      } else {
        currentSession.messages.push(message);
        currentSession.lastMessage = message.timestamp;
        currentSession.messageCount++;
      }

      // Push the last session
      if (index === messages.length - 1) {
        sessions.push({ ...currentSession });
      }
    });

    return sessions.sort(
      (a, b) => new Date(b.lastMessage) - new Date(a.lastMessage)
    );
  };

  const clearHistory = async () => {
    if (!confirm(i18n.language === 'zh-CN' ? "确定要清除所有聊天记录吗？" : "Are you sure you want to clear all chat history?")) return;

    try {
      const { error } = await supabase
        .from("chatbot_history")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      setChatSessions([]);
      alert(i18n.language === 'zh-CN' ? "聊天记录已清除！" : "Chat history cleared!");
    } catch (error) {
      console.error("Error clearing history:", error);
      alert(i18n.language === 'zh-CN' ? "清除记录时出错：" : "Error clearing history: " + error.message);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm(i18n.language === 'zh-CN' ? "确定要删除此对话吗？" : "Are you sure you want to delete this conversation?")) return;

    try {
      const session = chatSessions.find((s) => s.id === sessionId);
      if (!session) return;

      // Delete all messages in this session
      const messageIds = session.messages.map((msg) => msg.id);
      const { error } = await supabase
        .from("chatbot_history")
        .delete()
        .in("id", messageIds);

      if (error) throw error;

      // Remove session from state
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
      alert(i18n.language === 'zh-CN' ? "对话已删除！" : "Conversation deleted!");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert(i18n.language === 'zh-CN' ? "删除对话时出错：" : "Error deleting conversation: " + error.message);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US', {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreviewMessage = (messages) => {
    const lastMessage = messages[messages.length - 1];
    const preview =
      lastMessage.message.length > 100
        ? lastMessage.message.substring(0, 100) + "..."
        : lastMessage.message;
    return preview;
  };

  const getSessionTitle = (session) => {
    const firstUserMessage = session.messages.find(
      (msg) => msg.sender === "user"
    );
    if (firstUserMessage) {
      const title =
        firstUserMessage.message.length > 50
          ? firstUserMessage.message.substring(0, 50) + "..."
          : firstUserMessage.message;
      return title;
    }
    return t("new_conversation", "New Conversation");
  };

  if (loading) return <div className="max-w-3xl mx-auto p-6">{t("loading", "Loading...")}</div>;

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-semibold">{t("chat_history_title", "Chat History")}</h2>
          <p className="text-gray-600 mt-2">
            {t("chat_history_subtitle", "Continue previous conversations or start new ones")}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/triage-helper"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            {t("new_chat", "New Chat")}
          </Link>
          {chatSessions.length > 0 && (
            <button
              onClick={clearHistory}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              {t("clear_all", "Clear All")}
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {chatSessions.length}
            </p>
            <p className="text-gray-600">{t("conversations", "Conversations")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {chatSessions.reduce(
                (total, session) => total + session.messageCount,
                0
              )}
            </p>
            <p className="text-gray-600">{t("total_messages", "Total Messages")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {
                chatSessions.filter((session) =>
                  session.messages.some((msg) => msg.sender === "user")
                ).length
              }
            </p>
            <p className="text-gray-600">{t("active_chats", "Active Chats")}</p>
          </div>
        </div>
      </div>

      {/* Chat Sessions List */}
      {chatSessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("no_conversations", "No conversations yet.")}</p>
          <p className="text-gray-400 mt-2">
            {t("start_new_chat_prompt", "Start a new chat to begin your conversation!")}
          </p>
          <Link
            to="/chat"
            className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
          >
            {t("start_new_chat", "Start New Chat")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {getSessionTitle(session)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {session.messageCount} {t("messages", "messages")} • {t("started", "Started")}{" "}
                    {formatDate(session.startTime)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t("last_activity", "Last activity")}: {formatTime(session.lastMessage)}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Link
                    to={`/chat?session=${session.id}`}
                    state={{ sessionMessages: session.messages }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    {t("continue", "Continue")}
                  </Link>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                  >
                    {t("delete", "Delete")}
                  </button>
                </div>
              </div>

              {/* Preview of last message */}
              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex items-start space-x-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mt-2 ${
                      session.messages[session.messages.length - 1].sender ===
                      "user"
                        ? "bg-green-500"
                        : "bg-purple-500"
                    }`}
                  ></span>
                  <p className="text-gray-700 text-sm flex-1">
                    <span className="font-medium">
                      {session.messages[session.messages.length - 1].sender ===
                      "user"
                        ? t("you", "You: ")
                        : t("bot", "Bot: ")}
                    </span>
                    {getPreviewMessage(session.messages)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}