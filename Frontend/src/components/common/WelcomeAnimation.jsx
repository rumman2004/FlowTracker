import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const WelcomeAnimation = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Mark as shown in session so it only appears once per session
    const hasShown = sessionStorage.getItem("welcomeShown");
    if (hasShown) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("welcomeShown", "true");
      onComplete?.();
    }, 3400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="welcome-overlay">
      {/* Animated background orbs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
        style={{
          background: "radial-gradient(circle, #6366f1, transparent)",
          top: "10%",
          right: "10%",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-15 animate-pulse"
        style={{
          background: "radial-gradient(circle, #8b5cf6, transparent)",
          bottom: "15%",
          left: "5%",
          filter: "blur(60px)",
          animationDelay: "0.5s",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Logo */}
        <div className="welcome-logo">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center liquid-glass-shimmer"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.8))",
              boxShadow: "0 20px 60px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Zap className="text-white w-12 h-12" strokeWidth={2.5} />
          </div>
        </div>

        {/* App Name */}
        <div className="welcome-text">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Flow
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #a78bfa, #818cf8)",
              }}
            >
              Tracker
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="welcome-subtitle text-indigo-200 text-lg font-medium max-w-xs">
          Build habits. Earn XP. Level up your life. ✨
        </p>

        {/* Loading Bar */}
        <div className="w-48 mt-2">
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className="welcome-bar h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #6366f1, #a78bfa, #6366f1)",
                backgroundSize: "200% 100%",
                animation: "barGrow 1.2s ease-out 1.5s both, shimmerBar 2s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Dots */}
        <div className="welcome-dots flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400"
              style={{ animationDelay: `${i * 0.2}s`, display: "inline-block" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;