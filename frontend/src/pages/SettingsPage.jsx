import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../api/client";



// ===================== CONSTANTS =====================
const EDUCATION_OPTIONS = [
  "SSC", "HSC", "Diploma",
  "Bachelor's (Ongoing)", "Bachelor's (Complete)",
  "Master's (Ongoing)", "Master's (Complete)",
  "PhD", "Self-taught",
];

const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift",
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "Node.js", "Express.js", "Spring Boot",
  "Django", "FastAPI", "Flask", "Laravel", "Ruby on Rails",
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "SQLite",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Linux", "Git", "GitHub", "CI/CD",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SASS",
  "REST API", "GraphQL", "WebSocket", "Microservices",
  "Figma", "Adobe XD", "UI/UX Design", "Canva",
  "Data Structures", "Algorithms", "System Design", "Problem Solving",
];

const TABS = ["Profile", "Skills", "Account"];

// ===================== MAIN COMPONENT =====================
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ text: "", type: "" });
  const [isMobile, setIsMobile] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    age: "",
    phone: "",
    location: "",
    educationLevel: "",
    institution: "",
    graduationYear: "",
    bio: "",
    dailyStudyHours: 2,
    careerGoal: "",
    experienceYears: 0,
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  const [skills, setSkills] = useState([]);        // [{ id, name, category }] — from backend
  const [allSkills, setAllSkills] = useState([]);  // master skill list — from backend
  const [skillMsg, setSkillMsg] = useState("");
  const [skillLoading, setSkillLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skillInputRef = useRef(null);

  // Dynamic window width resize tracker
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (skillInputRef.current && !skillInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadProfile = async () => {
    try {
       const userData = localStorage.getItem("careeros_user");
    if (userData) {
      const user = JSON.parse(userData);
      setProfile((prev) => ({ ...prev, fullName: user.fullName || "" }));
    }
      const data = await apiFetch("/profile");
      setProfile((prev) => ({
        ...prev,
        fullName: data.fullName || "",
        age: data.age || "",
        phone: data.phone || "",
        location: data.location || "",
        educationLevel: data.educationLevel || "",
        institution: data.institution || "",
        graduationYear: data.graduationYear || "",
        bio: data.bio || "",
        dailyStudyHours: data.dailyStudyHours || 2,
        careerGoal: data.careerGoal || "",
        experienceYears: data.experienceYears || 0,
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        portfolioUrl: data.portfolioUrl || "",
      }));
    } catch (e) {
      console.log("Profile load error:", e.message);
    }
  };

  // ===== SKILLS: BACKEND SYNC =====
  const loadSkills = async () => {
    try {
      const [mySkills, masterSkills] = await Promise.all([
        apiFetch("/careers/my-skills"),
        apiFetch("/careers/skills"),
      ]);
      const master = Array.isArray(masterSkills) ? masterSkills : [];
      const mine = Array.isArray(mySkills) ? mySkills : [];
      setAllSkills(master);
      setSkills(mine);
      await migrateLocalSkills(mine, master);
    } catch (e) {
      console.log("Skills load error:", e.message);
    }
  };

  // One-time migration: push old localStorage skills to backend, then clear
  const migrateLocalSkills = async (mine, master) => {
    const saved = localStorage.getItem("careeros_skills");
    if (!saved) return;
    let names = [];
    try { names = JSON.parse(saved); } catch { names = []; }

    const mineNames = new Set(mine.map((s) => s.name.toLowerCase()));
    let migratedAny = false;

    for (const name of names) {
      const lower = String(name).toLowerCase();
      if (mineNames.has(lower)) continue;
      const found = master.find((s) => s.name.toLowerCase() === lower);
      try {
        // If skill exists in master list send skillId, otherwise send skillName
        // (backend will find-or-create it)
        const payload = found ? { skillId: found.id } : { skillName: String(name) };
        await apiFetch("/careers/skills/add", "POST", payload);
        migratedAny = true;
      } catch { /* skip failures silently during migration */ }
    }

    localStorage.removeItem("careeros_skills");

    if (migratedAny) {
      try {
        const refreshed = await apiFetch("/careers/my-skills");
        if (Array.isArray(refreshed)) setSkills(refreshed);
      } catch { /* ignore */ }
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

 const saveProfile = async () => {
  setLoading(true);
  setSaveMsg({ text: "", type: "" });
  try {
  
    const payload = {};
 
    if (profile.age) payload.age = parseInt(profile.age);
    if (profile.phone) payload.phone = profile.phone;
    if (profile.location) payload.location = profile.location;
    if (profile.educationLevel) payload.educationLevel = profile.educationLevel;
    if (profile.institution) payload.institution = profile.institution;
    if (profile.graduationYear) payload.graduationYear = parseInt(profile.graduationYear);
    if (profile.bio) payload.bio = profile.bio;
    if (profile.careerGoal) payload.careerGoal = profile.careerGoal;
    if (profile.linkedinUrl) payload.linkedinUrl = profile.linkedinUrl;
    if (profile.githubUrl) payload.githubUrl = profile.githubUrl;
    if (profile.portfolioUrl) payload.portfolioUrl = profile.portfolioUrl;
 
    payload.dailyStudyHours = parseFloat(profile.dailyStudyHours) || 2.0;
    payload.experienceYears = parseInt(profile.experienceYears) || 0;
 
    await apiFetch("/profile", "POST", payload);
    setSaveMsg({ text: "Profile saved successfully!", type: "success" });
  } catch (e) {
    setSaveMsg({ text: `Failed: ${e.message}`, type: "error" });
  } finally {
    setLoading(false);
    setTimeout(() => setSaveMsg({ text: "", type: "" }), 3000);
  }
};
  // ===== PROFILE COMPLETION LOGIC =====
  const getMissingFields = () => {
    const missing = [];
    if (!profile.phone) missing.push("Phone");
    if (!profile.location) missing.push("Location");
    if (!profile.educationLevel) missing.push("Education Level");
    if (!profile.institution) missing.push("Institution");
    if (!profile.bio) missing.push("Bio");
    if (!profile.careerGoal) missing.push("Career Goal");
    return missing;
  };

  const calculateCompletion = () => {
    const fields = ["phone", "location", "educationLevel", "institution", "bio", "careerGoal"];
    const filled = fields.filter(f => profile[f] && String(profile[f]).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  const getCompletionColor = () => {
    if (completionPercent >= 80) return "#22c55e"; // Green
    if (completionPercent >= 50) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  // ===== SKILL HANDLERS =====
  const ownedNames = new Set(skills.map((s) => s.name.toLowerCase()));

  // Suggestion pool = backend master list + static suggestions (deduped)
  const suggestionPool = [
    ...new Set([...allSkills.map((s) => s.name), ...SKILL_SUGGESTIONS]),
  ];

  const filteredSuggestions = suggestionPool.filter(
    (s) =>
      newSkill.trim().length > 0 &&
      s.toLowerCase().includes(newSkill.toLowerCase()) &&
      !ownedNames.has(s.toLowerCase())
  );

  const addSkill = async (skillName) => {
    const trimmed = (skillName || newSkill).trim();
    if (!trimmed || skillLoading) return;
    if (ownedNames.has(trimmed.toLowerCase())) return;

    const found = allSkills.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    setSkillLoading(true);
    setSkillMsg("");
    try {
      // Known skill → send skillId; new/custom skill → send skillName
      const payload = found ? { skillId: found.id } : { skillName: trimmed };
      await apiFetch("/careers/skills/add", "POST", payload);

      // Reload my skills from backend (source of truth)
      const refreshed = await apiFetch("/careers/my-skills");
      if (Array.isArray(refreshed)) setSkills(refreshed);

      // Custom skill was created server-side → refresh master list too
      if (!found) {
        const master = await apiFetch("/careers/skills");
        if (Array.isArray(master)) setAllSkills(master);
      }

      setNewSkill("");
      setShowSuggestions(false);
    } catch (e) {
      setSkillMsg(`Failed to add skill: ${e.message}`);
      setTimeout(() => setSkillMsg(""), 4000);
    } finally {
      setSkillLoading(false);
    }
  };

  const removeSkill = async (skill) => {
    if (skillLoading) return;
    setSkillLoading(true);
    setSkillMsg("");
    try {
      await apiFetch("/careers/skills/remove", "POST", { skillId: skill.id });
      setSkills((prev) => prev.filter((s) => s.id !== skill.id));
    } catch (e) {
      setSkillMsg(`Failed to remove skill: ${e.message}`);
      setTimeout(() => setSkillMsg(""), 4000);
    } finally {
      setSkillLoading(false);
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  // ===================== RENDER =====================
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
    }}>
      <style>{`
        .settings-input {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .settings-input:focus {
          border-color: var(--accent-1) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .settings-input::placeholder { color: var(--text-secondary); }
        select.settings-input option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .settings-card {
          background: var(--glass-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }
        .save-btn:hover { background: #4f46e5 !important; transform: translateY(-1px); }
        .sugg-item:hover { background: var(--bg-secondary) !important; }
        .remove-skill:hover { opacity: 0.6; }
        .tab-btn:hover { color: var(--text-primary) !important; }
      `}</style>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 280,
        padding: isMobile ? "16px" : "32px",
        overflowY: "auto",
      }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>

          {/* HEADING */}
          <h1 style={{
            fontSize: "28px", fontWeight: "800", marginBottom: "6px",
            background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            ⚙️ Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "14px" }}>
            Manage your profile, skills and account preferences.
          </p>

          {/* TABS */}
          <div style={{
            display: "flex", gap: "6px", marginBottom: "28px",
            background: "var(--bg-secondary)", padding: "6px",
            borderRadius: "12px", width: "fit-content",
          }}>
            {TABS.map((tab) => (
              <button key={tab} className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 22px", borderRadius: "8px", border: "none",
                  cursor: "pointer", fontWeight: activeTab === tab ? "600" : "400",
                  fontSize: "14px", fontFamily: "inherit",
                  background: activeTab === tab ? "var(--accent-1)" : "transparent",
                  color: activeTab === tab ? "#fff" : "var(--text-secondary)",
                  transition: "all 0.2s",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* ========== PROFILE TAB ========== */}
          {activeTab === "Profile" && (
            <>
              {/* COMPLETION DASHBOARD */}
              <div className="settings-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div className="section-title" style={{ marginBottom: "4px" }}>📊 Profile Completion</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {completionPercent >= 80
                        ? "Great! Your profile is looking strong 🎉"
                        : completionPercent >= 50
                        ? "Almost there! Fill in the remaining fields."
                        : "Complete your profile for better recommendations."}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", fontWeight: "800", color: getCompletionColor() }}>
                      {completionPercent}%
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: "var(--border)", borderRadius: "99px", height: "10px", overflow: "hidden", marginBottom: "14px" }}>
                  <div style={{
                    width: `${completionPercent}%`, height: "100%", borderRadius: "99px",
                    background: getCompletionColor(), transition: "width 0.6s ease",
                  }} />
                </div>

                {/* Missing Fields */}
                {getMissingFields().length > 0 && (
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "500" }}>
                      📝 Missing fields:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {getMissingFields().map((f) => (
                        <span key={f} style={{
                          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: "20px", padding: "2px 10px", fontSize: "12px", color: "#f87171",
                        }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* BASIC INFO */}
              <div className="settings-card">
                <div className="section-title">👤 Basic Information</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <Field label="Full Name">
                    <input className="settings-input" value={profile.fullName}
                      onChange={(e) => handleProfileChange("fullName", e.target.value)} placeholder="Your full name" />
                  </Field>
                  <Field label="Age">
                    <input className="settings-input" type="number" value={profile.age}
                      onChange={(e) => handleProfileChange("age", e.target.value)} placeholder="e.g. 22" />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <Field label="Phone">
                    <input className="settings-input" value={profile.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)} placeholder="+880..." />
                  </Field>
                  <Field label="Location">
                    <input className="settings-input" value={profile.location}
                      onChange={(e) => handleProfileChange("location", e.target.value)} placeholder="e.g. Dhaka, Bangladesh" />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea className="settings-input" style={{ resize: "vertical", minHeight: "90px" }}
                    value={profile.bio} onChange={(e) => handleProfileChange("bio", e.target.value)}
                    placeholder="Tell something about yourself..." />
                </Field>
              </div>

              {/* EDUCATION */}
              <div className="settings-card">
                <div className="section-title">🎓 Education</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <Field label="Education Level">
                    <select className="settings-input" value={profile.educationLevel}
                      onChange={(e) => handleProfileChange("educationLevel", e.target.value)}>
                      <option value="">Select level</option>
                      {EDUCATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Institution">
                    <input className="settings-input" value={profile.institution}
                      onChange={(e) => handleProfileChange("institution", e.target.value)} placeholder="University / College name" />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                  <Field label="Graduation Year">
                    <input className="settings-input" type="number" value={profile.graduationYear}
                      onChange={(e) => handleProfileChange("graduationYear", e.target.value)} placeholder="e.g. 2025" />
                  </Field>
                  <Field label="Experience (Years)">
                    <input className="settings-input" type="number" value={profile.experienceYears}
                      onChange={(e) => handleProfileChange("experienceYears", e.target.value)} placeholder="0" />
                  </Field>
                </div>
              </div>

              {/* CAREER */}
              <div className="settings-card">
                <div className="section-title">🚀 Career Goals</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                  <Field label="Career Goal">
                    <input className="settings-input" value={profile.careerGoal}
                      onChange={(e) => handleProfileChange("careerGoal", e.target.value)} placeholder="e.g. Software Engineer at Google" />
                  </Field>
                  <Field label="Daily Study Hours">
                    <input className="settings-input" type="number" step="0.5" min="0" max="24"
                      value={profile.dailyStudyHours}
                      onChange={(e) => handleProfileChange("dailyStudyHours", e.target.value)} placeholder="e.g. 3" />
                  </Field>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              <div className="settings-card">
                <div className="section-title">🔗 Social Links</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <Field label="LinkedIn URL">
                    <input className="settings-input" value={profile.linkedinUrl}
                      onChange={(e) => handleProfileChange("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourname" />
                  </Field>
                  <Field label="GitHub URL">
                    <input className="settings-input" value={profile.githubUrl}
                      onChange={(e) => handleProfileChange("githubUrl", e.target.value)} placeholder="https://github.com/yourname" />
                  </Field>
                  <Field label="Portfolio URL">
                    <input className="settings-input" value={profile.portfolioUrl}
                      onChange={(e) => handleProfileChange("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.com" />
                  </Field>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button className="save-btn"
                style={{
                  background: "var(--accent-1)", color: "#fff", border: "none",
                  borderRadius: "10px", padding: "12px 32px", fontSize: "15px",
                  fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit",
                }}
                onClick={saveProfile} disabled={loading}>
                {loading ? "Saving..." : "💾 Save Profile"}
              </button>

              {saveMsg.text && (
                <div style={{
                  marginTop: "12px", padding: "10px 16px", borderRadius: "8px", fontSize: "14px",
                  background: saveMsg.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: saveMsg.type === "success" ? "#22c55e" : "#ef4444",
                  border: `1px solid ${saveMsg.type === "success" ? "#22c55e" : "#ef4444"}`,
                }}>
                  {saveMsg.text}
                </div>
              )}
            </>
          )}

          {/* ========== SKILLS TAB ========== */}
          {activeTab === "Skills" && (
            <div className="settings-card">
              <div className="section-title">🛠️ Your Skills</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px", marginTop: "-10px" }}>
                Add skills to improve career matching and roadmap accuracy.
              </p>

              {/* Skill Input */}
              <div ref={skillInputRef} style={{ position: "relative", marginBottom: "24px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input className="settings-input" style={{ flex: 1 }}
                    value={newSkill}
                    onChange={(e) => { setNewSkill(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type a skill (e.g. React, Python)..." />
                  <button
                    onClick={() => addSkill()}
                    disabled={skillLoading}
                    style={{
                      background: "var(--accent-1)", color: "#fff", border: "none",
                      borderRadius: "10px", padding: "10px 22px", fontSize: "14px",
                      fontWeight: "600", cursor: skillLoading ? "not-allowed" : "pointer",
                      opacity: skillLoading ? 0.7 : 1,
                      whiteSpace: "nowrap", fontFamily: "inherit",
                    }}>
                    {skillLoading ? "..." : "+ Add"}
                  </button>
                </div>

                {skillMsg && (
                  <div style={{
                    marginTop: "10px", padding: "8px 14px", borderRadius: "8px",
                    fontSize: "13px", background: "rgba(239,68,68,0.12)",
                    color: "#ef4444", border: "1px solid #ef4444",
                  }}>
                    {skillMsg}
                  </div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: "90px",
                    background: "var(--bg-primary)", border: "1px solid var(--border)",
                    borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    zIndex: 100, maxHeight: "200px", overflowY: "auto",
                  }}>
                    {filteredSuggestions.slice(0, 8).map((s) => (
                      <div key={s} className="sugg-item"
                        onClick={() => addSkill(s)}
                        style={{
                          padding: "9px 14px", fontSize: "13px", cursor: "pointer",
                          color: "var(--text-primary)", borderBottom: "1px solid var(--border)",
                          transition: "background 0.15s",
                        }}>
                        ✦ {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Skills */}
              {newSkill.trim() === "" && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    🔥 Popular Skills
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {["JavaScript", "Python", "React", "Java", "SQL", "Docker", "Machine Learning", "Node.js", "TypeScript", "AWS"]
                      .filter((s) => !ownedNames.has(s.toLowerCase()))
                      .map((s) => (
                        <button key={s} onClick={() => addSkill(s)}
                          style={{
                            background: "transparent", border: "1px dashed var(--border)",
                            borderRadius: "20px", padding: "5px 14px", fontSize: "13px",
                            color: "var(--text-secondary)", cursor: "pointer",
                            transition: "all 0.2s", fontFamily: "inherit",
                          }}>
                          + {s}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Added Skills */}
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Your Skills ({skills.length})
              </div>
              {skills.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
                  No skills added yet. Type above or click a popular skill!
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {skills.map((skill) => (
                    <div key={skill.id} style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
                      borderRadius: "20px", padding: "5px 12px 5px 14px",
                      fontSize: "13px", color: "var(--accent-1)",
                    }}>
                      <span>{skill.name}</span>
                      <button className="remove-skill"
                        onClick={() => removeSkill(skill)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#ef4444", fontSize: "14px", lineHeight: "1",
                          padding: "0", display: "flex", alignItems: "center",
                          transition: "opacity 0.2s",
                        }} title="Remove">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== ACCOUNT TAB ========== */}
          {activeTab === "Account" && (
            <div className="settings-card">
              <div className="section-title">🔐 Account Settings</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Password change and account management — coming soon!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ===== HELPER =====
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}