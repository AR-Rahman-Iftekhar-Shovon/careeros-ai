import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeContext";
import { AlertCircle, Shield } from "lucide-react";
import { getBurnoutStatus } from "../api/dashboard";

const BurnoutRiskGauge = () => {
  const { isDark } = useTheme();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBurnoutData = async () => {
      try {
        const response = await getBurnoutStatus();
        if (response.success) {
          setRiskData(response.data);
        }
      } catch (err) {
        setError("Failed to fetch burnout data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBurnoutData();
  }, []);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass"
        style={{
          borderRadius: 20,
          padding: 24,
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        {error}
      </motion.div>
    );
  }

  const getRiskColor = (risk) => {
    if (risk === "LOW") return { color: "#22c55e", label: "Low", icon: Shield };
    if (risk === "MEDIUM") return { color: "#f59e0b", label: "Medium", icon: AlertCircle };
    return { color: "#ef4444", label: "High", icon: AlertCircle };
  };

  const risk = riskData ? getRiskColor(riskData.burnoutRisk) : { color: "#6366f1", label: "Loading", icon: Shield };
  const RiskIcon = risk.icon;
  const riskLevel = riskData?.momentumScore || 0;

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (riskLevel / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass"
      style={{
        borderRadius: 20,
        padding: 24,
        background: isDark
          ? "linear-gradient(135deg, rgba(13,21,48,0.8) 0%, rgba(9,13,31,0.8) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(238,242,255,0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isDark ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.12)"}`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 380,
      }}
    >
      {/* Animated background */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: isDark
            ? `radial-gradient(circle, rgba(${risk.color === "#22c55e" ? "34,197,94" : risk.color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.12) 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(${risk.color === "#22c55e" ? "34,197,94" : risk.color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
          top: -50,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          position: "relative",
          zIndex: 2,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Burnout Risk
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Your current wellbeing status
        </p>
      </motion.div>

      {/* Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          position: "relative",
          zIndex: 2,
          marginBottom: 20,
        }}
      >
        <svg width={220} height={220} style={{ transform: "scaleX(-1)" }}>
          {/* Background circle */}
          <circle
            cx={110}
            cy={110}
            r={90}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.1)"}
            strokeWidth={8}
          />

          {/* Progress circle */}
          {!loading && (
            <motion.circle
              cx={110}
              cy={110}
              r={90}
              fill="none"
              stroke={risk.color}
              strokeWidth={8}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: "easeOut" }}
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px rgba(99,102,241,0.4))"
            />
          )}

          {/* Center circle */}
          <circle cx={110} cy={110} r={70} fill="var(--bg-secondary)" />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent-1)",
              }}
            />
          ) : (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: `rgba(${risk.color === "#22c55e" ? "34,197,94" : risk.color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.15)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <RiskIcon size={24} color={risk.color} />
              </motion.div>
              <p style={{ fontSize: 28, fontWeight: 800, color: risk.color, marginBottom: 4 }}>
                {Math.round(riskData?.momentumScore || 0)}%
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                {risk.label} Risk
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {!loading && riskData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "16px",
            borderTop: "1px solid var(--border)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
              Consistency
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-1)" }}>
              {Math.round(riskData.consistencyRate)}%
            </p>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
              Current Streak
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-2)" }}>
              {riskData.currentStreak} days
            </p>
          </div>
        </motion.div>
      )}

      {/* Suggestion */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: `rgba(${risk.color === "#22c55e" ? "34,197,94" : risk.color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.08)`,
            border: `1px solid rgba(${risk.color === "#22c55e" ? "34,197,94" : risk.color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.2)`,
            position: "relative",
            zIndex: 2,
            marginTop: 12,
            width: "100%",
          }}
        >
          <p style={{ fontSize: 12, color: risk.color, fontWeight: 600 }}>
            {riskData?.burnoutRisk === "LOW"
              ? "Keep maintaining your healthy study schedule!"
              : riskData?.burnoutRisk === "MEDIUM"
              ? "Consider taking breaks between sessions. You're doing well!"
              : "Take a break. Rest is important for long-term progress."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BurnoutRiskGauge;