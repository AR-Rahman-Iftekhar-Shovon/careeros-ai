import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../api/client";



// Cosmetic grouping only — backend gives a flat week list, we chunk it
// into "phases" of 4 weeks each just for a nicer visual layout.
const PHASE_EMOJIS = ["🧱", "🌐", "🔧", "🚀", "📚", "🎯"];
const groupIntoPhases = (weeks) => {
  const size = 4;
  const phases = [];
  for (let i = 0; i < weeks.length; i += size) {
    const chunk = weeks.slice(i, i + size);
    phases.push({
      phase: phases.length + 1,
      emoji: PHASE_EMOJIS[phases.length % PHASE_EMOJIS.length],
      weekRange: `Week ${chunk[0].weekNumber}–${chunk[chunk.length - 1].weekNumber}`,
      weeks: chunk,
    });
  }
  return phases;
};

const STRATEGY_LABEL = { FAST: "Fast Track", NORMAL: "Standard Pace", SLOW: "Steady Pace" };

export default function RoadmapPage() {
  const isMobile = window.innerWidth <= 768;
  const ACCENT = "#6366f1";

  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null); // active roadmap from backend, or null
  const [careerPaths, setCareerPaths] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [completingWeekId, setCompletingWeekId] = useState(null);
  const [changingPath, setChangingPath] = useState(false);

  useEffect(() => {
    loadActiveRoadmap();
  }, []);

  const loadActiveRoadmap = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/roadmaps/active");
      setRoadmap(data);
    } catch {
      // No active roadmap yet — show career selector instead
      setRoadmap(null);
      loadCareerPaths();
    } finally {
      setLoading(false);
    }
  };

  const openChangePath = () => {
    setErrorMsg("");
    setSelectedPathId(null);
    setChangingPath(true);
    if (careerPaths.length === 0) loadCareerPaths();
  };

  const loadCareerPaths = async () => {
    try {
      const paths = await apiFetch("/careers/paths");
      if (Array.isArray(paths)) setCareerPaths(paths);
    } catch (e) {
      setErrorMsg("Could not load career paths: " + e.message);
    }
  };

  const generateRoadmap = async () => {
    if (!selectedPathId || generating) return;
    setGenerating(true);
    setErrorMsg("");
    try {
      const data = await apiFetch("/roadmaps/generate", "POST", { careerPathId: selectedPathId });
      setRoadmap(data);
      setExpandedPhase(0);
      setChangingPath(false);
    } catch (e) {
      setErrorMsg("Failed to generate roadmap: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const completeWeek = async (weekId) => {
    if (completingWeekId) return;
    setCompletingWeekId(weekId);
    try {
      const data = await apiFetch("/roadmaps/complete-week", "POST", { weekId });
      setRoadmap(data);
    } catch (e) {
      setErrorMsg("Failed to update week: " + e.message);
    } finally {
      setCompletingWeekId(null);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: isMobile ? 0 : 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
          Loading your roadmap...
        </div>
      </div>
    );
  }

  // ── No active roadmap OR user wants to switch career: career picker ──
  if (!roadmap || changingPath) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: isMobile ? 0 : 280, padding: isMobile ? "16px" : "32px" }}>
          <div style={{ maxWidth: "700px", margin: "60px auto 0" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
              🗺️ {roadmap ? "Change Your Career Path" : "Build Your Roadmap"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
              {roadmap
                ? "Picking a new career will replace your current roadmap. Your old progress stays saved but becomes inactive."
                : "Choose a career goal and we'll generate a personalized, week-by-week plan based on your current skills and study pace."}
            </p>

            {errorMsg && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 13 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {careerPaths.map((path) => (
                <div key={path.id} onClick={() => setSelectedPathId(path.id)}
                  style={{
                    padding: "16px", borderRadius: 12, cursor: "pointer",
                    border: `2px solid ${selectedPathId === path.id ? ACCENT : "var(--border)"}`,
                    background: selectedPathId === path.id ? `${ACCENT}15` : "var(--bg-secondary)",
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                    {path.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {path.demandLevel} demand · ${Number(path.avgSalary || 0).toLocaleString()}/yr
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={generateRoadmap} disabled={!selectedPathId || generating}
                style={{
                  background: ACCENT, color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px 28px", fontSize: 14, fontWeight: 700,
                  cursor: !selectedPathId || generating ? "not-allowed" : "pointer",
                  opacity: !selectedPathId || generating ? 0.6 : 1,
                }}>
                {generating ? "Generating..." : "🚀 Generate My Roadmap"}
              </button>

              {roadmap && (
                <button onClick={() => { setChangingPath(false); setErrorMsg(""); }}
                  style={{
                    background: "transparent", color: "var(--text-secondary)",
                    border: "1px solid var(--border)", borderRadius: 10,
                    padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active roadmap ──
  const weeks = roadmap.weeks || [];
  const phases = groupIntoPhases(weeks);
  const totalWeeks = roadmap.totalWeeks || weeks.length;
  const progressPct = Math.round(roadmap.completionPercentage || 0);
  const weeksLeft = Math.max(totalWeeks - (roadmap.currentWeek - 1), 0);
  const careerTitle = roadmap.careerPath?.title || "Your Career";

  const phaseProgress = (phase) => {
    const done = phase.weeks.filter((w) => w.isCompleted).length;
    return Math.round((done / phase.weeks.length) * 100);
  };

  const getPhaseStatus = (pct) => {
    if (pct === 100) return { label: "✅ Done", color: "#22c55e" };
    if (pct > 0) return { label: "⏳ In Progress", color: "#f59e0b" };
    return { label: "🔒 Not Started", color: "var(--text-secondary)" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
      <style>{`
        .step-card { transition: all 0.2s ease; }
        .step-card:hover { border-color: var(--border-hover) !important; }
        .phase-header { cursor: pointer; transition: background 0.2s; }
        .phase-header:hover { background: var(--bg-card-hover) !important; }
        .check-btn { transition: all 0.2s; }
        .check-btn:hover { transform: scale(1.1); }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 280, padding: isMobile ? "16px" : "32px", overflowY: "auto" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                🗺️ Your Learning Roadmap
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {STRATEGY_LABEL[roadmap.strategy] || roadmap.strategy} · Follow week by week and you'll be job-ready before you know it!
              </p>
            </div>
            <button onClick={openChangePath}
              style={{
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border)", borderRadius: 8,
                padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}>
              🔄 Change Career Path
            </button>
          </motion.div>

          {errorMsg && (
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          {/* Progress Overview Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`, border: `1px solid ${ACCENT}44`, borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                  🎯 {careerTitle} Path
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Week {roadmap.currentWeek} of {totalWeeks}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: ACCENT }}>{progressPct}%</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Complete</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent-2)" }}>{weeksLeft}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Weeks Left</div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 14, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 99, background: ACCENT }} />
            </div>

            {progressPct === 100 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{ marginTop: 16, textAlign: "center", fontSize: 18, fontWeight: 700, color: "#22c55e" }}>
                🎉 Congratulations! You are Job-Ready!
              </motion.div>
            )}
          </motion.div>

          {/* Phase Cards (weeks grouped by 4, cosmetic only) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {phases.map((phase, idx) => {
              const pct = phaseProgress(phase);
              const status = getPhaseStatus(pct);
              const isOpen = expandedPhase === idx;

              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  style={{ border: `1px solid ${isOpen ? ACCENT + "55" : "var(--border)"}`, borderRadius: 14, overflow: "hidden", background: "var(--bg-card, var(--bg-secondary))" }}>

                  <div className="phase-header"
                    onClick={() => setExpandedPhase(isOpen ? -1 : idx)}
                    style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

                    <div style={{ width: 40, height: 40, borderRadius: 12, background: pct === 100 ? "#22c55e" : `${ACCENT}22`, border: `2px solid ${pct === 100 ? "#22c55e" : ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {pct === 100 ? "✅" : phase.emoji}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                          Phase {phase.phase}
                        </span>
                        <span style={{ fontSize: 11, color: status.color, fontWeight: 600, background: `${status.color}15`, padding: "2px 8px", borderRadius: 20, border: `1px solid ${status.color}30` }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{phase.weekRange} · {phase.weeks.length} weeks</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 80, background: "var(--border)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#22c55e" : ACCENT, borderRadius: 99, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "#22c55e" : ACCENT, minWidth: 35 }}>{pct}%</span>
                    </div>

                    <div style={{ color: "var(--text-secondary)", fontSize: 18, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

                          {phase.weeks.map((week, wIdx) => {
                            const isDone = week.isCompleted;
                            const isBusy = completingWeekId === week.id;
                            return (
                              <motion.div key={week.id} className="step-card"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: wIdx * 0.07 }}
                                style={{ background: isDone ? "rgba(34,197,94,0.06)" : "var(--bg-secondary)", border: `1px solid ${isDone ? "rgba(34,197,94,0.3)" : "var(--border)"}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>

                                <button className="check-btn" onClick={() => !isDone && completeWeek(week.id)}
                                  disabled={isDone || isBusy}
                                  style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${isDone ? "#22c55e" : ACCENT}`, background: isDone ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: isDone ? "default" : "pointer", flexShrink: 0, fontSize: 14, color: "#fff" }}>
                                  {isDone ? "✓" : isBusy ? "…" : ""}
                                </button>

                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none", marginBottom: 4 }}>
                                    Week {week.weekNumber}: {week.topic}
                                  </div>
                                  {week.description && (
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
                                      {week.description}
                                    </div>
                                  )}
                                  {week.resources && (
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 11, background: "rgba(99,102,241,0.1)", color: "var(--accent-1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 20, padding: "2px 10px" }}>
                                        📚 {week.resources}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Motivational Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 28, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🌟</div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              One step at a time — that's how dreams become reality!
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Click the checkbox next to each week when you complete it. Your progress is saved on the server.
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}