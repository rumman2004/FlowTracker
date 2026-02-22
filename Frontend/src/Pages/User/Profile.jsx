import { useState, useRef } from "react";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx"; // ✅
import { updateProfile } from "../../Services/userservice.js";
import toast from "react-hot-toast";
import {
  Camera, Edit3, Check, X,
  Zap, Flame, Trophy, Settings,
} from "lucide-react";
import ProgressBar from "../../components/UI/ProgressBar.jsx";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme(); // ✅
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name,      setName]      = useState(user?.name || "");
  const [preview,   setPreview]   = useState(null);
  const [file,      setFile]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const fileRef = useRef();

  // ── Theme tokens ────────────────────────────────────────────────────────
  const textPrimary   = isDark ? "#f1f5f9"                : "#0f172a";
  const textSecondary = isDark ? "#94a3b8"                : "#64748b";
  const cardBg        = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const cardBorder    = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const heroBg        = isDark
    ? "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.07))"
    : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))";
  const statColor     = isDark ? "#f1f5f9" : "#0f172a";

  // ── Derived ──────────────────────────────────────────────────────────────
  const expForNext = (user?.level || 1) * 100;

  const avatarSrc =
    preview ||
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "U"
    )}&background=6366f1&color=fff&size=200`;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("profilePic", file);
      const { data } = await updateProfile(formData);
      updateUser(data);
      toast.success("Profile updated!");
      setIsEditing(false);
      setFile(null);
      setPreview(null);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setPreview(null);
    setFile(null);
  };

  const stats = [
    {
      label: "Level",
      value: user?.level || 1,
      icon:  <Trophy className="w-4 h-4 text-yellow-500" />,
      color: "#f59e0b",
    },
    {
      label: "Total EXP",
      value: (user?.totalExp || 0).toLocaleString(),
      icon:  <Zap className="w-4 h-4 text-indigo-500" />,
      color: "#6366f1",
    },
    {
      label: "Streak",
      value: `${user?.streak || 0}d`,
      icon:  <Flame className="w-4 h-4 text-orange-500" />,
      color: "#f97316",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto pb-24 md:pb-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="fade-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: textPrimary }}>
            My Profile
          </h1>
          <p className="text-sm mt-0.5" style={{ color: textSecondary }}>
            View and edit your profile
          </p>
        </div>

        {/* Settings icon — mobile only */}
        <button
          onClick={() => navigate("/settings")}
          className="md:hidden flex items-center justify-center w-10 h-10
                     rounded-2xl transition-all duration-200 active:scale-95"
          style={{
            background: "rgba(99,102,241,0.1)",
            border:     "1px solid rgba(99,102,241,0.2)",
            color:      isDark ? "#94a3b8" : "#6366f1",
          }}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ── Profile Hero Card ────────────────────────────────────────────── */}
      <div
        className="liquid-glass p-6 fade-up stagger-1 text-center rounded-2xl"
        style={{
          background: heroBg,
          border: `1px solid ${cardBorder}`,
        }}
      >
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div
            className="w-24 h-24 rounded-full overflow-hidden mx-auto"
            style={{
              boxShadow:
                "0 0 0 3px rgba(99,102,241,0.3), 0 0 0 6px rgba(99,102,241,0.1)",
            }}
          >
            <img
              src={avatarSrc}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {isEditing && (
            <button
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full
                         flex items-center justify-center text-white
                         shadow-lg transition hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Name */}
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xl font-black text-center focus:outline-none
                       focus:ring-2 focus:ring-indigo-400/50 w-full
                       max-w-xs mx-auto block rounded-xl px-4 py-2"
            style={{
              color:      textPrimary,
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              border:     `1px solid ${isDark
                ? "rgba(99,102,241,0.35)"
                : "rgba(99,102,241,0.25)"}`,
            }}
          />
        ) : (
          <h2 className="text-xl font-black" style={{ color: textPrimary }}>
            {user?.name}
          </h2>
        )}

        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          {user?.email}
        </p>

        {/* Level badge */}
        <div
          className="mt-3 inline-flex items-center gap-2 px-4 py-1.5
                     rounded-full text-sm font-bold text-white level-badge"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <Zap className="w-3.5 h-3.5" />
          Level {user?.level}
        </div>

        {/* Edit / Save Buttons */}
        <div className="mt-5 flex justify-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                           text-sm font-semibold transition hover:opacity-80"
                style={{
                  color:      textSecondary,
                  background: isDark
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(0,0,0,0.05)",
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                           text-sm font-semibold text-white transition
                           disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow:  "0 4px 15px rgba(99,102,241,0.3)",
                }}
              >
                <Check className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl
                         text-sm font-semibold transition"
              style={{
                color:      isDark ? "#818cf8" : "#4f46e5",
                background: "rgba(99,102,241,0.1)",
                border:     "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Pills ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 fade-up stagger-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 text-center rounded-2xl card-hover"
            style={{
              background: cardBg,
              border:     `1px solid ${cardBorder}`,
            }}
          >
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <p
              className="text-xl font-black"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── EXP Progress ────────────────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-3"
        style={{
          background: cardBg,
          border:     `1px solid ${cardBorder}`,
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold" style={{ color: textPrimary }}>
            Progress to Level {(user?.level || 1) + 1}
          </p>
          <p className="text-xs font-semibold" style={{ color: "#6366f1" }}>
            {user?.exp} / {expForNext} EXP
          </p>
        </div>
        <ProgressBar
          value={user?.exp || 0}
          max={expForNext}
          color="#6366f1"
          height={10}
        />
        <p className="text-xs mt-2" style={{ color: textSecondary }}>
          {expForNext - (user?.exp || 0)} EXP remaining
        </p>
      </div>
    </div>
  );
};

export default Profile;