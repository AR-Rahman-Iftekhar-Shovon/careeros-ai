import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeContext";
import { Calendar, Zap } from "lucide-react";
import { getSessions } from "../api/dashboard";

const SessionHeatmap = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [totalSessions, setTotalSessions] = useState(0);

 useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const response = await getSessions();
        const sessions = response.success ? response.data : [];

        // Session গুলোকে date দিয়ে map করা (date → session count, hours)
        const sessionMap = {};
        sessions.forEach((s) => {
          const dateKey = s.sessionDate; // "YYYY-MM-DD" format
          if (!sessionMap[dateKey]) {
            sessionMap[dateKey] = { count: 0, minutes: 0 };
          }
          sessionMap[dateKey].count += 1;
          sessionMap[dateKey].minutes += s.durationMinutes || 0;
        });

        // গত ১২ সপ্তাহের গ্রিড বানানো
        const weeks = [];
        for (let week = 0; week < 12; week++) {
          const weekData = [];
          for (let day = 0; day < 7; day++) {
            const date = new Date();
            date.setDate(date.getDate() - (11 - week) * 7 - (6 - day));
            const dateKey = date.toISOString().split("T")[0];
            const dayInfo = sessionMap[dateKey] || { count: 0, minutes: 0 };
            weekData.push({
              date: dateKey,
              sessions: dayInfo.count,
              hours: Math.round((dayInfo.minutes / 60) * 10) / 10,
            });
          }
          weeks.push(weekData);
        }
        setData(weeks);
        setTotalSessions(sessions.length);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  const getColor = (sessions) => {
    if (sessions === 0) return isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)";
    if (sessions === 1) return "rgba(99,102,241,0.3)";
    if (sessions === 2) return "rgba(99,102,241,0.5)";
    if (sessions === 3) return "rgba(99,102,241,0.7)";
    if (sessions === 4) return "var(--gradient)";
    return "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass"
      style={{
        borderRadius: 20,
        padding: 24,
        background: isDark
          ? "linear-gradient(135deg, rgba(9,13,31,0.8) 0%, rgba(13,21,48,0.8) 100%)"
          : "linear-gradient(135deg, rgba(238,242,255,0.95) 0%, rgba(255,255,255,0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.12)"}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
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
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
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
              <Calendar size={18} color="white" />
            </motion.div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Study Activity
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Last 12 weeks of learning sessions
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
            Total Sessions
          </p>
         <p style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-1)" }}>
  {totalSessions}
</p>
        </div>
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          overflowX: "auto",
          paddingBottom: 12,
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 150,
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
          <div style={{ display: "flex", gap: 3, minWidth: "100%" }}>
            {/* Day labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 8 }}>
              <div style={{ height: 24 }} />
              {dayLabels.map((label) => (
                <div
                  key={label}
                  style={{
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {data.map((week, weekIndex) => (
              <motion.div
                key={weekIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: weekIndex * 0.02 }}
                style={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                {weekIndex === 0 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-secondary)",
                      height: 24,
                      display: "flex",
                      alignItems: "flex-end",
                      marginBottom: 4,
                    }}
                  >
                    {new Date(week[0].date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </div>
                )}
                {weekIndex !== 0 && <div style={{ height: 28 }} />}

                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    onMouseEnter={() => setHoveredDay(`${weekIndex}-${dayIndex}`)}
                    onMouseLeave={() => setHoveredDay(null)}
                    whileHover={{ scale: 1.15 }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: getColor(day.sessions),
                      cursor: "pointer",
                      position: "relative",
                      border: hoveredDay === `${weekIndex}-${dayIndex}` ? "2px solid var(--text-primary)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Tooltip */}
                    {hoveredDay === `${weekIndex}-${dayIndex}` && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          marginBottom: 8,
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          fontSize: 11,
                          color: "var(--text-primary)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          zIndex: 10,
                        }}
                      >
                        {day.sessions} session{day.sessions !== 1 ? "s" : ""} • {day.hours}h
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Less</p>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.2 }}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background:
                    i === 0
                      ? isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(99,102,241,0.08)"
                      : i === 1
                      ? "rgba(99,102,241,0.3)"
                      : i === 2
                      ? "rgba(99,102,241,0.5)"
                      : i === 3
                      ? "rgba(99,102,241,0.7)"
                      : "var(--gradient)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>More</p>
        </div>

        {/* <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            borderRadius: 8,
            background: "rgba(99,102,241,0.08)",
            border: "1px solid var(--border-hover)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <Zap size={14} color="var(--accent-1)" />
          <p style={{ fontSize: 12, color: "var(--accent-1)", fontWeight: 600 }}>
            +12% this week
          </p>
        </motion.div> */}
      </motion.div>
    </motion.div>
  );
};

export default SessionHeatmap;