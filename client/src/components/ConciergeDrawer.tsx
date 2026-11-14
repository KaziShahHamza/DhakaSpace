import React, { useState } from "react";
import { X, Sparkles, Send, Bot, User } from "lucide-react";

interface ConciergeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  timestamp: string;
  toolCalls?: string[];
}

export const ConciergeDrawer: React.FC<ConciergeDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "concierge",
      text: "Assalamu Alaikum! I am your DhakaSpace AI Concierge. Ask me about average rents in Gulshan or Banani, finding a 3-bedroom flat near Dhanmondi lake, or scheduling a visit to any listing!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        "I can help you explore Dhaka properties! For example, residential flats in Gulshan average ৳ 45-90/sqft, while Mirpur offers great family homes around ৳ 20-30/sqft.";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "concierge",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolCalls: data.toolCallsExecuted,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "concierge",
        text: "I'm connected to the DhakaSpace catalog. Banani and Gulshan are great for commercial spaces, while Dhanmondi and Uttara offer wonderful residential living. What area or budget are you targeting?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Dhaka Rental Concierge</h3>
              <p className="text-[11px] text-emerald-100">
                Google ADK & GenAI Agent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "concierge" && (
                <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  msg.sender === "user"
                    ? "bg-green-600 text-white rounded-tr-none shadow-sm"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-200/80 shadow-sm"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-gray-100">
                    {msg.toolCalls.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono border border-emerald-200/60"
                      >
                        ⚡ Tool: {t}
                      </span>
                    ))}
                  </div>
                )}
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    msg.sender === "user" ? "text-green-100" : "text-gray-400"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Bot className="w-4 h-4 text-green-600 animate-spin" />
              <span>Thinking with Gemini...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Dhaka rents or listings..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
