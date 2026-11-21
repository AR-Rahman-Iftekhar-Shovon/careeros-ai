import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { TrendingUp, Zap, Target, Award, Calendar } from "lucide-react";
import MomentumChart from "../components/MomentumChart";
import CareerMatchChart from "../components/CareerMatchChart";
import BurnoutRiskGauge from "../components/BurnoutRiskGauge";
import SessionHeatmap from "../components/SessionHeatmap";

const API_BASE = "http://localhost:8080/api";

const apiFetch = async (endpoint) => {
  const token = localStorage.getItem("careeros_token");
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    momentumScore: "--",
    matchScore: "--",
    streak: "--",
    sessions: "--",
    burnoutRisk: "--",
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("careeros_user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
     const res = await apiFetch("/burnout");
const data = res.data; 
setStats({
  momentumScore: Math.round(data.momentumScore ?? 0),
  matchScore: Math.round(data.consistencyRate ?? 0),
  streak: data.currentStreak ?? 0,
  sessions: "--",
  burnoutRisk: data.burnoutRisk ?? "N/A",
});
    } catch (e) {
      console.log("Stats fetch error:", e.message);
      
      setStats({
        momentumScore: 0,
        matchScore: 0,
        streak: 0,
        sessions: 0,
        burnoutRisk: "N/A",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const getBurnoutColor = (risk) => {
    if (risk === "LOW") return "#22c55e";
    if (risk === "MEDIUM") return "#f59e0b";
    if (risk === "HIGH") return "#ef4444";
    return "#6b7280";
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg-primary)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent-1)"
          }}
        />
      </div>
    );
  }

  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 280,
        padding: isMobile ? "16px" : "32px",
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
            Welcome back, {user?.fullName?.split(" ").slice(0, 2).join(" ")}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Your AI-powered career dashboard
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: 16, marginBottom: 32
        }}>
          <StatCard
            icon={Zap}
            label="Momentum Score"
            value={statsLoading ? "..." : stats.momentumScore}
            unit="%"
            color="#6366f1"
            delay={0}
          />
          <StatCard
            icon={Target}
            label="Consistency Rate"
            value={statsLoading ? "..." : stats.matchScore}
            unit="%"
            color="#8b5cf6"
            delay={0.1}
          />
          <StatCard
            icon={Award}
            label="Current Streak"
            value={statsLoading ? "..." : stats.streak}
            unit="days"
            color="#06b6d4"
            delay={0.2}
          />
          <StatCard
            icon={Calendar}
            label="Burnout Risk"
            value={statsLoading ? "..." : stats.burnoutRisk}
            unit=""
            color={getBurnoutColor(stats.burnoutRisk)}
            delay={0.3}
          />
        </div>

        {/* Charts Area */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "2fr 1fr",
          gap: 24, marginBottom: 32
        }}>
          <MomentumChart />
          <BurnoutRiskGauge />
        </div>

        {/* Career Matches */}
        <div style={{ marginBottom: 32 }}>
          <CareerMatchChart />
        </div>

        {/* Session Heatmap */}
        <SessionHeatmap />

      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, unit, color, delay }) => {
  const getRgb = (hex) => {
    const map = {
      "#6366f1": "99,102,241",
      "#8b5cf6": "139,92,246",
      "#06b6d4": "6,182,212",
      "#22c55e": "34,197,94",
      "#f59e0b": "245,158,11",
      "#ef4444": "239,68,68",
      "#6b7280": "107,114,128",
    };
    return map[hex] || "99,102,241";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass"
      whileHover={{ scale: 1.02 }}
      style={{
        borderRadius: 16, padding: 20, cursor: "pointer",
        transition: "all 0.3s ease", display: "flex",
        flexDirection: "column", justifyContent: "space-between", minHeight: 140
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `rgba(${getRgb(color)},0.15)`,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
          {label}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: typeof value === "string" && value.length > 5 ? 18 : 28, fontWeight: 800, color: color }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{unit}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;