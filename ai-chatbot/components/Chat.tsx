"use client";

import { useEffect, useRef, useState } from "react";
import { sendInterviewMessage } from "@/lib/api";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendInterviewMessage(input);

      setMessages(prev => [
        ...prev,
        { role: "ai", content: response.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "⚠️ Unable to reach the interviewer." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-slate-900">
        <h1 className="text-lg font-semibold">AI Interviewer</h1>
        <p className="text-sm text-slate-300">
          Please answer one question at a time.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm text-slate-500">
              Interviewer is typing…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm 
            text-black bg-white
            focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Type your answer..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button
          className="bg-slate-900 text-white px-4 rounded-lg text-sm disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
