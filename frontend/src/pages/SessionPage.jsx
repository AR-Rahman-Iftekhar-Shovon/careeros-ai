import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";

const API_BASE = "http://localhost:8080/api";

const apiFetch = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("careeros_token");
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const MOODS = [
  { value: "GREAT", label: "😄 Great", color: "#22c55e" },
  { value: "GOOD", label: "🙂 Good", color: "#6366f1" },
  { value: "NEUTRAL", label: "😐 Neutral", color: "#f59e0b" },
  { value: "TIRED", label: "😴 Tired", color: "#f97316" },
  { value: "STRESSED", label: "😤 Stressed", color: "#ef4444" },
];

export default function SessionPage() {
  const isMobile = window.innerWidth <= 768;

  // Form state
  const [form, setForm] = useState({
    topic: "",
    durationMinutes: "",
    mood: "GOOD",
    notes: "",
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setFetchLoading(true);
    try {
      const res = await apiFetch("/sessions");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("Sessions load error:", e.message);
      setSessions([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.topic.trim()) {
      setSaveMsg({ text: "❌ Topic is required!", type: "error" });
      setTimeout(() => setSaveMsg({ text: "", type: "" }), 3000);
      return;
    }
    if (!form.durationMinutes || parseInt(form.durationMinutes) <= 0) {
      setSaveMsg({ text: "❌ Please enter valid duration!", type: "error" });
      setTimeout(() => setSaveMsg({ text: "", type: "" }), 3000);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        topic: form.topic.trim(),
        durationMinutes: parseInt(form.durationMinutes),
        mood: form.mood,
        notes: form.notes.trim() || null,
      };
      await apiFetch("/sessions", "POST", payload);
      setSaveMsg({ text: "✅ Session logged successfully!", type: "success" });
      setForm({ topic: "", durationMinutes: "", mood: "GOOD", notes: "" });
      loadSessions(); // Refresh list
    } catch (e) {
      setSaveMsg({ text: `❌ Failed: ${e.message}`, type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setSaveMsg({ text: "", type: "" }), 3000);
    }
  };

  const getMoodInfo = (moodValue) =>
    MOODS.find((m) => m.value === moodValue) || MOODS[1];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getProductivityColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
      <style>{`
        .sess-input {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .sess-input:focus {
          border-color: var(--accent-1) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .sess-input::placeholder { color: var(--text-secondary); }
        .mood-btn:hover { transform: translateY(-2px); }
        .log-btn:hover { background: #4f46e5 !important; transform: translateY(-1px); }
      `}</style>

      <Sidebar />

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 280,
        padding: isMobile ? "16px" : "32px",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 800, marginBottom: 6,
              background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              ⚡ Study Sessions
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Track your study sessions to build momentum and avoid burnout.
            </p>
          </motion.div>

          {/* Toggle Form Button */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                background: "var(--accent-1)", color: "#fff", border: "none",
                borderRadius: "10px", padding: "10px 24px", fontSize: "14px",
                fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
              {showForm ? "✕ Hide Form" : "+ Log New Session"}
            </button>
          </div>

          {/* LOG SESSION FORM */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden", marginBottom: 28 }}
              >
                <div style={{
                  background: "var(--glass-bg, var(--bg-card))",
                  border: "1px solid var(--border)", borderRadius: 16, padding: 24,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>
                    📝 Log New Session
                  </div>

                  {/* Topic + Duration */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                        Topic *
                      </label>
                      <input
                        className="sess-input"
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        placeholder="e.g. React Hooks, Data Structures..."
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                        Duration (minutes) *
                      </label>
                      <input
                        className="sess-input"
                        type="number"
                        min="1"
                        value={form.durationMinutes}
                        onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                        placeholder="e.g. 60"
                      />
                    </div>
                  </div>

                  {/* Mood Selector */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 10 }}>
                      Mood
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          className="mood-btn"
                          onClick={() => setForm({ ...form, mood: mood.value })}
                          style={{
                            padding: "8px 14px", borderRadius: 20, border: `2px solid`,
                            borderColor: form.mood === mood.value ? mood.color : "var(--border)",
                            background: form.mood === mood.value ? `${mood.color}20` : "transparent",
                            color: form.mood === mood.value ? mood.color : "var(--text-secondary)",
                            fontSize: 13, fontWeight: 500, cursor: "pointer",
                            transition: "all 0.2s", fontFamily: "inherit",
                          }}>
                          {mood.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                      Notes (optional)
                    </label>
                    <textarea
                      className="sess-input"
                      style={{ resize: "vertical", minHeight: 80 }}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="What did you learn? Any blockers?"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    className="log-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background: "var(--accent-1)", color: "#fff", border: "none",
                      borderRadius: 10, padding: "11px 28px", fontSize: 14,
                      fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit",
                    }}>
                    {loading ? "Saving..." : "⚡ Log Session"}
                  </button>

                  {saveMsg.text && (
                    <div style={{
                      marginTop: 12, padding: "10px 16px", borderRadius: 8, fontSize: 14,
                      background: saveMsg.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: saveMsg.type === "success" ? "#22c55e" : "#ef4444",
                      border: `1px solid ${saveMsg.type === "success" ? "#22c55e" : "#ef4444"}`,
                    }}>
                      {saveMsg.text}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RECENT SESSIONS */}
          <div style={{
            background: "var(--glass-bg, var(--bg-card))",
            border: "1px solid var(--border)", borderRadius: 16, padding: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                🕒 Recent Sessions
              </div>
              <button
                onClick={loadSessions}
                style={{
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "6px 14px", fontSize: 12,
                  color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
                }}>
                ↻ Refresh
              </button>
            </div>

            {fetchLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  No sessions yet. Log your first session above!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.map((session, idx) => {
                  const mood = getMoodInfo(session.mood);
                  return (
                    <motion.div
                      key={session.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: 12, padding: "14px 18px",
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                      }}>
                      {/* Left: Topic + Date */}
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                          {session.topic}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {formatDate(session.sessionDate)}
                        </div>
                      </div>

                      {/* Middle: Duration + Mood */}
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{
                          background: "rgba(99,102,241,0.1)", color: "var(--accent-1)",
                          border: "1px solid rgba(99,102,241,0.2)",
                          borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500,
                        }}>
                          ⏱ {session.durationMinutes} min
                        </span>
                        <span style={{
                          background: `${mood.color}15`, color: mood.color,
                          border: `1px solid ${mood.color}40`,
                          borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500,
                        }}>
                          {mood.label}
                        </span>
                      </div>

                      {/* Right: Productivity Score */}
                      <div style={{ textAlign: "right", minWidth: 60 }}>
                        <div style={{
                          fontSize: 20, fontWeight: 800,
                          color: getProductivityColor(session.productivityScore),
                        }}>
                          {session.productivityScore}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>score</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}