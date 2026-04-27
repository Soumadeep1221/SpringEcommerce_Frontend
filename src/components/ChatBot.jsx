import { useState, useEffect, useRef } from "react";
import axios from "../axios";

const WELCOME = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your shopping assistant for Soumadeep's Corner. Ask me anything about our products, orders, or anything else I can help with!",
  time: new Date(),
};

const formatTime = (date) => {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const ChatBot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.get(`/ask`, { params: { message: text } });
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: response.data,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          time: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  if (!open) return null;

  return (
    <div
      className="animate-slideInUp"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        width: "380px",
        maxWidth: "calc(100vw - 2rem)",
        height: "560px",
        maxHeight: "calc(100vh - 5rem)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        overflow: "hidden",
        zIndex: 1060,
        backgroundColor: "white",
        border: "1px solid var(--gray-200)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="bi bi-stars" style={{ color: "white", fontSize: "1.2rem" }}></i>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "600", fontSize: "0.95rem", lineHeight: 1.2 }}>
              AI Assistant
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#4ade80",
                  display: "inline-block",
                }}
              ></span>
              Online
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={clearChat}
            title="Clear chat"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            <i className="bi bi-arrow-counterclockwise" style={{ fontSize: "0.9rem" }}></i>
          </button>
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            <i className="bi bi-x-lg" style={{ fontSize: "0.9rem" }}></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          backgroundColor: "var(--gray-50)",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fadeIn"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                padding: "0.65rem 0.9rem",
                borderRadius:
                  msg.role === "user"
                    ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
                    : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
                    : msg.isError
                    ? "var(--error-light)"
                    : "white",
                color:
                  msg.role === "user"
                    ? "white"
                    : msg.isError
                    ? "var(--error-color)"
                    : "var(--gray-800)",
                boxShadow: "var(--shadow-sm)",
                border: msg.role === "bot" && !msg.isError ? "1px solid var(--gray-200)" : "none",
                fontSize: "0.9rem",
                lineHeight: "1.55",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </div>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--gray-400)",
                marginTop: "0.25rem",
                paddingLeft: msg.role === "bot" ? "0.25rem" : 0,
                paddingRight: msg.role === "user" ? "0.25rem" : 0,
              }}
            >
              {formatTime(msg.time)}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="animate-fadeIn" style={{ display: "flex", alignItems: "flex-start" }}>
            <div
              style={{
                padding: "0.65rem 1rem",
                borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                background: "white",
                border: "1px solid var(--gray-200)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#7c3aed",
                    display: "inline-block",
                    animation: "typingDot 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                ></span>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1px solid var(--gray-200)",
          backgroundColor: "white",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-end",
            backgroundColor: "var(--gray-50)",
            border: "1px solid var(--gray-300)",
            borderRadius: "var(--radius-lg)",
            padding: "0.5rem 0.5rem 0.5rem 0.75rem",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--gray-300)")}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={loading}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              resize: "none",
              fontSize: "0.9rem",
              color: "var(--gray-800)",
              lineHeight: "1.5",
              maxHeight: "100px",
              overflowY: "auto",
              padding: 0,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background:
                !input.trim() || loading
                  ? "var(--gray-200)"
                  : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              color: !input.trim() || loading ? "var(--gray-400)" : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            {loading ? (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid var(--gray-400)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }}
              ></span>
            ) : (
              <i className="bi bi-send-fill" style={{ fontSize: "0.85rem" }}></i>
            )}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: "0.4rem" }}>
          <small style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>
            Press Enter to send · Shift+Enter for new line
          </small>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
