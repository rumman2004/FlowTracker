import { NavLink } from "react-router-dom";
import { useTheme } from "../../Context/ThemeContext.jsx"; // ✅
import { Home, CheckSquare, BarChart2, Award, User } from "lucide-react";

const navItems = [
  { path: "/",         icon: Home,        label: "Home"    },
  { path: "/habits",   icon: CheckSquare, label: "Habits"  },
  { path: "/analysis", icon: BarChart2,   label: "Stats"   },
  { path: "/level",    icon: Award,       label: "Level"   },
  { path: "/profile",  icon: User,        label: "Profile" },
];

const MobileNav = () => {
  const { isDark } = useTheme(); // ✅

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const navBg        = isDark
    ? "rgba(15,12,40,0.92)"
    : "rgba(255,255,255,0.92)";
  const navBorder    = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
  const idleColor    = isDark ? "#64748b" : "#94a3b8";
  const activeColor  = isDark ? "#818cf8" : "#4f46e5";
  const activeBg     = isDark
    ? "linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))"
    : "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07))";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
      <div
        className="flex items-center justify-around py-2 px-2 rounded-2xl"
        style={{
          background:     navBg,
          border:         `1px solid ${navBorder}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: isDark
            ? "0 -4px 30px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.3)"
            : "0 -4px 30px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className="flex flex-col items-center gap-1 px-3 py-2
                         rounded-xl transition-all duration-200 relative"
            >
              {({ isActive }) => (
                <>
                  {/* Active background pill */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-xl"
                      style={{ background: activeBg }}
                    />
                  )}

                  <Icon
                    className={`w-5 h-5 relative z-10 transition-all duration-200
                                ${isActive ? "scale-110" : ""}`}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{ color: isActive ? activeColor : idleColor }}
                  />

                  <span
                    className="text-[10px] font-medium relative z-10"
                    style={{ color: isActive ? activeColor : idleColor }}
                  >
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2
                                 w-1 h-1 rounded-full"
                      style={{ background: activeColor }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;