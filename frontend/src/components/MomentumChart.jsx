import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useTheme } from "../ThemeContext";
import { TrendingUp } from "lucide-react";
import { getSessions } from "../api/dashboard";

const MomentumChart = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMomentumData = async () => {
      try {
        const response = await getSessions();
        if (response.success && response.data.length > 0) {
          const sessions = [...response.data].reverse(); 

         
          const grouped = [];
          const chunkSize = Math.max(1, Math.ceil(sessions.length / 7));
          for (let i = 0; i < sessions.length; i += chunkSize) {
            const chunk = sessions.slice(i, i + chunkSize);
            const avgScore =
              chunk.reduce((sum, s) => sum + (s.productivityScore || 0), 0) / chunk.length;
            grouped.push({
              week: `Week ${grouped.length + 1}`,
              momentum: Math.round(avgScore),
              consistency: Math.round(avgScore),
            });
          }
          setData(grouped);
        } else {
          setData([]); 
        }
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMomentumData();
  }, []);

  const lineColor = isDark ? "#6366f1" : "#6366f1";
  const areaColor = isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.05)";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)";
  const textColor = isDark ? "#8892a4" : "#64748b";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass"
          style={{
            borderRadius: 12,
            padding: "12px 16px",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
            {payload[0].payload.week}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>
            {payload[0].value}%
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass"
      style={{
        borderRadius: 20,
        padding: 24,
        background: isDark
          ? "linear-gradient(135deg, rgba(13,21,48,0.8) 0%, rgba(9,13,31,0.8) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(238,242,255,0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.12)"}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Shine Effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 50%, rgba(139,92,246,0.05) 100%)"
            : "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} color="white" />
            </motion.div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Momentum Trend
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Your 7-week momentum progression
          </p>
        </div>

        {/* Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
            border: "1px solid var(--border-hover)",
          }}
        >
         <p style={{ fontSize: 12, color: "var(--accent-1)", fontWeight: 600 }}>
  {data.length >= 2
    ? `${data[data.length - 1].momentum - data[0].momentum >= 0 ? "+" : ""}${data[data.length - 1].momentum - data[0].momentum}% Growth`
    : "No data yet"}
</p>
        </motion.div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: 300,
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
            }}
          >
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
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />

              <XAxis
                dataKey="week"
                stroke={textColor}
                style={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke={textColor}
                style={{ fontSize: 12 }}
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="momentum"
                stroke={lineColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMomentum)"
                dot={{ fill: lineColor, r: 4, strokeWidth: 2, stroke: isDark ? "#050816" : "#f8faff" }}
                activeDot={{
                  r: 6,
                  fill: lineColor,
                  filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginTop: 20,
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          position: "relative",
          zIndex: 2,
        }}
      >
<StatItem label="Current" value={data.length ? `${data[data.length - 1].momentum}%` : "0%"} color="#6366f1" />
<StatItem label="Average" value={data.length ? `${Math.round(data.reduce((s, d) => s + d.momentum, 0) / data.length)}%` : "0%"} color="#8b5cf6" />
<StatItem label="Peak" value={data.length ? `${Math.max(...data.map((d) => d.momentum))}%` : "0%"} color="#06b6d4" />
      </motion.div>
    </motion.div>
  );
};

const StatItem = ({ label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    style={{
      padding: 12,
      borderRadius: 10,
      background: `rgba(${color === "#6366f1" ? "99,102,241" : color === "#8b5cf6" ? "139,92,246" : "6,182,212"},0.08)`,
      border: `1px solid rgba(${color === "#6366f1" ? "99,102,241" : color === "#8b5cf6" ? "139,92,246" : "6,182,212"},0.12)`,
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
    }}
  >
    <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
      {label}
    </p>
    <p style={{ fontSize: 16, fontWeight: 800, color }} >
      {value}
    </p>
  </motion.div>
);

export default MomentumChart;