import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../api/client";



// ── Display metadata (icon/color per backend category) ───────
const CATEGORY_META = {
  WEB: { icon: "💻", color: "#6366f1" },
  MOBILE: { icon: "📱", color: "#06b6d4" },
  AI_ML: { icon: "🤖", color: "#8b5cf6" },
  DEVOPS: { icon: "⚙️", color: "#f59e0b" },
  CYBERSECURITY: { icon: "🛡️", color: "#ef4444" },
  DATA: { icon: "📊", color: "#10b981" },
  GAME: { icon: "🎮", color: "#ec4899" },
  OTHER: { icon: "🚀", color: "#6366f1" },
};

const DEMAND_META = {
  LOW: { label: "Low", color: "#ef4444" },
  MEDIUM: { label: "Medium", color: "#f59e0b" },
  HIGH: { label: "High", color: "#6366f1" },
  VERY_HIGH: { label: "Very High", color: "#22c55e" },
};

const getMatchColor = (pct) => {
  if (pct >= 70) return "#22c55e";
  if (pct >= 40) return "#f59e0b";
  return "#ef4444";
};

const getMatchLabel = (pct) => {
  if (pct >= 70) return "🟢 Strong Match";
  if (pct >= 40) return "🟡 Partial Match";
  return "🔴 Needs Work";
};

