import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../Services/authservice.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import toast from "react-hot-toast";
import { FiShield, FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";

const AdminLogin = () => {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({ email: "", password: "" });
  const { loginAdmin: authAdmin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = { email: "", password: "" };
    let ok = true;
    if (!form.email.trim()) { e.email = "Email is required"; ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { e.email = "Invalid email"; ok = false; }
    if (!form.password) { e.password = "Password is required"; ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await loginAdmin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      authAdmin(data);
      toast.success("Admin access granted!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at 20% 50%, rgba(251,146,60,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(239,68,68,0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.1) 0%, transparent 50%), #030712",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Animated background orbs */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        top: "-20%", left: "-15%",
        background: "radial-gradient(circle, rgba(251,146,60,0.12), transparent 70%)",
        borderRadius: "50%", filter: "blur(60px)",
        animation: "floatOrb1 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500,
        bottom: "-15%", right: "-10%",
        background: "radial-gradient(circle, rgba(239,68,68,0.1), transparent 70%)",
        borderRadius: "50%", filter: "blur(60px)",
        animation: "floatOrb2 10s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300,
        top: "40%", right: "20%",
        background: "radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)",
        borderRadius: "50%", filter: "blur(50px)",
        animation: "floatOrb1 12s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* Liquid glass grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Card */}
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
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Inner liquid shimmer */}
          <div style={{
            position: "absolute", top: 0, left: "-100%",
            width: "300%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(251,146,60,0.6), rgba(239,68,68,0.4), transparent)",
            animation: "shimmerLine 4s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(251,146,60,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px", position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "70px", height: "70px", borderRadius: "24px", marginBottom: "20px",
              background: "linear-gradient(135deg, #f97316, #dc2626)",
              boxShadow: "0 12px 40px rgba(249,115,22,0.5), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
              animation: "badgePulse 3s ease-in-out infinite",
              position: "relative",
            }}>
              <FiShield size={28} color="#fff" strokeWidth={2} />
              {/* Glow ring */}
              <div style={{
                position: "absolute", inset: -4,
                borderRadius: "28px",
                border: "1px solid rgba(249,115,22,0.3)",
                animation: "ringExpand 3s ease-in-out infinite",
              }} />
            </div>

            <h1 style={{
              fontSize: "28px", fontWeight: 800,
              color: "#f8fafc", margin: "0 0 6px",
              letterSpacing: "-0.03em",
            }}>
              Admin Portal
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
              FlowTracker Administration
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block", fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)", marginBottom: "8px",
              }}>Admin Email</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.email ? "rgba(239,68,68,0.8)" : "rgba(251,146,60,0.6)",
                  display: "flex", alignItems: "center", pointerEvents: "none",
                }}>
                  <FiMail size={15} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="admin@flowtracker.com"
                  style={{
                    width: "100%", padding: "13px 14px 13px 42px",
                    borderRadius: "14px", fontSize: "14px",
                    color: "#f1f5f9",
                    background: errors.email ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${errors.email ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                    outline: "none", boxSizing: "border-box",
                    transition: "all 0.25s ease",
                    WebkitTextFillColor: "#f1f5f9",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.email ? "rgba(239,68,68,0.8)" : "rgba(249,115,22,0.6)";
                    e.target.style.boxShadow = errors.email
                      ? "0 0 0 3px rgba(239,68,68,0.15)"
                      : "0 0 0 3px rgba(249,115,22,0.15)";
                    e.target.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = errors.email ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)";
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: "11px", color: "rgba(239,68,68,0.9)", marginTop: "5px", marginLeft: "4px", fontWeight: 500 }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block", fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)", marginBottom: "8px",
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.password ? "rgba(239,68,68,0.8)" : "rgba(251,146,60,0.6)",
                  display: "flex", alignItems: "center", pointerEvents: "none",
                }}>
                  <FiLock size={15} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="••••••••"
                  style={{
                    width: "100%", padding: "13px 44px 13px 42px",
                    borderRadius: "14px", fontSize: "14px",
                    color: "#f1f5f9",
                    background: errors.password ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${errors.password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                    outline: "none", boxSizing: "border-box",
                    transition: "all 0.25s ease",
                    WebkitTextFillColor: "#f1f5f9",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.password ? "rgba(239,68,68,0.8)" : "rgba(249,115,22,0.6)";
                    e.target.style.boxShadow = errors.password
                      ? "0 0 0 3px rgba(239,68,68,0.15)"
                      : "0 0 0 3px rgba(249,115,22,0.15)";
                    e.target.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = errors.password ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", display: "flex",
                    alignItems: "center", padding: 0, transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#f97316"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                >
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: "11px", color: "rgba(239,68,68,0.9)", marginTop: "5px", marginLeft: "4px", fontWeight: 500 }}>
                  {errors.password}
                </p>
              )}
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
                  ? "rgba(249,115,22,0.4)"
                  : "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 8px 28px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                transition: "all 0.25s ease",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 14px 36px rgba(249,115,22,0.55), inset 0 1px 0 rgba(255,255,255,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.25)";
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
                  Authenticating...
                </>
              ) : (
                <>
                  <FiShield size={16} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: "center", fontSize: "11px",
            color: "rgba(255,255,255,0.2)", marginTop: "24px", marginBottom: 0,
          }}>
            🔒 Secure Admin Access · FlowTracker
          </p>
        </div>
      </div>

      <style>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.08); }
          66% { transform: translate(20px, -10px) scale(0.92); }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 12px 40px rgba(249,115,22,0.5), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3); }
          50% { box-shadow: 0 12px 55px rgba(249,115,22,0.7), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3); }
        }
        @keyframes ringExpand {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes shimmerLine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminLogin;