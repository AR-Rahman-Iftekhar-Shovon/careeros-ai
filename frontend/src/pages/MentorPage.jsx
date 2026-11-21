import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../api/client";


// ── Quick Question Suggestions ────────────────────────────────
const QUICK_QUESTIONS = [
  { emoji: "🎯", text: "What career is best for me?" },
  { emoji: "📚", text: "How should I study today?" },
  { emoji: "💪", text: "I feel demotivated. Help me!" },
  { emoji: "🗺️", text: "What skill should I learn next?" },
  { emoji: "😰", text: "I'm feeling burned out." },
  { emoji: "💼", text: "How do I prepare for interviews?" },
];

// ── AI Response Generator (Fallback if backend unavailable) ──
const generateLocalResponse = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes("motivat") || msg.includes("demotivat") || msg.includes("give up")) {
    return "I hear you — and I want you to know that **every expert was once a beginner**. 💪\n\nThe fact that you're here, trying, already puts you ahead of 90% of people. Progress isn't always visible day-to-day, but it's happening.\n\n✨ **Try this:** Write down ONE small thing you learned this week. Then do just 25 minutes of focused study today. That's it. Small wins build big momentum!";
  }
  if (msg.includes("burnout") || msg.includes("tired") || msg.includes("stressed") || msg.includes("exhaust")) {
    return "Burnout is real — and it's your body saying *'I need rest, not quitting.'* 🧘\n\n**Signs you need a break:**\n- Everything feels harder than usual\n- You can't focus for more than 10 minutes\n- Learning feels like a chore\n\n**What to do right now:**\n1. Take a proper 1-2 day break (guilt-free!)\n2. Sleep 7-8 hours tonight\n3. Go for a 20 min walk tomorrow\n4. Come back refreshed — you'll learn 3x faster!\n\nRest is not weakness. Rest is strategy. 🌟";
  }
  if (msg.includes("career") || msg.includes("job") || msg.includes("best for me")) {
    return "Great question! Choosing the right career is one of the most important decisions you'll make. 🎯\n\nHere's how to think about it:\n\n**Ask yourself:**\n- What do I enjoy doing for hours without getting bored?\n- Am I better with numbers, design, writing, or building things?\n- Do I want to work alone or with people?\n\n**Top growing careers in tech:**\n💻 Software Engineer — Build apps people love\n📊 Data Analyst — Find patterns in data\n🎨 UI/UX Designer — Make beautiful products\n🤖 ML Engineer — Teach computers to think\n\nGo to the **Career Analysis** page to see which career matches YOUR current skills! 🚀";
  }
  if (msg.includes("skill") || msg.includes("learn next") || msg.includes("what should i learn")) {
    return "The smartest way to choose your next skill is to **look at the gap between where you are and where you want to be.** 📚\n\n**Here's my advice:**\n\n1. **Check Career Analysis** page — it shows exactly which skills you're missing for your dream career\n2. **Pick the most-mentioned missing skill** and focus on that for 2-3 weeks\n3. Don't learn randomly — learn with purpose!\n\n**Universal skills worth having in 2024:**\n- 🐍 Python (used everywhere)\n- 🗄️ SQL (every company needs it)\n- ⚛️ React (most demanded frontend skill)\n- 🐋 Docker (makes you stand out)\n\nWhat's your career goal? I can give more specific advice! 🎯";
  }
  if (msg.includes("interview") || msg.includes("job apply") || msg.includes("hire")) {
    return "Interview prep is all about **practicing the right things, not just studying everything.** 💼\n\n**30-Day Interview Plan:**\n\n**Week 1-2: DSA Basics**\n- Solve 2 easy LeetCode problems daily\n- Focus: Arrays, Strings, HashMaps\n\n**Week 3: Projects**\n- Polish your GitHub projects\n- Write clear READMEs\n\n**Week 4: Mock Interviews**\n- Practice on Pramp or Interviewing.io\n- Record yourself answering questions\n\n**Golden Tips:**\n✅ Always explain your thinking out loud\n✅ Ask clarifying questions\n✅ It's okay to say 'I don't know, but here's how I'd figure it out'\n\nYou've got this! 🌟";
  }
  if (msg.includes("study") || msg.includes("how to study") || msg.includes("study plan")) {
    return "Here's a study method that actually works — used by top performers worldwide! 📖\n\n**The 3-Block Method (for today):**\n\n🟢 **Block 1 (Morning - 45 min):**\nReview what you learned yesterday (10 min) + Learn new concept (35 min)\n\n🟡 **Block 2 (Afternoon - 45 min):**\nPractice / coding exercises on today's topic\n\n🔵 **Block 3 (Evening - 30 min):**\nTeach it back — write a summary in simple words\n\n**Why it works:**\n- Spaced repetition = better memory\n- Practice > passive reading\n- Teaching = deepest understanding\n\n🎯 Log your session in the **Sessions** page to track your progress!";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("hola")) {
    return "Hey there! 👋 I'm your **CareerOS AI Mentor** — I'm here to help you grow, stay motivated, and reach your career goals!\n\n**I can help you with:**\n🎯 Career advice and planning\n📚 Study strategies and tips\n💪 Motivation when you feel stuck\n🗺️ What to learn next\n😰 Managing burnout and stress\n💼 Interview preparation\n\nWhat's on your mind today? Ask me anything! 😊";
  }
  if (msg.includes("thank") || msg.includes("thanks") || msg.includes("helpful")) {
    return "You're so welcome! 😊 Remember — I'm always here whenever you need guidance, motivation, or just someone to think out loud with.\n\nKeep going — you're doing better than you think! 🌟\n\n*\"The secret of getting ahead is getting started.\"* — Mark Twain";
  }

  // Default response
  return `That's a great question! Let me share my thoughts on **"${message}"**.\n\nAs your AI Career Mentor, my advice is:\n\n1. **Break it down** — Every big challenge becomes manageable in small steps\n2. **Be consistent** — 30 minutes every day beats 5 hours on weekends\n3. **Track progress** — Use the Sessions page to log your daily work\n4. **Stay patient** — Real growth takes 3-6 months of consistent effort\n\nWant more specific advice? Try asking about:\n- Your career path 🎯\n- Study strategies 📚\n- Burnout and motivation 💪\n- Interview preparation 💼\n\nI'm here for you! 🌟`;
};

