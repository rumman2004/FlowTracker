import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminDashboard, getAllUsers, toggleUserStatus,
} from "../../Services/adminservice.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import {
  FiShield, FiLogOut, FiUsers, FiTrendingUp,
  FiZap, FiCheckSquare, FiMenu, FiX,
} from "react-icons/fi";

// ─── Welcome Splash ──────────────────────────────────────────────────────────
const WelcomeSplash = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column",
      background: "#030712",
      animation: "splashFadeOut 0.6s ease 2.6s both",
    }}>
      {/* Radiating rings */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${i * 220}px`, height: `${i * 220}px`,
          borderRadius: "50%",
          border: "1px solid rgba(249,115,22,0.15)",
          animation: `ringPulse 2s ease-in-out ${i * 0.25}s infinite`,
        }} />
      ))}

      {/* Orbs */}
      <div style={{
        position: "absolute", width: 700, height: 700,
        background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 65%)",
        borderRadius: "50%", filter: "blur(60px)",
        animation: "orbBreath 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(220,38,38,0.12), transparent 65%)",
        borderRadius: "50%", filter: "blur(60px)",
        animation: "orbBreath 3s ease-in-out 0.5s infinite reverse",
      }} />

      {/* Shield icon */}
      <div style={{
        width: "90px", height: "90px", borderRadius: "28px",
        background: "linear-gradient(135deg, #f97316, #dc2626)",
        boxShadow: "0 20px 60px rgba(249,115,22,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "28px", position: "relative", zIndex: 1,
        animation: "badgeEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
      }}>
        <FiShield size={38} color="#fff" strokeWidth={1.5} />
      </div>

      <h1 style={{
        fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 900,
        color: "#f8fafc", margin: "0 0 10px",
        letterSpacing: "-0.04em", position: "relative", zIndex: 1,
        animation: "textSlideUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s both",
        fontFamily: "'Inter', sans-serif",
      }}>
        Welcome Back, Admin
      </h1>
      <p style={{
        fontSize: "clamp(13px, 2vw, 16px)",
        color: "rgba(255,255,255,0.4)",
        margin: 0, position: "relative", zIndex: 1,
        animation: "textSlideUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.55s both",
        fontFamily: "'Inter', sans-serif",
      }}>
        FlowTracker Administration Panel
      </p>

      {/* Loading bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "3px",
        background: "rgba(255,255,255,0.06)",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #f97316, #dc2626)",
          animation: "loadBar 2.6s linear both",
          boxShadow: "0 0 12px rgba(249,115,22,0.8)",
        }} />
      </div>

      <style>{`
        @keyframes splashFadeOut {
          to { opacity: 0; visibility: hidden; pointer-events: none; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.1; }
        }
        @keyframes orbBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes badgeEntrance {
          from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes textSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, gradient, delay }) => (
  <div style={{
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px", padding: "20px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
    animation: `cardSlideIn 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both`,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "default", position: "relative", overflow: "hidden",
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)";
    }}
  >
    {/* Gradient glow */}
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(ellipse at 80% 20%, ${gradient}10, transparent 60%)`,
      pointerEvents: "none",
    }} />
    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>
      {title}
    </p>
    <p style={{ fontSize: "32px", fontWeight: 800, color: "#f8fafc", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
      {value ?? 0}
    </p>
    <span style={{ fontSize: "22px" }}>{icon}</span>
  </div>
);

// ─── Glass Chart Wrapper ─────────────────────────────────────────────────────
const GlassChart = ({ title, icon, children, delay }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "24px", padding: "24px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
    animation: `cardSlideIn 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both`,
  }}>
    <h2 style={{
      display: "flex", alignItems: "center", gap: "10px",
      fontSize: "15px", fontWeight: 700, color: "#f8fafc",
      margin: "0 0 20px",
    }}>
      {icon}{title}
    </h2>
    {children}
  </div>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,15,25,0.9)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px", padding: "10px 14px",
      backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
        {payload[0].value}
      </p>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { logoutAdmin }   = useAuth();
  const navigate          = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab]     = useState("overview");
  const [loading, setLoading]         = useState(true);
  const [showSplash, setShowSplash]   = useState(true);
  const [mobileMenu, setMobileMenu]   = useState(false);
  const [dashVisible, setDashVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [d, u] = await Promise.all([getAdminDashboard(), getAllUsers()]);
        setStats(d.data);
        setUsers(u.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSplashDone = () => {
    setShowSplash(false);
    setDashVisible(true);
  };

  const handleToggleUser = async (userId) => {
    try {
      const { data } = await toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: data.isActive } : u))
      );
      toast.success(data.message);
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const monthLabels = stats?.monthlyGrowth?.map((m) => {
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return { name: months[m._id.month], count: m.count };
  }) || [];

  const tabs = ["overview", "leaderboard", "users"];

  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#030712",
    }}>
      <div style={{
        width: "48px", height: "48px",
        border: "3px solid rgba(249,115,22,0.2)",
        borderTopColor: "#f97316", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      {showSplash && <WelcomeSplash onDone={handleSplashDone} />}

      <div style={{
        minHeight: "100vh", fontFamily: "'Inter', sans-serif",
        background: "radial-gradient(ellipse at 10% 10%, rgba(249,115,22,0.08) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(220,38,38,0.06) 0%, transparent 50%), #030712",
        color: "#f8fafc",
        opacity: dashVisible ? 1 : 0,
        transition: "opacity 0.6s ease 0.2s",
      }}>

        {/* Background grid */}
        <div style={{
          position: "fixed", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "50px 50px", pointerEvents: "none", zIndex: 0,
        }} />

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(3,7,18,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            padding: "0 24px", height: "64px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "12px",
                background: "linear-gradient(135deg, #f97316, #dc2626)",
                boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FiShield size={18} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                  FlowTracker Admin
                </p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                  Administration Panel
                </p>
              </div>
            </div>

            {/* Desktop nav tabs */}
            <div style={{
              display: "flex", gap: "4px", padding: "4px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
            }}
              className="hide-mobile"
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 18px", borderRadius: "12px",
                    fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500,
                    textTransform: "capitalize",
                    color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.45)",
                    background: activeTab === tab
                      ? "linear-gradient(135deg, #f97316, #dc2626)"
                      : "transparent",
                    border: "none", cursor: "pointer",
                    boxShadow: activeTab === tab ? "0 4px 14px rgba(249,115,22,0.35)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 16px", borderRadius: "12px",
                  fontSize: "13px", fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f87171";
                  e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <FiLogOut size={14} />
                <span className="hide-mobile">Logout</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="show-mobile"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px", padding: "8px",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  display: "none",
                }}
              >
                {mobileMenu ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown tabs */}
          {mobileMenu && (
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "12px 24px 16px",
              display: "flex", flexDirection: "column", gap: "4px",
              background: "rgba(3,7,18,0.95)",
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setMobileMenu(false); }}
                  style={{
                    padding: "12px 16px", borderRadius: "12px",
                    textAlign: "left", fontSize: "14px", fontWeight: 600,
                    textTransform: "capitalize",
                    color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.5)",
                    background: activeTab === tab
                      ? "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(220,38,38,0.15))"
                      : "transparent",
                    border: activeTab === tab
                      ? "1px solid rgba(249,115,22,0.3)"
                      : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "clamp(16px, 3vw, 32px) clamp(16px, 3vw, 24px)",
          position: "relative", zIndex: 1,
        }}>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Stat cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}>
                <StatCard title="Total Users"   value={stats?.totalUsers}  icon="👥" gradient="#3b82f6" delay={0.1} />
                <StatCard title="Active Today"  value={stats?.activeToday} icon="⚡" gradient="#22c55e" delay={0.15} />
                <StatCard title="Total Habits"  value={stats?.totalHabits} icon="✅" gradient="#a855f7" delay={0.2} />
                <StatCard
                  title="Growth 6M"
                  value={stats?.monthlyGrowth?.reduce((s, m) => s + m.count, 0)}
                  icon="📈" gradient="#f97316" delay={0.25}
                />
              </div>

              {/* Charts row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}>
                <GlassChart
                  title="Monthly User Growth"
                  icon={<FiTrendingUp size={16} color="#f97316" />}
                  delay={0.3}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthLabels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {monthLabels.map((_, i) => (
                          <rect key={i} fill={`url(#barGrad)`} />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassChart>

                <GlassChart
                  title="Daily Active Users (7 Days)"
                  icon={<FiUsers size={16} color="#3b82f6" />}
                  delay={0.35}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats?.dailyActive || []}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassChart>
              </div>
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {activeTab === "leaderboard" && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "24px", overflow: "hidden",
              backdropFilter: "blur(20px)",
              animation: "cardSlideIn 0.5s ease both",
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                  🏆 Top Users Leaderboard
                </h2>
                <span style={{
                  fontSize: "12px", fontWeight: 600,
                  color: "rgba(249,115,22,0.8)",
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.2)",
                  padding: "4px 10px", borderRadius: "8px",
                }}>
                  Top {stats?.leaderboard?.length ?? 0}
                </span>
              </div>
              <div>
                {stats?.leaderboard?.map((user, i) => (
                  <div
                    key={user._id}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "16px 24px",
                      borderBottom: i < stats.leaderboard.length - 1
                        ? "1px solid rgba(255,255,255,0.04)" : "none",
                      transition: "background 0.2s ease",
                      animation: `cardSlideIn 0.5s ease ${i * 0.05}s both`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Rank badge */}
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "12px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 800, flexShrink: 0,
                      background: i === 0 ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : i === 1 ? "linear-gradient(135deg, #94a3b8, #64748b)"
                        : i === 2 ? "linear-gradient(135deg, #b45309, #92400e)"
                        : "rgba(255,255,255,0.06)",
                      color: i < 3 ? "#0f172a" : "rgba(255,255,255,0.5)",
                      boxShadow: i === 0 ? "0 4px 16px rgba(245,158,11,0.4)"
                        : i === 1 ? "0 4px 16px rgba(148,163,184,0.3)"
                        : i === 2 ? "0 4px 16px rgba(180,83,9,0.3)" : "none",
                    }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </div>

                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                      alt={user.name}
                      style={{
                        width: "42px", height: "42px", borderRadius: "14px",
                        objectFit: "cover", flexShrink: 0,
                        border: "2px solid rgba(255,255,255,0.08)",
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.email}
                      </p>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontSize: "13px", fontWeight: 800,
                        margin: "0 0 2px",
                        background: "linear-gradient(135deg, #f97316, #dc2626)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        Level {user.level}
                      </p>
                      <p style={{ fontSize: "12px", color: "rgba(168,85,247,0.8)", margin: 0 }}>
                        ⚡ {user.totalExp} EXP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "24px", overflow: "hidden",
              backdropFilter: "blur(20px)",
              animation: "cardSlideIn 0.5s ease both",
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                  All Users
                </h2>
                <span style={{
                  fontSize: "12px", fontWeight: 600,
                  color: "rgba(59,130,246,0.8)",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  padding: "4px 10px", borderRadius: "8px",
                }}>
                  {users.length} total
                </span>
              </div>

              {/* Desktop table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.025)" }}>
                      {["User", "Level", "EXP", "Joined", "Status", "Action"].map((h) => (
                        <th key={h} style={{
                          padding: "12px 20px", textAlign: "left",
                          fontSize: "11px", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.08em",
                          color: "rgba(255,255,255,0.3)",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr
                        key={u._id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background 0.2s ease",
                          animation: `cardSlideIn 0.4s ease ${i * 0.03}s both`,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img
                              src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                              alt={u.name}
                              style={{
                                width: "36px", height: "36px", borderRadius: "12px",
                                objectFit: "cover", flexShrink: 0,
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}
                            />
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", margin: "0 0 2px" }}>{u.name}</p>
                              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: "13px", fontWeight: 800,
                            background: "linear-gradient(135deg, #f97316, #dc2626)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                          }}>
                            {u.level}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "rgba(168,85,247,0.8)", fontWeight: 600 }}>
                          ⚡{u.totalExp}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            padding: "4px 10px", borderRadius: "8px",
                            fontSize: "11px", fontWeight: 700,
                            color: u.isActive ? "#4ade80" : "#f87171",
                            background: u.isActive ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                            border: `1px solid ${u.isActive ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                          }}>
                            {u.isActive ? "● Active" : "● Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <button
                            onClick={() => handleToggleUser(u._id)}
                            style={{
                              padding: "7px 14px", borderRadius: "10px",
                              fontSize: "12px", fontWeight: 700,
                              cursor: "pointer", border: "1px solid",
                              transition: "all 0.2s ease",
                              color: u.isActive ? "#f87171" : "#4ade80",
                              background: u.isActive ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)",
                              borderColor: u.isActive ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = u.isActive ? "rgba(248,113,113,0.18)" : "rgba(74,222,128,0.18)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = u.isActive ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)";
                            }}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.4); }
      `}</style>
    </>
  );
};

export default AdminDashboard;