// ── Main Component ────────────────────────────────────────────
export default function CareerAnalysisPage() {
  const isMobile = window.innerWidth <= 768;
  const [userSkills, setUserSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [momentum, setMomentum] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, burnoutData, analyzeData, mySkillsData, pathsData] =
        await Promise.allSettled([
          apiFetch("/profile"),
          apiFetch("/burnout"),
          apiFetch("/careers/analyze"),
          apiFetch("/careers/my-skills"),
          apiFetch("/careers/paths"),
        ]);

      if (profileData.status === "fulfilled") setProfile(profileData.value);
      if (burnoutData.status === "fulfilled") setMomentum(burnoutData.value);

      // Skills now come from backend, not localStorage
      if (mySkillsData.status === "fulfilled" && Array.isArray(mySkillsData.value)) {
        setUserSkills(mySkillsData.value.map((s) => s.name));
      }

      // /careers/paths gives us descriptions to enrich the analyze results
      const paths =
        pathsData.status === "fulfilled" && Array.isArray(pathsData.value)
          ? pathsData.value
          : [];

      if (analyzeData.status === "fulfilled" && Array.isArray(analyzeData.value)) {
        const mapped = analyzeData.value.map((m) => {
          const meta = CATEGORY_META[m.careerCategory] || CATEGORY_META.OTHER;
          const demand = DEMAND_META[m.demandLevel] || DEMAND_META.HIGH;
          const pathInfo = paths.find((p) => p.title === m.careerTitle);
          return {
            title: m.careerTitle,
            icon: meta.icon,
            color: meta.color,
            desc: pathInfo?.description || "",
            match: Math.round(m.matchScore || 0),
            confidence: Math.round(m.confidenceScore || 0),
            avgSalary: m.avgSalary
              ? `$${Number(m.avgSalary).toLocaleString()} / year`
              : "—",
            demand: demand.label,
            demandColor: demand.color,
            matchedSkills: m.matchedSkills || [],
            missingSkills: m.missingSkills || [],
          };
        });
        setMatches(mapped);
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Careers sorted by match % (backend already computes match)
  const rankedCareers = [...matches].sort((a, b) => b.match - a.match);
  const topCareer = rankedCareers[0];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: isMobile ? 0 : 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent-1)" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
      <style>{`
        .career-card { transition: all 0.25s ease; cursor: pointer; }
        .career-card:hover { transform: translateY(-4px); border-color: var(--border-hover) !important; box-shadow: var(--shadow-accent); }
        .skill-pill { display: inline-flex; align-items: center; gap: 4px; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 500; }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 280, padding: isMobile ? "16px" : "32px", overflowY: "auto" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🎯 Career Analysis
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              See which careers match your skills — and what you need to reach your dream job.
            </p>
          </motion.div>

          {/* ── No skills warning ── */}
          {userSkills.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>💡</span>
              <div>
                <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 2 }}>Add your skills first!</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Go to <b>Settings → Skills</b> and add your skills to get accurate career matches.
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Top Pick Banner ── */}
          {userSkills.length > 0 && topCareer && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: `linear-gradient(135deg, ${topCareer.color}22, ${topCareer.color}08)`, border: `1px solid ${topCareer.color}44`, borderRadius: 16, padding: 24, marginBottom: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ fontSize: 52 }}>{topCareer.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ⭐ Your Best Career Match
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                  {topCareer.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{topCareer.desc}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: topCareer.color }}>{topCareer.match}%</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Match Score</div>
              </div>
            </motion.div>
          )}

          {/* ── Quick Stats Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
            <StatMini icon="🛠️" label="Skills You Have" value={userSkills.length} color="#6366f1" />
            <StatMini icon="⚡" label="Momentum Score" value={momentum ? `${Math.round(momentum.momentumScore)}%` : "—"} color="#06b6d4" />
            <StatMini icon="🔥" label="Burnout Risk" value={momentum?.burnoutRisk || "—"} color={momentum?.burnoutRisk === "LOW" ? "#22c55e" : momentum?.burnoutRisk === "HIGH" ? "#ef4444" : "#f59e0b"} />
          </div>

          {/* ── Career Cards ── */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              📋 All Career Matches
            </div>
            {rankedCareers.length === 0 && (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", fontStyle: "italic" }}>
                Career analysis couldn't be loaded. Please try refreshing the page.
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {rankedCareers.map((career, idx) => {
                const { missingSkills, matchedSkills } = career;
                const isOpen = selected === idx;

                return (
                  <motion.div key={career.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                    <div
                      className="career-card"
                      onClick={() => setSelected(isOpen ? null : idx)}
                      style={{ background: "var(--bg-card, var(--bg-secondary))", border: `1px solid ${isOpen ? career.color + "66" : "var(--border)"}`, borderRadius: 14, overflow: "hidden" }}>

                      {/* Card Header */}
                      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        {/* Rank Badge */}
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: idx === 0 ? "#f59e0b" : "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: idx === 0 ? "#fff" : "var(--text-secondary)", flexShrink: 0 }}>
                          {idx + 1}
                        </div>

                        <span style={{ fontSize: 28 }}>{career.icon}</span>

                        {/* Title + Desc */}
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                            {career.title}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{career.desc}</div>
                        </div>

                        {/* Match % + Progress Bar */}
                        <div style={{ minWidth: 120, textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
                            {getMatchLabel(career.match)}
                          </div>
                          <div style={{ background: "var(--border)", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 4 }}>
                            <div style={{ width: `${career.match}%`, height: "100%", background: getMatchColor(career.match), borderRadius: 99, transition: "width 0.8s ease" }} />
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: getMatchColor(career.match) }}>
                            {career.match}%
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ color: "var(--text-secondary)", fontSize: 18, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                          ▾
                        </div>
                      </div>

                      {/* Expanded Detail */}
                      {isOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ borderTop: "1px solid var(--border)", padding: "18px 20px", background: `${career.color}08` }}>

                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

                            {/* Skills you have */}
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 10 }}>
                                ✅ Skills You Already Have ({matchedSkills.length})
                              </div>
                              {matchedSkills.length === 0 ? (
                                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>None yet — add skills in Settings!</p>
                              ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {matchedSkills.map((s) => (
                                    <span key={s} className="skill-pill" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>✓ {s}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Skills to learn */}
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 10 }}>
                                📚 Skills to Learn ({missingSkills.length})
                              </div>
                              {missingSkills.length === 0 ? (
                                <p style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>🎉 You have all required skills!</p>
                              ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {missingSkills.map((s) => (
                                    <span key={s} className="skill-pill" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>+ {s}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Salary + Demand */}
                          <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
                            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>💰 Average Salary</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{career.avgSalary}</div>
                            </div>
                            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>📈 Job Demand</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: career.demandColor }}>{career.demand}</div>
                            </div>
                            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>⏳ Skills to Fill</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: career.color }}>{missingSkills.length} more needed</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Tip Box ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ marginTop: 28, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--accent-1)", marginBottom: 4 }}>Pro Tip</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Click on any career card to see exactly which skills you have and which ones to learn next.
                The higher the match %, the closer you are to landing that job! Focus on your <b style={{ color: "var(--text-primary)" }}>top missing skills</b> first.
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// ── Mini Stat Card ────────────────────────────────────────────
function StatMini({ icon, label, value, color }) {
  return (
    <div style={{ background: "var(--bg-card, var(--bg-secondary))", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}