// ── Format message with bold & line breaks ────────────────────
const formatMessage = (text) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ color: "var(--text-primary)" }}>{part}</strong>
            : part
        )}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};

// ── Main Component ────────────────────────────────────────────
export default function MentorPage() {
  const isMobile = window.innerWidth <= 768;
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "mentor",
      text: "Hey there! 👋 I'm your **CareerOS AI Mentor** — I'm here to help you grow, stay motivated, and reach your career goals!\n\n**I can help you with:**\n🎯 Career advice and planning\n📚 Study strategies and tips\n💪 Motivation when you feel stuck\n🗺️ What to learn next\n😰 Managing burnout and stress\n💼 Interview preparation\n\nWhat's on your mind today? Ask me anything! 😊",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    const userMsg = { id: Date.now(), role: "user", text: userText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Try backend (Gemini) first, fallback to local
    try {
      const data = await apiFetch("/mentor/ask", "POST", { question: userText });
      const mentorText = data.message || data.response;
      if (!mentorText) throw new Error("Empty response");

      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: "mentor",
        text: mentorText,
        time: new Date(),
      }]);
    } catch {
      // Use local AI response
      const delay = 800 + Math.random() * 600;
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, {
          id: Date.now() + 1, role: "mentor",
          text: generateLocalResponse(userText),
          time: new Date(),
        }]);
      }, delay);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const clearChat = () => {
    setMessages([{
      id: 1, role: "mentor",
      text: "Chat cleared! I'm still here — ask me anything! 😊",
      time: new Date(),
    }]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
      <style>{`
        .quick-q { transition: all 0.2s; cursor: pointer; }
        .quick-q:hover { border-color: var(--accent-1) !important; background: rgba(99,102,241,0.08) !important; transform: translateY(-2px); }
        .send-btn:hover { background: #4f46e5 !important; transform: scale(1.05); }
        .msg-input:focus { border-color: var(--accent-1) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; outline: none; }
        .msg-input::placeholder { color: var(--text-secondary); }
        .clear-btn:hover { border-color: #ef4444 !important; color: #ef4444 !important; }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 280, display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* ── Top Bar ── */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, var(--accent-1), var(--accent-2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                CareerOS AI Mentor
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Always online — here for you</span>
              </div>
            </div>
          </div>
          <button className="clear-btn"
            onClick={clearChat}
            style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            🗑️ Clear Chat
          </button>
        </div>

        {/* ── Messages Area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Questions (show only at start) */}
          {messages.length <= 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                💡 Quick Questions to Get Started
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} className="quick-q"
                    onClick={() => sendMessage(q.text)}
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 20, padding: "8px 14px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "inherit" }}>
                    {q.emoji} {q.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>

                {/* Avatar */}
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: msg.role === "mentor" ? "linear-gradient(135deg, var(--accent-1), var(--accent-2))" : "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, border: "2px solid var(--border)" }}>
                  {msg.role === "mentor" ? "🤖" : "👤"}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: "72%", minWidth: 80 }}>
                  <div style={{
                    background: msg.role === "mentor" ? "var(--bg-secondary)" : "var(--accent-1)",
                    border: `1px solid ${msg.role === "mentor" ? "var(--border)" : "transparent"}`,
                    borderRadius: msg.role === "mentor" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                    padding: "12px 16px",
                    fontSize: 14,
                    color: msg.role === "mentor" ? "var(--text-primary)" : "#fff",
                    lineHeight: 1.65,
                  }}>
                    {formatMessage(msg.text)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, textAlign: msg.role === "user" ? "right" : "left" }}>
                    {formatTime(msg.time)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-1), var(--accent-2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid var(--border)" }}>
                🤖
              </div>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px", padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-1)" }} />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div style={{ padding: isMobile ? "12px 16px" : "16px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: "860px", margin: "0 auto" }}>
            <textarea
              ref={inputRef}
              className="msg-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your career, studies, or how you're feeling..."
              rows={1}
              style={{
                flex: 1, background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "12px 16px", fontSize: 14,
                color: "var(--text-primary)", fontFamily: "inherit", resize: "none",
                maxHeight: 120, overflowY: "auto", lineHeight: 1.5,
                transition: "border 0.2s, box-shadow 0.2s",
              }}
            />
            <button className="send-btn"
              onClick={() => sendMessage()}
              disabled={isTyping || !input.trim()}
              style={{
                width: 46, height: 46, borderRadius: 12, border: "none",
                background: input.trim() ? "var(--accent-1)" : "var(--border)",
                color: "#fff", fontSize: 20, cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
              }}>
              ➤
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--text-secondary)" }}>
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>

      </div>
    </div>
  );
}