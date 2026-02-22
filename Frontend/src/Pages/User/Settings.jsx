import { useState } from "react";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx";
import {
  changePassword, updateSettings, deleteAccount,
} from "../../Services/userservice.js";
import Modal from "../../components/UI/Modal.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Lock, Trash2, Moon, Sun, Bell, LogOut,
  HelpCircle, Zap, Flame, Shield, ChevronRight,
} from "lucide-react";

const Settings = () => {
  const { user, updateUser, logoutUser } = useAuth();
  const { theme, toggleTheme, isDark }   = useTheme();
  const navigate = useNavigate();

  const [passModal,    setPassModal]    = useState(false);
  const [deleteModal,  setDeleteModal]  = useState(false);
  const [logoutModal,  setLogoutModal]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirm: "",
  });
  const [notifications, setNotifications] = useState(
    user?.notifications || { email: true, push: true }
  );

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const textPrimary     = isDark ? "#f1f5f9"                : "#0f172a";
  const textSecondary   = isDark ? "#94a3b8"                : "#64748b";
  const textMuted       = isDark ? "#6b7280"                : "#9ca3af";
  const pageBg          = isDark ? "transparent"            : "transparent";
  const cardBg          = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const cardBorder      = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const rowBorder       = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const dangerRowBorder = isDark ? "rgba(239,68,68,0.15)"  : "rgba(239,68,68,0.1)";
  const iconBg          = isDark ? "rgba(99,102,241,0.12)"  : "rgba(99,102,241,0.08)";
  const dangerIconBg    = isDark ? "rgba(239,68,68,0.12)"   : "rgba(239,68,68,0.08)";

  // Modal form tokens (modal panel is always dark glass)
  const fieldBg       = "rgba(255,255,255,0.07)";
  const fieldBorder   = "rgba(255,255,255,0.14)";
  const fieldText     = "#ffffff";
  const labelColor    = "rgba(255,255,255,0.45)";
  const focusBorder   = "rgba(99,102,241,0.7)";
  const focusRing     = "rgba(99,102,241,0.18)";
  const cancelBg      = "rgba(255,255,255,0.07)";
  const cancelBgHover = "rgba(255,255,255,0.12)";
  const cancelText    = "rgba(255,255,255,0.6)";
  const cancelBorder  = "rgba(255,255,255,0.12)";

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm)
      return toast.error("Passwords do not match");
    if (passwordForm.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPassModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setLoading(false); }
  };

  const handleNotificationChange = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await updateSettings({ notifications: updated });
      updateUser({ notifications: updated });
      toast.success("Notifications updated");
    } catch { toast.error("Failed to update notifications"); }
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    try {
      await updateSettings({ theme: newTheme });
      updateUser({ theme: newTheme });
    } catch { /* silent */ }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      logoutUser();
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch { toast.error("Failed to delete account"); }
    finally   { setLoading(false); }
  };

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // ── Sub-components ────────────────────────────────────────────────────────

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className="relative inline-flex h-6 w-11 items-center rounded-full
                 transition-all duration-300 flex-shrink-0"
      style={{
        background: enabled
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        boxShadow: enabled ? "0 2px 10px rgba(99,102,241,0.3)" : "none",
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-md
                   transition-transform duration-300"
        style={{
          transform: enabled ? "translateX(24px)" : "translateX(4px)",
        }}
      />
    </button>
  );

  const SettingRow = ({ icon: Icon, iconColor, title, desc, action, danger }) => (
    <div
      className="flex items-center gap-4 py-4 border-b last:border-0 transition-all"
      style={{
        borderColor: danger ? dangerRowBorder : rowBorder,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: danger ? dangerIconBg : iconBg }}
      >
        <Icon
          className="w-4 h-4"
          style={{
            color: danger ? "#f87171" : iconColor || "#6366f1",
          }}
          strokeWidth={2}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: danger ? "#f87171" : textPrimary }}
        >
          {title}
        </p>
        {desc && (
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: textMuted }}
          >
            {desc}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  );

  const Section = ({ title, children, delay = 0 }) => (
    <div
      className="rounded-2xl p-5 fade-up"
      style={{
        animationDelay: `${delay}s`,
        background:     cardBg,
        border:         `1px solid ${cardBorder}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        className="text-xs font-bold uppercase tracking-wider mb-1"
        style={{ color: textMuted }}
      >
        {title}
      </h2>
      {children}
    </div>
  );

  // Shared modal field style (always dark)
  const mFieldStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    color: fieldText,
    background: fieldBg,
    border: `1px solid ${fieldBorder}`,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    WebkitTextFillColor: fieldText,
  };

  const mLabelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: labelColor,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24 md:pb-6">

      {/* Header */}
      <div className="fade-up">
        <h1 className="text-2xl font-black" style={{ color: textPrimary }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: textSecondary }}>
          Manage your preferences
        </p>
      </div>

      {/* ── Appearance ──────────────────────────────────────────────────── */}
      <Section title="Appearance" delay={0.05}>
        <SettingRow
          icon={isDark ? Moon : Sun}
          iconColor={isDark ? "#818cf8" : "#f59e0b"}
          title="Dark Mode"
          desc="Toggle between dark and light theme"
          action={
            <ToggleSwitch
              enabled={isDark}
              onToggle={handleThemeToggle}
            />
          }
        />
      </Section>

      {/* ── Notifications ───────────────────────────────────────────────── */}
      <Section title="Notifications" delay={0.1}>
        <SettingRow
          icon={Bell}
          iconColor="#60a5fa"
          title="Email Notifications"
          desc="Habit reminders and weekly reports via email"
          action={
            <ToggleSwitch
              enabled={notifications.email}
              onToggle={() => handleNotificationChange("email")}
            />
          }
        />
        <SettingRow
          icon={Bell}
          iconColor="#a78bfa"
          title="Push Notifications"
          desc="Browser push notifications for daily reminders"
          action={
            <ToggleSwitch
              enabled={notifications.push}
              onToggle={() => handleNotificationChange("push")}
            />
          }
        />
      </Section>

      {/* ── Security ────────────────────────────────────────────────────── */}
      <Section title="Security" delay={0.15}>
        <SettingRow
          icon={Lock}
          iconColor="#6366f1"
          title="Change Password"
          desc="Update your account password"
          action={
            <button
              onClick={() => setPassModal(true)}
              className="flex items-center gap-1 text-xs font-semibold
                         transition hover:opacity-75"
              style={{ color: "#6366f1" }}
            >
              Change <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </Section>

      {/* ── Help & Info ──────────────────────────────────────────────────── */}
      <Section title="Help & Information" delay={0.2}>
        <SettingRow
          icon={HelpCircle}
          iconColor="#60a5fa"
          title="How It Works"
          desc="Habits reset daily at midnight (12:00 AM). Complete habits to earn EXP and level up!"
        />
        <SettingRow
          icon={Zap}
          iconColor="#fbbf24"
          title="EXP System"
          desc="Each level requires (level × 100) EXP. Complete habits daily for bonus experience."
        />
        <SettingRow
          icon={Flame}
          iconColor="#fb923c"
          title="Streaks"
          desc="Complete at least one habit every day to maintain and grow your streak counter."
        />
        <SettingRow
          icon={Shield}
          iconColor="#34d399"
          title="App Version"
          desc="Flow Tracker v1.0"
        />
      </Section>

      {/* ── Account Actions ──────────────────────────────────────────────── */}
      <Section title="Account" delay={0.25}>
        <SettingRow
          icon={LogOut}
          iconColor="#818cf8"
          title="Sign Out"
          desc="Log out of your account on this device"
          action={
            <button
              onClick={() => setLogoutModal(true)}
              className="flex items-center gap-1 text-xs font-semibold
                         transition hover:opacity-75"
              style={{ color: "#6366f1" }}
            >
              Logout <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <SettingRow
          icon={Trash2}
          danger
          title="Delete Account"
          desc="Permanently delete your account and all data. This cannot be undone."
          action={
            <button
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-1 text-xs font-semibold
                         transition hover:opacity-75"
              style={{ color: "#f87171" }}
            >
              Delete <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          MODALS — all use dark-glass token set (modal bg is always dark)
      ══════════════════════════════════════════════════════════════════ */}

      {/* Change Password */}
      <Modal
        isOpen={passModal}
        onClose={() => setPassModal(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword}>
          {[
            { key: "currentPassword", label: "Current Password" },
            { key: "newPassword",     label: "New Password"     },
            { key: "confirm",         label: "Confirm New Password" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: "16px" }}>
              <label style={mLabelStyle}>{label}</label>
              <input
                type="password"
                value={passwordForm[key]}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, [key]: e.target.value })
                }
                style={mFieldStyle}
                placeholder="••••••••"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = focusBorder;
                  e.target.style.boxShadow   = `0 0 0 3px ${focusRing}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = fieldBorder;
                  e.target.style.boxShadow   = "none";
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={() => setPassModal(false)}
              style={{
                flex: 1, padding: "12px", borderRadius: "14px",
                fontSize: "14px", fontWeight: 600,
                color: cancelText, background: cancelBg,
                border: `1px solid ${cancelBorder}`,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = cancelBgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = cancelBg)
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "12px", borderRadius: "14px",
                fontSize: "14px", fontWeight: 700,
                color: "#ffffff",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation */}
      <Modal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Sign Out"
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px", height: "64px", borderRadius: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              background: "rgba(99,102,241,0.12)",
            }}
          >
            <LogOut style={{ width: "30px", height: "30px", color: "#818cf8" }} />
          </div>

          <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "15px" }}>
            Are you sure you want to sign out?
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "6px", marginBottom: "24px" }}>
            Your progress is saved and you can log back in anytime.
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setLogoutModal(false)}
              style={{
                flex: 1, padding: "12px", borderRadius: "14px",
                fontSize: "14px", fontWeight: 600,
                color: cancelText, background: cancelBg,
                border: `1px solid ${cancelBorder}`, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = cancelBgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = cancelBg)
              }
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              style={{
                flex: 1, padding: "12px", borderRadius: "14px",
                fontSize: "14px", fontWeight: 700, color: "#ffffff",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Account */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Account"
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px", height: "64px", borderRadius: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              background: "rgba(239,68,68,0.12)",
            }}
          >
            <Trash2 style={{ width: "30px", height: "30px", color: "#f87171" }} />
          </div>

          <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "15px" }}>
            Permanently delete account?
          </p>
          <p style={{
            color: "rgba(255,255,255,0.4)", fontSize: "13px",
            marginTop: "6px", marginBottom: "24px", lineHeight: "1.6",
          }}>
            This will delete all your habits, progress, EXP history and account
            data. This action{" "}
            <span style={{ color: "#f87171", fontWeight: 600 }}>
              cannot be undone
            </span>.
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setDeleteModal(false)}
              style={{
                flex: 1, padding: "12px", borderRadius: "14px",
                fontSize: "14px", fontWeight: 600,
                color: cancelText, background: cancelBg,
                border: `1px solid ${cancelBorder}`, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = cancelBgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = cancelBg)
              }
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              style={{
                flex: 1, padding: "12px", borderRadius: "14px",
                fontSize: "14px", fontWeight: 700, color: "#ffffff",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239,68,68,0.3)",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;