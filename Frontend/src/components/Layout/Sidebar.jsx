import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx";
import {
  Home, CheckSquare, User, Settings,
  BarChart2, Award, LogOut, TrendingUp,
} from "lucide-react";

const navItems = [
  { path: "/",         icon: Home,        label: "Home"     },
  { path: "/habits",   icon: CheckSquare, label: "Habits"   },
  { path: "/analysis", icon: BarChart2,   label: "Analysis" },
  { path: "/level",    icon: Award,       label: "Level Up" },
  { path: "/profile",  icon: User,        label: "Profile"  },
  { path: "/settings", icon: Settings,    label: "Settings" },
];

// ── Inline SVG logo — matches favicon exactly ─────────────────────────────────
const FlowTrackerLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="40"
    height="40"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="sb_mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>

      <filter id="sb_glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <radialGradient id="sb_bgGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#f97316" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0"    />
      </radialGradient>
    </defs>

    {/* Background */}
    <rect width="100" height="100" rx="22" ry="22" fill="#0f0f1a" />

    {/* Radial glow */}
    <rect width="100" height="100" rx="22" ry="22" fill="url(#sb_bgGlow)" />

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
      fill="url(#sb_mainGrad)"
      filter="url(#sb_glow)"
    />

    {/* Shine highlight */}
    <path
      d="M 57 14 L 33 54 L 40 54 L 57 24 Z"
      fill="rgba(255,255,255,0.18)"
    />

    {/* Streak dots */}
    <circle cx="70" cy="72" r="3.5" fill="#f97316" opacity="0.9" filter="url(#sb_glow)" />
    <circle cx="70" cy="82" r="2.5" fill="#f97316" opacity="0.55" />
    <circle cx="70" cy="90" r="1.8" fill="#f97316" opacity="0.3"  />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const { isDark }           = useTheme();
  const navigate             = useNavigate();

  const sidebarBg      = isDark ? "rgba(15,12,40,0.85)"    : "rgba(255,255,255,0.85)";
  const sidebarBorder  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textPrimary    = isDark ? "#f1f5f9"                : "#0f172a";
  const userCardBg     = isDark ? "rgba(255,255,255,0.05)" : "rgba(249,115,22,0.05)";
  const userCardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(249,115,22,0.12)";
  const navIdleColor   = isDark ? "#94a3b8"                : "#64748b";
  const navHoverBg     = isDark ? "rgba(255,255,255,0.05)" : "rgba(249,115,22,0.06)";
  const navHoverColor  = isDark ? "#f1f5f9"                : "#0f172a";
  const onlineDotBorder= isDark ? "#0f0d2e"                : "#ffffff";
  const logoBrandColor = isDark ? "#ffffff"                : "#0f172a";

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen relative z-20 p-3 gap-2">
      <div
        className="flex flex-col h-full p-4 gap-3 rounded-2xl"
        style={{
          background:     sidebarBg,
          border:         `1px solid ${sidebarBorder}`,
          backdropFilter: "blur(20px)",
          boxShadow:      isDark
            ? "0 8px 32px rgba(0,0,0,0.3)"
            : "0 8px 32px rgba(0,0,0,0.06)",
        }}
      >

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-2 py-3">
          {/* ✅ Replaced: now uses the same SVG as favicon */}
          <FlowTrackerLogo />

          <span
            className="font-black text-lg tracking-tight"
            style={{ color: logoBrandColor }}
          >
            Flow
            <span style={{
              background: "linear-gradient(135deg, #f97316, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Tracker
            </span>
          </span>
        </div>

        {/* ── User Info Card ────────────────────────────────────────────── */}
        <div
          className="p-3 flex items-center gap-3 rounded-xl"
          style={{
            background: userCardBg,
            border:     `1px solid ${userCardBorder}`,
          }}
        >
          <div className="relative flex-shrink-0">
            <img
              src={
                user?.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "U"
                )}&background=f97316&color=fff&size=80`
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
              style={{ ring: "2px solid rgba(249,115,22,0.4)" }}
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5
                         bg-green-400 rounded-full border-2"
              style={{ borderColor: onlineDotBorder }}
            />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p
              className="font-semibold text-sm truncate"
              style={{ color: textPrimary }}
            >
              {user?.name}
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" style={{ color: "#f97316" }} />
              <p
                className="text-xs font-medium"
                style={{ color: isDark ? "#fb923c" : "#ea580c" }}
              >
                Level {user?.level}
              </p>
            </div>
          </div>
        </div>

        {/* ── Nav Links ─────────────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-hide py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                           text-sm font-medium transition-all duration-200"
                style={({ isActive }) =>
                  isActive
                    ? {
                        color:      "#ffffff",
                        background: "linear-gradient(135deg, #f97316, #dc2626)",
                        boxShadow:  "0 4px 15px rgba(249,115,22,0.35)",
                      }
                    : { color: navIdleColor }
                }
                onMouseEnter={(e) => {
                  if (!e.currentTarget.style.background.includes("gradient")) {
                    e.currentTarget.style.background = navHoverBg;
                    e.currentTarget.style.color      = navHoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.style.background.includes("gradient")) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color      = navIdleColor;
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Logout ────────────────────────────────────────────────────── */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                     text-sm font-medium transition-all duration-200 group"
          style={{ color: "#f87171" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2}
          />
          Logout
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;