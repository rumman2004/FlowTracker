import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, registerUser } from "../../Services/authservice.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import toast from "react-hot-toast";
import {
  Eye, EyeOff, Mail, Lock,
  User, ArrowRight, ChevronRight, Zap,
} from "lucide-react";

// ─── Input Field ─────────────────────────────────────────────────────────────
const Field = ({ label, type, value, onChange, placeholder, icon: Icon, right, error }) => {
  const borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)";
  const bg          = error ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)";

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.08em",
        color: "rgba(255,255,255,0.4)", marginBottom: "8px",
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {/* Left icon */}
        <div style={{
          position: "absolute", left: "14px", top: "50%",
          transform: "translateY(-50%)",
          color: error ? "rgba(239,68,68,0.8)" : "rgba(99,102,241,0.6)",
          display: "flex", alignItems: "center", pointerEvents: "none",
        }}>
          <Icon size={15} />
        </div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: right ? "13px 44px 13px 42px" : "13px 14px 13px 42px",
            borderRadius: "14px", fontSize: "14px",
            color: "#f1f5f9", background: bg,
            border: `1px solid ${borderColor}`,
            outline: "none", boxSizing: "border-box",
            transition: "all 0.25s ease",
            WebkitTextFillColor: "#f1f5f9",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "rgba(239,68,68,0.8)" : "rgba(99,102,241,0.6)";
            e.target.style.boxShadow   = error
              ? "0 0 0 3px rgba(239,68,68,0.15)"
              : "0 0 0 3px rgba(99,102,241,0.15)";
            e.target.style.background  = "rgba(255,255,255,0.07)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = borderColor;
            e.target.style.boxShadow   = "none";
            e.target.style.background  = bg;
          }}
        />

        {right && (
          <div style={{
            position: "absolute", right: "14px",
            top: "50%", transform: "translateY(-50%)",
          }}>
            {right}
          </div>
        )}
      </div>

      {error && (
        <p style={{
          fontSize: "11px", color: "rgba(239,68,68,0.9)",
          marginTop: "5px", marginLeft: "4px", fontWeight: 500,
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

// ─── Main Auth Component ──────────────────────────────────────────────────────
const Auth = () => {
  const { loginUser: authLogin } = useAuth();
  const navigate                 = useNavigate();

  const [isLogin,   setIsLogin]   = useState(true);
  const [animating, setAnimating] = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = { name: "", email: "", password: "" };
    let ok = true;

    if (!isLogin && !form.name.trim()) {
      e.name = "Full name is required"; ok = false;
    }
    if (!form.email.trim()) {
      e.email = "Email is required"; ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address"; ok = false;
    }
    if (!form.password) {
      e.password = "Password is required"; ok = false;
    } else if (!isLogin && form.password.length < 6) {
      e.password = "Password must be at least 6 characters"; ok = false;
    }

    setErrors(e);
    return ok;
  };

  // ── Switch mode ─────────────────────────────────────────────────────────
  const switchMode = () => {
    if (animating) return;
    setAnimating(true);
    setShowPass(false);
    setForm({ name: "", email: "", password: "" });
    setErrors({ name: "", email: "", password: "" });
    setTimeout(() => {
      setIsLogin((p) => !p);
      setAnimating(false);
    }, 320);
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await loginUser({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        });
        authLogin(data);
        toast.success(`Welcome back, ${data.name}! 👋`);
      } else {
        const { data } = await registerUser({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        });
        authLogin(data);
        toast.success("Account created! Let's build some habits 🚀");
      }
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.toLowerCase().includes("email")) {
        setErrors((p) => ({ ...p, email: msg }));
      } else if (msg?.toLowerCase().includes("password")) {
        setErrors((p) => ({ ...p, password: msg }));
      } else {
        toast.error(msg || (isLogin ? "Login failed" : "Registration failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 90%, rgba(236,72,153,0.08) 0%, transparent 50%), #030712",
      padding: "24px 16px",
      position: "relative", overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Animated orbs ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", width: 650, height: 650,
        top: "-20%", left: "-15%",
        background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
        borderRadius: "50%", filter: "blur(60px)",
        animation: "floatOrb1 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500,
        bottom: "-15%", right: "-10%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
        borderRadius: "50%", filter: "blur(60px)",
        animation: "floatOrb2 10s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 320, height: 320,
        top: "35%", right: "18%",
        background: "radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)",
        borderRadius: "50%", filter: "blur(50px)",
        animation: "floatOrb1 12s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* ── Grid texture ──────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div style={{
        width: "100%", maxWidth: "420px",
        position: "relative", zIndex: 1,
        animation: "cardEntrance 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)",
          borderRadius: "32px",
          padding: "44px 40px 40px",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          position: "relative", overflow: "hidden",
          transition: "transform 0.4s ease, box-shadow 0.4s ease",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform  = "translateY(-4px)";
            e.currentTarget.style.boxShadow  = "0 48px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform  = "translateY(0)";
            e.currentTarget.style.boxShadow  = "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)";
          }}
        >

          {/* Liquid shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: "-100%",
            width: "300%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(139,92,246,0.5), transparent)",
            animation: "shimmerLine 4s ease-in-out infinite",
          }} />

          {/* Inner glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* ── Header ──────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: "30px", position: "relative" }}>

            {/* Logo badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "70px", height: "70px", borderRadius: "24px", marginBottom: "20px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 12px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
              animation: "badgePulse 3s ease-in-out infinite",
              position: "relative",
            }}>
              <Zap size={28} color="#fff" strokeWidth={2.5} />
              {/* Glow ring */}
              <div style={{
                position: "absolute", inset: -4,
                borderRadius: "28px",
                border: "1px solid rgba(99,102,241,0.35)",
                animation: "ringExpand 3s ease-in-out infinite",
              }} />
            </div>

            {/* Animated title */}
            <div style={{ overflow: "hidden", height: "38px", marginBottom: "6px" }}>
              <h1
                key={isLogin ? "login-t" : "reg-t"}
                style={{
                  fontSize: "27px", fontWeight: 800,
                  color: "#f8fafc", margin: 0,
                  letterSpacing: "-0.03em",
                  animation: animating
                    ? "titleSlideUp 0.32s ease forwards"
                    : "titleSlideDown 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                {isLogin ? "Welcome Back" : "Start Journey"}
              </h1>
            </div>

            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
              {isLogin
                ? "Sign in to continue your progress"
                : "Create your account — it's free"}
            </p>
          </div>

          {/* ── Tab switcher ────────────────────────────────────────── */}
          <div style={{
            display: "flex", gap: "4px", padding: "4px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "28px",
          }}>
            {["Sign In", "Sign Up"].map((label, idx) => {
              const active = isLogin ? idx === 0 : idx === 1;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={!active ? switchMode : undefined}
                  style={{
                    flex: 1, padding: "9px 0",
                    borderRadius: "12px", fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#ffffff" : "rgba(255,255,255,0.4)",
                    background: active
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "transparent",
                    border: "none",
                    cursor: active ? "default" : "pointer",
                    boxShadow: active ? "0 4px 14px rgba(99,102,241,0.4)" : "none",
                    transition: "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Form ────────────────────────────────────────────────── */}
          <div style={{
            transition: "opacity 0.32s ease",
            opacity: animating ? 0 : 1,
          }}>
            <form onSubmit={handleSubmit} noValidate>

              {/* Name — register only */}
              <div style={{
                maxHeight: isLogin ? "0px" : "105px",
                overflow: "hidden", opacity: isLogin ? 0 : 1,
                transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
              }}>
                <Field
                  label="Full Name" type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Your Name"
                  icon={User} error={errors.name}
                />
              </div>

              {/* Email */}
              <Field
                label="Email" type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="you@example.com"
                icon={Mail} error={errors.email}
              />

              {/* Password */}
              <Field
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
                icon={Lock} error={errors.password}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.3)", display: "flex",
                      alignItems: "center", padding: 0, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Forgot password */}
              <div style={{
                maxHeight: isLogin ? "28px" : "0px",
                overflow: "hidden", opacity: isLogin ? 1 : 0,
                transition: "max-height 0.35s ease, opacity 0.3s ease",
                textAlign: "right", marginTop: "-8px", marginBottom: "18px",
              }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "12px", color: "#6366f1",
                    fontWeight: 600, textDecoration: "none",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: "16px", fontSize: "15px", fontWeight: 700,
                  color: "#ffffff",
                  background: loading
                    ? "rgba(99,102,241,0.4)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 8px 28px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                  transition: "all 0.25s ease",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform  = "translateY(-2px)";
                    e.currentTarget.style.boxShadow  = "0 14px 36px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.25)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform  = "translateY(0)";
                    e.currentTarget.style.boxShadow  = "0 8px 28px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: "16px", height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    {isLogin ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Divider ─────────────────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            margin: "22px 0",
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* ── Switch CTA ───────────────────────────────────────────── */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 700, color: "#6366f1",
                  padding: 0, transition: "opacity 0.2s",
                  display: "inline-flex", alignItems: "center", gap: "3px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                {isLogin ? "Sign up free" : "Sign in"}
                <ChevronRight size={13} strokeWidth={2.5} />
              </button>
            </p>
          </div>

          {/* ── Footer strip ─────────────────────────────────────────── */}
          <p style={{
            textAlign: "center", fontSize: "11px",
            color: "rgba(255,255,255,0.2)", marginTop: "24px", marginBottom: 0,
          }}>
            ⚡ Flow Tracker — Build better habits
          </p>
        </div>
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(30px, -20px) scale(1.05); }
          66%      { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-25px, 20px) scale(1.08); }
          66%      { transform: translate(20px, -10px) scale(0.92); }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 12px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3); }
          50%      { box-shadow: 0 12px 55px rgba(99,102,241,0.72), 0 0 0 1px rgba(255,255,255,0.2),  inset 0 1px 0 rgba(255,255,255,0.3); }
        }
        @keyframes ringExpand {
          0%, 100% { transform: scale(1);    opacity: 0.3; }
          50%      { transform: scale(1.15); opacity: 0;   }
        }
        @keyframes shimmerLine {
          0%   { left: -100%; }
          100% { left:  100%; }
        }
        @keyframes titleSlideDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        @keyframes titleSlideUp {
          from { opacity: 1; transform: translateY(0);     }
          to   { opacity: 0; transform: translateY(14px);  }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;