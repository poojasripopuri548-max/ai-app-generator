"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Trash2, AlertCircle, Code2, Bot, User, Terminal } from "lucide-react";
import { AIService } from "@/lib/ai-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface ChatPanelProps {
  onCodeGenerated: (code: string) => void;
}

export default function ChatPanel({ onCodeGenerated }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Welcome to the AI App Generator! I can help you build React components and apps. Try saying:\n\n- **\"Add a login page\"** - Generates a complete login form\n- **\"Make it blue\"** - Creates a theme configuration\n- **\"Add a dashboard\"** - Builds a metrics dashboard\n- **\"Add email notifications\"** - Creates a notification system\n- **\"Add a table\"** - Generates a data table with search & pagination\n- **\"Create an API endpoint\"** - Builds a REST API route\n- **\"Add charts\"** - Creates an analytics dashboard",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiService = useRef(new AIService());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setInput("");
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    let fullResponse = "";

    try {
      const stream = aiService.current.generateStream(trimmed);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: fullResponse, isStreaming: true }
              : msg
          )
        );
      }

      // Extract code blocks from the response
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
      const codeMatches = [];
      let match;
      while ((match = codeBlockRegex.exec(fullResponse)) !== null) {
        codeMatches.push({ language: match[1], code: match[2].trim() });
      }

      if (codeMatches.length > 0) {
        const combinedCode = codeMatches.map((m) => m.code).join("\n\n");
        onCodeGenerated(combinedCode);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (err) {
      setError("Failed to generate. Please try again.");
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id));
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
        content: "Chat cleared! What would you like to build next?",
      },
    ]);
  }

  function renderMessageContent(content: string) {
    // Process code blocks for styling
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        if (match) {
          const [, language, code] = match;
          return (
            <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700/50">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700/50">
                <Code2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-400 uppercase">
                  {language || "code"}
                </span>
              </div>
              <pre className="p-4 bg-slate-900 overflow-x-auto">
                <code className="text-sm font-mono text-slate-200 leading-relaxed whitespace-pre">
                  {code}
                </code>
              </pre>
            </div>
          );
        }
      }
      // Render markdown-like formatting
      const lines = part.split("\n").filter(Boolean);
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, i) => {
            if (line.startsWith("- **") && line.endsWith("**")) {
              return (
                <p key={i} className="text-sm text-slate-300">
                  {line}
                </p>
              );
            }
            if (line.startsWith("- ")) {
              const bulletContent = line.substring(2);
              const boldMatch = bulletContent.match(/\*\*(.*?)\*\*(.*)/);
              return (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-400 mt-1.5 flex-shrink-0">•</span>
                  <span>
                    {boldMatch ? (
                      <>
                        <strong className="text-slate-100">{boldMatch[1]}</strong>
                        {boldMatch[2]}
                      </>
                    ) : (
                      bulletContent
                    )}
                  </span>
                </div>
              );
            }
            const boldParts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} className="text-sm text-slate-300 leading-relaxed">
                {boldParts.map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={j} className="text-slate-100 font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <Bot className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">AI Chat</h2>
            <p className="text-xs text-slate-500">
              {isStreaming ? "Generating..." : "Ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                message.role === "user"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 max-w-[85%] ${
                message.role === "user" ? "flex justify-end" : ""
              }`}
            >
              <div
                className={`rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/50 border border-slate-700/30"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="text-sm text-slate-200 leading-relaxed">
                    {renderMessageContent(message.content)}
                    {message.isStreaming && (
                      <span className="inline-block ml-1 animate-pulse">
                        <span className="inline-block w-1.5 h-4 bg-blue-400 rounded-sm" />
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur">
        <div className="flex items-end gap-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-1 focus-within:border-blue-500/50 transition">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none max-h-40 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-600 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}