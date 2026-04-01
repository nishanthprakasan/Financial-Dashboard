import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Send, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "What is my biggest expense category?",
  "How much have I saved in total?",
  "Am I spending too much?",
  "What's my savings rate?",
];

export function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI finance assistant. Ask me anything about your spending, savings, or transactions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.success ? data.reply : "Sorry, I couldn't process that. Try again.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          AI Finance Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto space-y-3 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your finances..."
            className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </CardContent>
    </Card>
  );
}