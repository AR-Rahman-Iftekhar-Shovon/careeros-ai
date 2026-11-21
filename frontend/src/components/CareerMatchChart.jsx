import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "../ThemeContext";
import { Target, Sparkles } from "lucide-react";
import { getCareerAnalysis } from "../api/dashboard";

const CareerMatchChart = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        const response = await getCareerAnalysis();
        if (response.success) {
          const careerMatches = response.data.map((match) => ({
            name: match.careerTitle,
            match: Math.round(match.matchScore),
            salary: match.avgSalary / 1000, // Convert to K
            demand: match.demandLevel,
            missingSkills: match.missingSkillsCount,
          }));
          setData(careerMatches.slice(0, 5)); // Top 5 careers
        }
      } catch (err) {
        setError("Failed to fetch career data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerData();
  }, []);

  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"];
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)";
  const textColor = isDark ? "#8892a4" : "#64748b";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass"
          style={{
            borderRadius: 14,
            padding: "14px 16px",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
            {payload[0].payload.name}
          </p>
          <p style={{ fontSize: 12, color: "var(--accent-1)", marginBottom: 4 }}>
            Match: {payload[0].value}%
          </p>
          <p style={{ fontSize: 12, color: "var(--accent-2)", marginBottom: 4 }}>
            Salary: ${Math.round(payload[0].payload.salary)}K
          </p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Missing: {payload[0].payload.missingSkills} skills
          </p>
        </motion.div>
      );
    }
    return null;
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass"
      style={{
        borderRadius: 20,
        padding: 24,
        background: isDark
          ? "linear-gradient(135deg, rgba(9,13,31,0.8) 0%, rgba(13,21,48,0.8) 100%)"
          : "linear-gradient(135deg, rgba(238,242,255,0.95) 0%, rgba(255,255,255,0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isDark ? "rgba(139,92,246,0.1)" : "rgba(99,102,241,0.12)"}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated background element */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          top: "-50%",
          right: "-50%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          position: "relative",
          zIndex: 2,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.4 }}
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
                <Target size={18} color="white" />
              </motion.div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Career Matches
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Top matching career paths for you
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Sparkles size={20} color="var(--accent-1)" />
          </motion.div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: 320,
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 320,
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
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke={textColor}
                style={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke={textColor}
                style={{ fontSize: 11 }}
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.1)" }} />

              <Bar dataKey="match" radius={[12, 12, 0, 0]} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    opacity={selectedCareer === null || selectedCareer === index ? 1 : 0.3}
                    style={{
                      transition: "opacity 0.3s ease",
                      filter: selectedCareer === index ? "drop-shadow(0 0 8px rgba(99,102,241,0.6))" : "none",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Career Details */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid var(--border)",
            position: "relative",
            zIndex: 2,
          }}
        >
          {data.map((career, index) => (
            <motion.div
              key={index}
              onClick={() => setSelectedCareer(selectedCareer === index ? null : index)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: 12,
                borderRadius: 12,
                background: `rgba(${colors[index] === "#6366f1" ? "99,102,241" : colors[index] === "#8b5cf6" ? "139,92,246" : colors[index] === "#06b6d4" ? "6,182,212" : colors[index] === "#ec4899" ? "236,72,153" : "245,158,11"},0.08)`,
                border: `1px solid ${selectedCareer === index ? "var(--border-hover)" : "var(--border)"}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colors[index],
                  }}
                />
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
                  {career.name}
                </p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: colors[index], marginBottom: 4 }}>
                {career.match}%
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                {career.demand}
              </p>
              <p style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 4 }}>
                {career.missingSkills} missing
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CareerMatchChart;