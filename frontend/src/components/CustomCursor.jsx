import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const CustomCursor = () => {
  // High-performance motion values for spatial coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Custom spring configurations for that "liquid/organic" lag effect
  const trailingX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const trailingY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  // State to track clicks and interactive hovers
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hue, setHue] = useState(0);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let animationFrameId;

    // Smoothly cycle the color hue continuously
    const cycleColor = () => {
      setHue((prev) => (prev + 1.5) % 360);
      animationFrameId = requestAnimationFrame(cycleColor);
    };
    animationFrameId = requestAnimationFrame(cycleColor);

    const moveCursor = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Boost hue rotation based on mouse movement speed (Velocity Color Burst)
      const deltaX = Math.abs(e.clientX - lastX);
      const deltaY = Math.abs(e.clientY - lastY);
      const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      setHue((prev) => (prev + speed * 0.4) % 360);

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest("button") || 
        target.closest("a") || 
        target.closest("input") || 
        target.closest("[data-hover]")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY]);

  // Generate dynamic premium gradient strings derived from the shifting hue value
  const primaryGradient = `linear-gradient(135deg, hsl(${hue}, 90%, 60%), hsl(${(hue + 60) % 360}, 90%, 60%))`;
  const secondaryGradient = `linear-gradient(135deg, hsl(${(hue + 120) % 360}, 90%, 65%), hsl(${(hue + 180) % 360}, 90%, 65%))`;

  return (
    <>
      {/* 1. LIQUID GRADIENT OUTER RING */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          x: trailingX,
          y: trailingY,
          translateX: "-50%",
          translateY: "-50%",
          width: 54,
          height: 54,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99998,
          // Premium glassmorphism aura glow
          background: "transparent",
          backdropFilter: "blur(2px)",
          boxShadow: isHovering 
            ? `0 0 30px 5px hsl(${hue}, 85%, 60%)` 
            : `0 0 15px 0px rgba(255, 255, 255, 0.1)`,
        }}
        animate={{
          scale: isHovering ? 1.5 : isClicking ? 0.75 : 1,
          // Give a neat background tint when hovering links
          backgroundColor: isHovering ? `広告 hsl(${hue}, 90%, 60%, 0.1)` : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        {/* Neon Gradient Border Layer */}
        <div 
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            padding: "2.5px", // Thickness of custom border
            background: primaryGradient,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </motion.div>

      {/* 2. CHAMELEON INNER DOT */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: secondaryGradient,
          pointerEvents: "none",
          zIndex: 99999,
          boxShadow: `0 0 12px 2px hsl(${(hue + 120) % 360}, 90%, 65%)`,
        }}
        animate={{
          scale: isClicking ? 2.5 : isHovering ? 0.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
      />
    </>
  );
};

export default CustomCursor;