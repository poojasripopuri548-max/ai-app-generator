"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Trash2, Bot, User, CheckCircle2 } from "lucide-react";
import { AIService, GenerationStep } from "@/lib/ai-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: GenerationStep[];
  isStreaming?: boolean;
}

interface ChatPanelProps {
  onCodeGenerated: (code: string, json: string) => void;
}

export default function ChatPanel({ onCodeGenerated }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I can build apps for you. Try saying:\n\n• **Add login page**\n• **Make it blue**\n• **Add dashboard**\n• **Add email notifications**\n• **Add a table**\n• **Add charts/analytics**",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiService = useRef(new AIService());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isStreaming: true,
      steps: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const steps: GenerationStep[] = [];

      const result = await aiService.current.processPrompt(trimmed, (step) => {
        steps.push(step);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsg.id
              ? { ...msg, steps: [...steps], isStreaming: true }
              : msg
          )
        );
      });

      // Send the generated code and JSON to parent
      onCodeGenerated(result.code, result.json);

      // Update with final message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsg.id
            ? { ...msg, content: result.message, isStreaming: false }
            : msg
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsg.id
            ? { ...msg, content: "❌ Something went wrong. Try again.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    aiService.current.clearHistory();
    setMessages([
      {
        id: "welcome-2",
        role: "assistant",
        content: "Chat cleared! What would you like to build?",
      },
    ]);
  }

  function renderMessage(msg: Message) {
    return (
      <div key={msg.id} className="flex gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            msg.role === "user"
              ? "bg-blue-500/10 text-blue-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className="flex-1 max-w-[85%]">
          <div
            className={`rounded-xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-slate-800/50 border border-slate-700/30"
            }`}
          >
            {msg.role === "user" ? (
              <p className="text-sm">{msg.content}</p>
            ) : (
              <div className="space-y-3">
                {/* Progress Steps */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.steps.map((step, idx) => {
                      const isDone = step.type === "done";
                      const isActive = step.type === "generating" || step.type === "progress";
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2.5 text-sm ${
                            isDone
                              ? "text-emerald-400"
                              : isActive
                              ? "text-slate-200"
                              : "text-slate-500"
                          }`}
                        >
                          <span className="flex-shrink-0 w-4 flex justify-center">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                            )}
                          </span>
                          <span className={isDone ? "text-emerald-300" : "text-slate-200"}>
                            {step.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Final message */}
                {msg.content && !msg.isStreaming && (
                  <div className="text-sm text-slate-200 leading-relaxed">{msg.content}</div>
                )}

                {/* Initial streaming state */}
                {msg.isStreaming && (!msg.steps || msg.steps.length === 0) && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <Bot className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">AI Chat</h2>
            <p className="text-xs text-slate-500">{isStreaming ? "Generating..." : "Ready"}</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button onClick={clearChat} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition" title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-slate-700/50">
        <div className="flex items-end gap-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-1 focus-within:border-blue-500/50 transition">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none max-h-30 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition flex-shrink-0"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}