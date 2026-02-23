import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminDashboard, getAllUsers, toggleUserStatus,
} from "../../Services/adminservice.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import {
  Shield, LogOut, Users, TrendingUp,
  Zap, LayoutDashboard, Trophy,
} from "lucide-react";

// ── Month label map ───────────────────────────────────────────────────────────
const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ── Bottom nav items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",     label: "Overview",     icon: LayoutDashboard },
  { id: "leaderboard",  label: "Leaderboard",  icon: Trophy          },
  { id: "users",        label: "Users",        icon: Users           },
];

// ─── Welcome Splash ───────────────────────────────────────────────────────────
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
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${i * 220}px`, height: `${i * 220}px`,
          borderRadius: "50%",
          border: "1px solid rgba(249,115,22,0.15)",
          animation: `ringPulse 2s ease-in-out ${i * 0.25}s infinite`,
        }} />
      ))}
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
      <div style={{
        width: "90px", height: "90px", borderRadius: "28px",
        background: "linear-gradient(135deg, #f97316, #dc2626)",
        boxShadow: "0 20px 60px rgba(249,115,22,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "28px", position: "relative", zIndex: 1,
        animation: "badgeEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
      }}>
        <Shield size={38} color="#fff" strokeWidth={1.5} />
      </div>
      <h1 style={{
        fontSize: "clamp(28px,6vw,48px)", fontWeight: 900,
        color: "#f8fafc", margin: "0 0 10px",
        letterSpacing: "-0.04em", position: "relative", zIndex: 1,
        animation: "textSlideUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s both",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        Welcome Back, Admin
      </h1>
      <p style={{
        fontSize: "clamp(13px,2vw,16px)",
        color: "rgba(255,255,255,0.4)", margin: 0,
        position: "relative", zIndex: 1,
        animation: "textSlideUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.55s both",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        FlowTracker Administration Panel
      </p>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "3px", background: "rgba(255,255,255,0.06)",
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
          to { opacity:0; visibility:hidden; pointer-events:none; }
        }
        @keyframes ringPulse {
          0%,100% { transform:scale(1);    opacity:0.3; }
          50%      { transform:scale(1.08); opacity:0.1; }
        }
        @keyframes orbBreath {
          0%,100% { transform:scale(1);   }
          50%      { transform:scale(1.1); }
        }
        @keyframes badgeEntrance {
          from { opacity:0; transform:scale(0.5) rotate(-10deg); }
          to   { opacity:1; transform:scale(1)   rotate(0deg);   }
        }
        @keyframes textSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes loadBar {
          from { width:0%; }
          to   { width:100%; }
        }
      `}</style>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, gradient, delay }) => (
  <div
    style={{
      background:           "rgba(255,255,255,0.04)",
      border:               "1px solid rgba(255,255,255,0.08)",
      borderRadius:         "20px",
      padding:              "20px",
      backdropFilter:       "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow:            "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      animation:            `cardSlideIn 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both`,
      transition:           "transform 0.3s ease, box-shadow 0.3s ease",
      cursor:               "default",
      position:             "relative",
      overflow:             "hidden",
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
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(ellipse at 80% 20%, ${gradient}18, transparent 60%)`,
      pointerEvents: "none",
    }} />
    <p style={{
      fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", margin: "0 0 8px",
    }}>
      {title}
    </p>
    <p style={{
      fontSize: "32px", fontWeight: 800, color: "#f8fafc",
      margin: "0 0 6px", letterSpacing: "-0.02em",
    }}>
      {value ?? 0}
    </p>
    <span style={{ fontSize: "22px" }}>{icon}</span>
  </div>
);

// ─── Glass Chart Wrapper ──────────────────────────────────────────────────────
const GlassChart = ({ title, icon, children, delay }) => (
  <div style={{
    background:           "rgba(255,255,255,0.03)",
    border:               "1px solid rgba(255,255,255,0.07)",
    borderRadius:         "24px",
    padding:              "24px",
    backdropFilter:       "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow:            "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
    animation:            `cardSlideIn 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both`,
  }}>
    <h2 style={{
      display: "flex", alignItems: "center", gap: "10px",
      fontSize: "15px", fontWeight: 700, color: "#f8fafc", margin: "0 0 20px",
    }}>
      {icon} {title}
    </h2>
    {children}
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:     "rgba(15,15,25,0.92)",
      border:         "1px solid rgba(255,255,255,0.1)",
      borderRadius:   "12px",
      padding:        "10px 14px",
      backdropFilter: "blur(20px)",
      boxShadow:      "0 8px 32px rgba(0,0,0,0.5)",
      fontFamily:     "'Inter', system-ui, sans-serif",
    }}>
      <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", margin:"0 0 4px" }}>
        {label}
      </p>
      <p style={{ fontSize:"16px", fontWeight:700, color:"#f8fafc", margin:0 }}>
        {payload[0].value}
      </p>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { logoutAdmin }  = useAuth();
  const navigate         = useNavigate();

  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [activeTab,   setActiveTab]   = useState("overview");
  const [loading,     setLoading]     = useState(true);
  const [showSplash,  setShowSplash]  = useState(true);
  const [dashVisible, setDashVisible] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, usersRes] = await Promise.all([
          getAdminDashboard(),
          getAllUsers(),
        ]);
        setStats(dashRes.data);
        setUsers(
          Array.isArray(usersRes.data)
            ? usersRes.data
            : (usersRes.data?.users ?? [])
        );
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSplashDone  = () => { setShowSplash(false); setDashVisible(true); };
  const handleLogout      = () => { logoutAdmin(); navigate("/admin/login"); };
  const handleToggleUser  = async (userId) => {
    try {
      const { data } = await toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isActive: data.isActive } : u)
      );
      toast.success(data.message);
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const monthLabels = (stats?.monthlyGrowth ?? []).map((m) => ({
    name:  MONTHS[m._id?.month] ?? "?",
    count: m.count ?? 0,
  }));

  if (loading) {
    return (
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        height:"100vh", background:"#030712",
      }}>
        <div style={{
          width:"48px", height:"48px",
          border:"3px solid rgba(249,115,22,0.2)",
          borderTopColor:"#f97316", borderRadius:"50%",
          animation:"spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showSplash && <WelcomeSplash onDone={handleSplashDone} />}

      <div style={{
        opacity:    dashVisible ? 1 : 0,
        transition: "opacity 0.6s ease 0.2s",
        // ✅ Extra bottom padding on mobile so content isn't behind bottom nav
        paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{
          position:             "sticky", top: 0, zIndex: 100,
          background:           "rgba(3,7,18,0.88)",
          borderBottom:         "1px solid rgba(255,255,255,0.06)",
          backdropFilter:       "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:            "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          <div
            className="admin-header-inner"
            style={{
              maxWidth:"1280px", margin:"0 auto",
              height:"64px",
              display:"flex", alignItems:"center",
              justifyContent:"space-between",
            }}
          >
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{
                width:"38px", height:"38px", borderRadius:"12px",
                background:"linear-gradient(135deg, #f97316, #dc2626)",
                boxShadow:"0 4px 16px rgba(249,115,22,0.4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink: 0,
              }}>
                <Shield size={18} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize:"14px", fontWeight:700, color:"#f8fafc", margin:0 }}>
                  FlowTracker Admin
                </p>
                <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", margin:0 }}>
                  Administration Panel
                </p>
              </div>
            </div>

            {/* ✅ Desktop-only tab bar — hidden on mobile/tablet via CSS */}
            <div
              className="admin-tabs-desktop"
              style={{
                gap:"4px", padding:"4px",
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:"16px",
              }}
            >
              {NAV_ITEMS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding:"8px 18px", borderRadius:"12px",
                    fontSize:"13px",
                    fontWeight: activeTab === id ? 700 : 500,
                    textTransform:"capitalize",
                    color:      activeTab === id ? "#fff" : "rgba(255,255,255,0.45)",
                    background: activeTab === id
                      ? "linear-gradient(135deg, #f97316, #dc2626)"
                      : "transparent",
                    border:"none", cursor:"pointer",
                    boxShadow: activeTab === id
                      ? "0 4px 14px rgba(249,115,22,0.35)" : "none",
                    transition:"all 0.3s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding:"9px 16px", borderRadius:"12px",
                fontSize:"13px", fontWeight:600,
                color:      "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.04)",
                border:     "1px solid rgba(255,255,255,0.08)",
                cursor:"pointer", transition:"all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color       = "#f87171";
                e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
                e.currentTarget.style.background  = "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color       = "rgba(255,255,255,0.5)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background  = "rgba(255,255,255,0.04)";
              }}
            >
              <LogOut size={14} />
              <span className="admin-logout-label">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Main ──────────────────────────────────────────────────────────── */}
        <main
          className="admin-main"
          style={{ maxWidth:"1280px", margin:"0 auto", position:"relative", zIndex:1 }}
        >

          {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
              <div className="admin-stat-grid">
                <StatCard title="Total Users"  value={stats?.totalUsers}  icon="👥" gradient="#3b82f6" delay={0.1}  />
                <StatCard title="Active Today" value={stats?.activeToday} icon="⚡" gradient="#22c55e" delay={0.15} />
                <StatCard title="Total Habits" value={stats?.totalHabits} icon="✅" gradient="#a855f7" delay={0.2}  />
                <StatCard
                  title="Growth 6M"
                  value={(stats?.monthlyGrowth ?? []).reduce((s, m) => s + (m.count ?? 0), 0)}
                  icon="📈" gradient="#f97316" delay={0.25}
                />
              </div>

              <div className="admin-chart-grid">
                <GlassChart
                  title="Monthly User Growth"
                  icon={<TrendingUp size={16} color="#f97316" />}
                  delay={0.3}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthLabels} barSize={28}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#f97316" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassChart>

                <GlassChart
                  title="Daily Active Users (7 Days)"
                  icon={<Users size={16} color="#3b82f6" />}
                  delay={0.35}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats?.dailyActive ?? []}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r:5, fill:"#3b82f6" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassChart>
              </div>
            </div>
          )}

          {/* ── LEADERBOARD ───────────────────────────────────────────────── */}
          {activeTab === "leaderboard" && (
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"24px", overflow:"hidden",
              backdropFilter:"blur(20px)",
              animation:"cardSlideIn 0.5s ease both",
            }}>
              <div style={{
                padding:"20px 24px",
                borderBottom:"1px solid rgba(255,255,255,0.06)",
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <h2 style={{ fontSize:"16px", fontWeight:700, color:"#f8fafc", margin:0 }}>
                  🏆 Top Users Leaderboard
                </h2>
                <span style={{
                  fontSize:"12px", fontWeight:600,
                  color:"rgba(249,115,22,0.8)", background:"rgba(249,115,22,0.1)",
                  border:"1px solid rgba(249,115,22,0.2)",
                  padding:"4px 10px", borderRadius:"8px",
                }}>
                  Top {stats?.leaderboard?.length ?? 0}
                </span>
              </div>

              {(stats?.leaderboard ?? []).length === 0 ? (
                <div style={{ padding:"48px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"14px" }}>
                  No leaderboard data yet
                </div>
              ) : (
                (stats.leaderboard).map((u, i) => (
                  <div
                    key={u._id}
                    className="leaderboard-row"
                    style={{
                      display:"flex", alignItems:"center", gap:"16px",
                      padding:"16px 24px",
                      borderBottom: i < stats.leaderboard.length - 1
                        ? "1px solid rgba(255,255,255,0.04)" : "none",
                      transition:"background 0.2s ease",
                      animation:`cardSlideIn 0.5s ease ${i * 0.05}s both`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width:"36px", height:"36px", borderRadius:"12px",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize: i < 3 ? "18px" : "13px", fontWeight:800, flexShrink:0,
                      background: i === 0 ? "linear-gradient(135deg,#f59e0b,#d97706)"
                        : i === 1 ? "linear-gradient(135deg,#94a3b8,#64748b)"
                        : i === 2 ? "linear-gradient(135deg,#b45309,#92400e)"
                        : "rgba(255,255,255,0.06)",
                      color: i < 3 ? "#0f172a" : "rgba(255,255,255,0.5)",
                    }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </div>
                    <img
                      src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f97316&color=fff`}
                      alt={u.name}
                      style={{
                        width:"42px", height:"42px", borderRadius:"14px",
                        objectFit:"cover", flexShrink:0,
                        border:"2px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{
                        fontSize:"14px", fontWeight:700, color:"#f8fafc",
                        margin:"0 0 2px", whiteSpace:"nowrap",
                        overflow:"hidden", textOverflow:"ellipsis",
                      }}>
                        {u.name}
                      </p>
                      <p className="leaderboard-email" style={{
                        fontSize:"12px", color:"rgba(255,255,255,0.35)",
                        margin:0, whiteSpace:"nowrap",
                        overflow:"hidden", textOverflow:"ellipsis",
                      }}>
                        {u.email}
                      </p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{
                        fontSize:"13px", fontWeight:800, margin:"0 0 2px",
                        background:"linear-gradient(135deg,#f97316,#dc2626)",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                      }}>
                        Level {u.level}
                      </p>
                      <p style={{ fontSize:"12px", color:"rgba(168,85,247,0.8)", margin:0 }}>
                        <Zap size={11} style={{ display:"inline", marginRight:3 }} />
                        {u.totalExp} EXP
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── USERS ─────────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"24px", overflow:"hidden",
              backdropFilter:"blur(20px)",
              animation:"cardSlideIn 0.5s ease both",
            }}>
              <div style={{
                padding:"20px 24px",
                borderBottom:"1px solid rgba(255,255,255,0.06)",
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <h2 style={{ fontSize:"16px", fontWeight:700, color:"#f8fafc", margin:0 }}>
                  All Users
                </h2>
                <span style={{
                  fontSize:"12px", fontWeight:600,
                  color:"rgba(59,130,246,0.8)", background:"rgba(59,130,246,0.1)",
                  border:"1px solid rgba(59,130,246,0.2)",
                  padding:"4px 10px", borderRadius:"8px",
                }}>
                  {users.length} total
                </span>
              </div>

              {users.length === 0 ? (
                <div style={{ padding:"48px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"14px" }}>
                  No users found
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"rgba(255,255,255,0.025)" }}>
                        {["User","Level","EXP","Joined","Status","Action"].map((h) => (
                          <th key={h} style={{
                            padding:"12px 20px", textAlign:"left",
                            fontSize:"11px", fontWeight:700,
                            textTransform:"uppercase", letterSpacing:"0.08em",
                            color:"rgba(255,255,255,0.3)",
                            borderBottom:"1px solid rgba(255,255,255,0.05)",
                            whiteSpace:"nowrap",
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
                            borderBottom:"1px solid rgba(255,255,255,0.04)",
                            transition:"background 0.2s ease",
                            animation:`cardSlideIn 0.4s ease ${i * 0.03}s both`,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding:"14px 20px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                              <img
                                src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f97316&color=fff`}
                                alt={u.name}
                                style={{
                                  width:"36px", height:"36px", borderRadius:"12px",
                                  objectFit:"cover", flexShrink:0,
                                  border:"1px solid rgba(255,255,255,0.08)",
                                }}
                              />
                              <div style={{ minWidth:0 }}>
                                <p style={{
                                  fontSize:"13px", fontWeight:700, color:"#f8fafc",
                                  margin:"0 0 2px", whiteSpace:"nowrap",
                                  overflow:"hidden", textOverflow:"ellipsis", maxWidth:"160px",
                                }}>
                                  {u.name}
                                </p>
                                <p style={{
                                  fontSize:"11px", color:"rgba(255,255,255,0.35)",
                                  margin:0, whiteSpace:"nowrap",
                                  overflow:"hidden", textOverflow:"ellipsis", maxWidth:"160px",
                                }}>
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"14px 20px" }}>
                            <span style={{
                              fontSize:"13px", fontWeight:800,
                              background:"linear-gradient(135deg,#f97316,#dc2626)",
                              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                            }}>
                              {u.level}
                            </span>
                          </td>
                          <td style={{ padding:"14px 20px", fontSize:"13px", color:"rgba(168,85,247,0.85)", fontWeight:600, whiteSpace:"nowrap" }}>
                            ⚡ {u.totalExp}
                          </td>
                          <td style={{ padding:"14px 20px", fontSize:"12px", color:"rgba(255,255,255,0.35)", whiteSpace:"nowrap" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ padding:"14px 20px" }}>
                            <span style={{
                              padding:"4px 10px", borderRadius:"8px",
                              fontSize:"11px", fontWeight:700, whiteSpace:"nowrap",
                              color:      u.isActive ? "#4ade80" : "#f87171",
                              background: u.isActive ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                              border:`1px solid ${u.isActive ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                            }}>
                              {u.isActive ? "● Active" : "● Inactive"}
                            </span>
                          </td>
                          <td style={{ padding:"14px 20px" }}>
                            <button
                              onClick={() => handleToggleUser(u._id)}
                              style={{
                                padding:"7px 14px", borderRadius:"10px",
                                fontSize:"12px", fontWeight:700,
                                cursor:"pointer", border:"1px solid",
                                transition:"all 0.2s ease", whiteSpace:"nowrap",
                                color:       u.isActive ? "#f87171" : "#4ade80",
                                background:  u.isActive ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)",
                                borderColor: u.isActive ? "rgba(248,113,113,0.2)"  : "rgba(74,222,128,0.2)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = u.isActive
                                  ? "rgba(248,113,113,0.18)" : "rgba(74,222,128,0.18)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = u.isActive
                                  ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)";
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
              )}
            </div>
          )}
        </main>
      </div>

      {/* ✅ ── Bottom Nav — mobile & tablet only (hidden on desktop) ────────── */}
      <nav style={{
        position:             "fixed",
        bottom:               0, left: 0, right: 0,
        zIndex:               200,
        display:              "none",            // overridden by CSS below
        alignItems:           "stretch",
        background:           "rgba(3,7,18,0.92)",
        borderTop:            "1px solid rgba(255,255,255,0.08)",
        backdropFilter:       "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow:            "0 -8px 32px rgba(0,0,0,0.4)",
        paddingBottom:        "env(safe-area-inset-bottom, 0px)",
      }}
        className="admin-bottom-nav"
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex:           1,
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "4px",
                padding:        "10px 4px 12px",
                background:     "transparent",
                border:         "none",
                cursor:         "pointer",
                transition:     "all 0.2s ease",
                position:       "relative",
              }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span style={{
                  position:     "absolute",
                  top:          0, left: "50%",
                  transform:    "translateX(-50%)",
                  width:        "32px", height: "3px",
                  borderRadius: "0 0 4px 4px",
                  background:   "linear-gradient(90deg, #f97316, #dc2626)",
                  boxShadow:    "0 0 10px rgba(249,115,22,0.6)",
                }} />
              )}

              {/* Icon with gradient when active */}
              <div style={{
                width:          "40px", height: "40px",
                borderRadius:   "14px",
                display:        "flex",
                alignItems:     "center", justifyContent: "center",
                background:     isActive
                  ? "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(220,38,38,0.15))"
                  : "transparent",
                border:         isActive
                  ? "1px solid rgba(249,115,22,0.3)"
                  : "1px solid transparent",
                transition:     "all 0.2s ease",
                boxShadow:      isActive ? "0 4px 14px rgba(249,115,22,0.2)" : "none",
              }}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? "#f97316" : "rgba(255,255,255,0.35)"}
                />
              </div>

              {/* Label */}
              <span style={{
                fontSize:   "10px",
                fontWeight: isActive ? 700 : 500,
                color:      isActive ? "#f97316" : "rgba(255,255,255,0.35)",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
              }}>
                {label}
              </span>
            </button>
          );
        })}

        {/* ── Logout tab ── */}
        <button
          onClick={handleLogout}
          style={{
            flex:           1,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "4px",
            padding:        "10px 4px 12px",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            transition:     "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.querySelector("span:last-child").style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.querySelector("span:last-child").style.color = "rgba(255,255,255,0.35)";
          }}
        >
          <div style={{
            width:"40px", height:"40px", borderRadius:"14px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <LogOut size={20} strokeWidth={1.8} color="rgba(248,113,113,0.7)" />
          </div>
          <span style={{
            fontSize:"10px", fontWeight:500,
            color:"rgba(248,113,113,0.7)",
            transition:"color 0.2s ease",
          }}>
            Logout
          </span>
        </button>
      </nav>

      {/* ── Global keyframes + bottom nav CSS ─────────────────────────────── */}
      <style>{`
        * { box-sizing: border-box; }

        @keyframes cardSlideIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* ── Show bottom nav on mobile & tablet, hide desktop tabs ── */
        @media (max-width: 1024px) {
          .admin-bottom-nav   { display: flex !important; }
          .admin-tabs-desktop { display: none !important; }
          .admin-logout-label { display: none !important; }
        }

        /* ── Desktop: hide bottom nav, show tab bar ── */
        @media (min-width: 1025px) {
          .admin-bottom-nav   { display: none  !important; }
          .admin-tabs-desktop { display: flex  !important; }
          .admin-logout-label { display: inline !important; }
        }

        /* ── Header padding ── */
        .admin-header-inner { padding: 0 24px; }
        @media (max-width: 768px) {
          .admin-header-inner { padding: 0 16px; }
        }

        /* ── Main padding ── */
        .admin-main { padding: clamp(16px,3vw,32px) clamp(16px,3vw,24px); }
        @media (max-width: 768px) {
          .admin-main { padding: 16px 12px; }
        }

        /* ── Stat grid ── */
        .admin-stat-grid {
          display: grid; gap: 16px;
          grid-template-columns: repeat(4,1fr);
        }
        @media (max-width: 1024px) {
          .admin-stat-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 480px) {
          .admin-stat-grid { grid-template-columns: 1fr; }
        }

        /* ── Chart grid ── */
        .admin-chart-grid {
          display: grid; gap: 20px;
          grid-template-columns: repeat(2,1fr);
        }
        @media (max-width: 900px) {
          .admin-chart-grid { grid-template-columns: 1fr; }
        }

        /* ── Table scroll ── */
        .admin-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .admin-table-wrap table { min-width: 640px; }

        /* ── Leaderboard mobile ── */
        @media (max-width: 420px) {
          .leaderboard-row   { flex-wrap: wrap; gap: 8px; }
          .leaderboard-email { display: none; }
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar       { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(249,115,22,0.4); }
      `}</style>
    </>
  );
};

export default AdminDashboard;