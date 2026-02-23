import { useState, useEffect } from "react";

// ── Inline SVG logo — identical to favicon & sidebar ─────────────────────────
const FlowTrackerLogo = ({ size = 96 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="wa_mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>

      <filter id="wa_glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <radialGradient id="wa_bgGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#f97316" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0"    />
      </radialGradient>
    </defs>

    {/* Background */}
    <rect width="100" height="100" rx="22" ry="22" fill="#0f0f1a" />

    {/* Radial glow */}
    <rect width="100" height="100" rx="22" ry="22" fill="url(#wa_bgGlow)" />

    {/* Border */}
    <rect
      width="100" height="100" rx="22" ry="22"
      fill="none"
      stroke="rgba(249,115,22,0.25)"
      strokeWidth="1.5"
    />

    {/* Lightning bolt */}
    <path
      d="M 57 14 L 33 54 L 47 54 L 43 86 L 67 46 L 53 46 Z"
      fill="url(#wa_mainGrad)"
      filter="url(#wa_glow)"
    />

    {/* Shine highlight */}
    <path
      d="M 57 14 L 33 54 L 40 54 L 57 24 Z"
      fill="rgba(255,255,255,0.18)"
    />

    {/* Streak dots */}
    <circle cx="70" cy="72" r="3.5" fill="#f97316" opacity="0.9" filter="url(#wa_glow)" />
    <circle cx="70" cy="82" r="2.5" fill="#f97316" opacity="0.55" />
    <circle cx="70" cy="90" r="1.8" fill="#f97316" opacity="0.3"  />
  </svg>
);

// ─── Welcome Animation ────────────────────────────────────────────────────────
const WelcomeAnimation = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
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

      {/* ── Background orbs ─────────────────────────────────────────────── */}
      <div
        className="absolute rounded-full opacity-20 animate-pulse"
        style={{
          width: "420px", height: "420px",
          background:    "radial-gradient(circle, #f97316, transparent)",
          top: "8%", right: "8%",
          filter:        "blur(70px)",
        }}
      />
      <div
        className="absolute rounded-full opacity-15 animate-pulse"
        style={{
          width: "280px", height: "280px",
          background:    "radial-gradient(circle, #dc2626, transparent)",
          bottom: "12%", left: "4%",
          filter:        "blur(70px)",
          animationDelay: "0.5s",
        }}
      />
      {/* Extra subtle centre glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "600px", height: "600px",
          background:    "radial-gradient(circle, rgba(249,115,22,0.07), transparent 65%)",
          top: "50%", left: "50%",
          transform:     "translate(-50%, -50%)",
          filter:        "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">

        {/* Logo */}
        <div className="welcome-logo">
          <FlowTrackerLogo size={96} />
        </div>

        {/* App name */}
        <div className="welcome-text">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Flow
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #f97316, #dc2626)",
              }}
            >
              Tracker
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="welcome-subtitle text-lg font-medium max-w-xs"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Build habits. Earn XP. Level up your life. ✨
        </p>

        {/* Loading bar */}
        <div className="w-48 mt-2">
          <div
            className="w-full rounded-full h-1 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="welcome-bar h-full rounded-full"
              style={{
                background:         "linear-gradient(90deg, #f97316, #dc2626, #f97316)",
                backgroundSize:     "200% 100%",
                animation:
                  "barGrow 1.2s ease-out 1.5s both, shimmerBar 2s linear infinite",
                boxShadow:          "0 0 10px rgba(249,115,22,0.6)",
              }}
            />
          </div>
        </div>

        {/* Dots */}
        <div className="welcome-dots flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background:     "linear-gradient(135deg, #f97316, #dc2626)",
                animationDelay: `${i * 0.2}s`,
                display:        "inline-block",
                boxShadow:      "0 0 6px rgba(249,115,22,0.5)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Keyframes ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes barGrow {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes shimmerBar {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;