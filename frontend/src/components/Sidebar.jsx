import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Zap, TrendingUp, Target, LogOut, Menu, X,
  Settings, ChevronRight, Award
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Target, label: "Career Analysis", path: "/dashboard/career" },
    { icon: TrendingUp, label: "Roadmap", path: "/dashboard/roadmap" },
    { icon: Zap, label: "Sessions", path: "/dashboard/sessions" },
    { icon: Award, label: "Mentor", path: "/dashboard/mentor" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  // Dynamically watch window size to handle mobile responsive view reliably
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true); // Always keep open on desktop
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("careeros_token");
    localStorage.removeItem("careeros_user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && !isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed", top: 20, left: 20, zIndex: 1000,
            display: "flex", width: 44, height: 44, borderRadius: 10,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            alignItems: "center", justifyContent: "center",
            color: "var(--text-primary)",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <Menu size={20} />
        </motion.button>
      )}

      {/* Sidebar Navigation Panel */}
      <motion.div
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: "fixed", left: 0, top: 0, height: "100vh",
          width: 280, background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          zIndex: 999,
          display: "flex", flexDirection: "column",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header Section */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: "var(--gradient)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden" 
              }}
            >
              <img 
                src="/CareerOS.png" 
                alt="Logo" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </motion.div>
            
            {isMobile && (
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            )}
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            CareerOS
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            AI Career System
          </p>
        </div>

        {/* Menu Navigation Links */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => isMobile && setIsOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      marginBottom: 8,
                      background: isActive ? "var(--bg-card-hover)" : "transparent",
                      border: `1px solid ${isActive ? "var(--border-hover)" : "transparent"}`,
                      display: "flex", alignItems: "center", gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <item.icon
                      size={18}
                      color={isActive ? "var(--accent-1)" : "var(--text-secondary)"}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        color: isActive ? "var(--accent-1)" : "var(--text-secondary)",
                        fontWeight: isActive ? 600 : 500,
                        flex: 1
                      }}
                    >
                      {item.label}
                    </span>
                    {isActive && <ChevronRight size={16} color="var(--accent-1)" />}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Actions */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            style={{
              width: "100%", padding: "12px", borderRadius: 12,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease"
            }}
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Dimmed Mobile Screen Backdrop overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;