import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx"; // ✅
import {
  Home, CheckSquare, User, Settings,
  BarChart2, Award, LogOut, Zap, TrendingUp,
} from "lucide-react";

const navItems = [
  { path: "/",        icon: Home,        label: "Home"     },
  { path: "/habits",  icon: CheckSquare, label: "Habits"   },
  { path: "/analysis",icon: BarChart2,   label: "Analysis" },
  { path: "/level",   icon: Award,       label: "Level Up" },
  { path: "/profile", icon: User,        label: "Profile"  },
  { path: "/settings",icon: Settings,    label: "Settings" },
];

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const { isDark }           = useTheme(); // ✅
  const navigate             = useNavigate();

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const sidebarBg      = isDark ? "rgba(15,12,40,0.85)"      : "rgba(255,255,255,0.85)";
  const sidebarBorder  = isDark ? "rgba(255,255,255,0.08)"   : "rgba(0,0,0,0.08)";
  const textPrimary    = isDark ? "#f1f5f9"                  : "#0f172a";
  const textSecondary  = isDark ? "#94a3b8"                  : "#64748b";
  const userCardBg     = isDark ? "rgba(255,255,255,0.05)"   : "rgba(99,102,241,0.05)";
  const userCardBorder = isDark ? "rgba(255,255,255,0.08)"   : "rgba(99,102,241,0.12)";
  const navIdleColor   = isDark ? "#94a3b8"                  : "#64748b";
  const navHoverBg     = isDark ? "rgba(255,255,255,0.05)"   : "rgba(99,102,241,0.06)";
  const navHoverColor  = isDark ? "#f1f5f9"                  : "#0f172a";
  const onlineDotBorder= isDark ? "#0f0d2e"                  : "#ffffff";
  const logoBrandColor = isDark ? "#ffffff"                  : "#0f172a";

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
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center
                       liquid-glass-shimmer flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow:  "0 4px 15px rgba(99,102,241,0.4)",
            }}
          >
            <Zap className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <span
            className="font-black text-lg tracking-tight"
            style={{ color: logoBrandColor }}
          >
            Flow<span style={{ color: "#6366f1" }}>Tracker</span>
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
                )}&background=6366f1&color=fff&size=80`
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400/40"
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
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              <p
                className="text-xs font-medium"
                style={{ color: isDark ? "#818cf8" : "#4f46e5" }}
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
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        boxShadow:  "0 4px 15px rgba(99,102,241,0.35)",
                      }
                    : { color: navIdleColor }
                }
                onMouseEnter={(e) => {
                  // only apply hover style when not active
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