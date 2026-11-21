import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { Eye, EyeOff, Mail, Lock, User, Zap, Sun, Moon, ArrowRight, Check } from "lucide-react";
import { useTheme } from "../ThemeContext";

const Register = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState("");

  // 3D Card Effect
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return 0;
    if (p.length < 6) return 1;
    if (p.length < 10) return 2;
    return 3;
  };

  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    try {
      const response = await registerUser(formData.email, formData.password, formData.fullName);
      if (response.success) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="noise"
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Animated Background */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", top: "-20%", right: "-20%",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", bottom: "-20%", left: "-20%",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "20%", left: "15%",
          width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        style={{
          position: "fixed", top: 24, right: 24,
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-secondary)", zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.button>

      {/* 3D Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
          perspective: 1000,
          width: "100%",
          maxWidth: 460,
          zIndex: 10,
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 24,
            padding: "44px 40px",
            boxShadow: "var(--shadow), var(--shadow-accent)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shine */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)",
            pointerEvents: "none", borderRadius: 24,
          }} />

          {/* Logo */}
          <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  style={{ textAlign: "center", marginBottom: 40 }}
>
  <motion.img
    src="/CareerOS.png"          
    alt= <i> "CareerOS AI" </i>
    whileHover={{ scale: 1.08, rotate: 8 }}
    transition={{ duration: 0.4 }}
    style={{
      width: 140,
      height: 140,
      objectFit: "contain",
      margin: "0 auto 16px",
      filter: "drop-shadow(0 10px 20px rgba(99, 102, 241, 0.4))"
    }}
  />
  
  <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.8px" }} className="gradient-text">
    CareerOS AI
  </h1>
  <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 6 }}>
    The system that learns you.
  </p>
</motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              Create account
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 26 }}>
              Join thousands building their career with AI
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12, padding: "12px 16px",
                marginBottom: 18, color: "#f87171", fontSize: 13,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
              {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 12, padding: "12px 16px",
                marginBottom: 18, color: "#4ade80", fontSize: 13,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Check size={14} />
              {success}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 }}
            >
              <label style={{
                fontSize: 12, fontWeight: 600,
                color: focused === "fullName" ? "var(--accent-1)" : "var(--text-secondary)",
                marginBottom: 8, display: "block",
                textTransform: "uppercase", letterSpacing: "0.5px",
                transition: "color 0.2s",
              }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "fullName" ? "var(--accent-1)" : "var(--text-secondary)",
                  transition: "color 0.2s", pointerEvents: "none",
                }} />
                <input
                  type="text" name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocused("fullName")}
                  onBlur={() => setFocused("")}
                  placeholder="Your full name"
                  required
                  className="input-field"
                  style={{ padding: "13px 14px 13px 44px" }}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36 }}
            >
              <label style={{
                fontSize: 12, fontWeight: 600,
                color: focused === "email" ? "var(--accent-1)" : "var(--text-secondary)",
                marginBottom: 8, display: "block",
                textTransform: "uppercase", letterSpacing: "0.5px",
                transition: "color 0.2s",
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "email" ? "var(--accent-1)" : "var(--text-secondary)",
                  transition: "color 0.2s", pointerEvents: "none",
                }} />
                <input
                  type="email" name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                  style={{ padding: "13px 14px 13px 44px" }}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.40 }}
            >
              <label style={{
                fontSize: 12, fontWeight: 600,
                color: focused === "password" ? "var(--accent-1)" : "var(--text-secondary)",
                marginBottom: 8, display: "block",
                textTransform: "uppercase", letterSpacing: "0.5px",
                transition: "color 0.2s",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "password" ? "var(--accent-1)" : "var(--text-secondary)",
                  transition: "color 0.2s", pointerEvents: "none",
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="Min. 6 characters"
                  required
                  className="input-field"
                  style={{ padding: "13px 44px 13px 44px" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", color: "var(--text-secondary)",
                    display: "flex", alignItems: "center",
                  }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 8 }}
                >
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3].map((level) => (
                      <div key={level} style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: passwordStrength() >= level
                          ? strengthColor[passwordStrength()]
                          : "var(--border)",
                        transition: "background 0.3s ease",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor[passwordStrength()] }}>
                    {strengthLabel[passwordStrength()]}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.44 }}
            >
              <label style={{
                fontSize: 12, fontWeight: 600,
                color: focused === "confirmPassword" ? "var(--accent-1)" : "var(--text-secondary)",
                marginBottom: 8, display: "block",
                textTransform: "uppercase", letterSpacing: "0.5px",
                transition: "color 0.2s",
              }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "confirmPassword" ? "var(--accent-1)" : "var(--text-secondary)",
                  transition: "color 0.2s", pointerEvents: "none",
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocused("confirmPassword")}
                  onBlur={() => setFocused("")}
                  placeholder="Repeat your password"
                  required
                  className="input-field"
                  style={{
                    padding: "13px 14px 13px 44px",
                    borderColor: formData.confirmPassword.length > 0
                      ? formData.password === formData.confirmPassword
                        ? "rgba(34,197,94,0.4)"
                        : "rgba(239,68,68,0.4)"
                      : "var(--border)",
                  }}
                />
                {formData.confirmPassword.length > 0 && (
                  <div style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    color: formData.password === formData.confirmPassword ? "#4ade80" : "#f87171",
                  }}>
                    {formData.password === formData.confirmPassword
                      ? <Check size={16} />
                      : <EyeOff size={16} />}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="btn-gradient"
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 12, fontSize: 15,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  opacity: isLoading ? 0.7 : 1,
                  marginTop: 4,
                }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                      }}
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          <div style={{
            display: "flex", alignItems: "center",
            gap: 12, margin: "22px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "var(--accent-1)", textDecoration: "none",
              fontWeight: 600,
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;