import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx"; // ✅
import { getProfile } from "../../Services/userservice.js";
import ProgressBar from "../../components/UI/ProgressBar.jsx";
import { Zap, Trophy, Crown, Star, Award, Flame } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_TITLES = [
  { level: 1,  title: "Beginner",     emoji: "🌱", color: "#10b981", icon: Star  },
  { level: 5,  title: "Apprentice",   emoji: "⚡", color: "#3b82f6", icon: Zap   },
  { level: 10, title: "Practitioner", emoji: "🔥", color: "#f97316", icon: Flame },
  { level: 20, title: "Expert",       emoji: "💎", color: "#8b5cf6", icon: Award },
  { level: 30, title: "Master",       emoji: "👑", color: "#f59e0b", icon: Crown },
  { level: 50, title: "Legend",       emoji: "🌟", color: "#ec4899", icon: Trophy},
];

const getLevelTitle = (level) => {
  let title = LEVEL_TITLES[0];
  for (const t of LEVEL_TITLES) {
    if (level >= t.level) title = t;
  }
  return title;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LevelUp = () => {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme(); // ✅
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        updateUser({
          level:    data.level,
          exp:      data.exp,
          totalExp: data.totalExp,
        });
      } catch {}
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const textPrimary   = isDark ? "#f1f5f9"                : "#0f172a";
  const textSecondary = isDark ? "#94a3b8"                : "#64748b";
  const textMuted     = isDark ? "#6b7280"                : "#9ca3af";
  const cardBg        = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const cardBorder    = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const formulaBg     = isDark ? "rgba(99,102,241,0.1)"  : "rgba(99,102,241,0.07)";
  const rowIdleBg     = isDark ? "rgba(255,255,255,0.03)": "rgba(0,0,0,0.03)";
  const milestoneLockedBg     = isDark
    ? "rgba(255,255,255,0.03)"
    : "rgba(0,0,0,0.03)";
  const milestoneLockedBorder = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";

  // ── Derived ──────────────────────────────────────────────────────────────
  const level        = user?.level || 1;
  const exp          = user?.exp   || 0;
  const expForNext   = level * 100;
  const currentTitle = getLevelTitle(level);
  const nextTitle    = getLevelTitle(level + 1);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div
          className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor:   "#6366f1",
            borderRightColor: "#8b5cf6",
          }}
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="fade-up">
        <h1 className="text-2xl font-black" style={{ color: textPrimary }}>
          Level Progress
        </h1>
        <p className="text-sm mt-0.5" style={{ color: textSecondary }}>
          Your journey so far
        </p>
      </div>

      {/* ── Current Level Hero ───────────────────────────────────────────── */}
      <div
        className="liquid-glass liquid-glass-shimmer p-8 text-center
                   rounded-2xl fade-up stagger-1"
        style={{
          background: `linear-gradient(135deg, ${currentTitle.color}dd,
                        ${currentTitle.color}99)`,
          boxShadow:  `0 20px 60px ${currentTitle.color}40`,
          border:     `1px solid ${currentTitle.color}40`,
        }}
      >
        <div
          className="text-7xl mb-3"
          style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}
        >
          {currentTitle.emoji}
        </div>
        <p className="text-white/80 font-semibold text-sm uppercase tracking-widest">
          {currentTitle.title}
        </p>
        <p className="text-6xl font-black text-white mt-1">
          Level {level}
        </p>
        <p className="text-white/70 text-sm mt-2 font-medium">
          {(user?.totalExp || 0).toLocaleString()} Total EXP
        </p>
      </div>

      {/* ── Progress to Next Level ───────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-2"
        style={{
          background: cardBg,
          border:     `1px solid ${cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: textMuted }}
            >
              Next Milestone
            </p>
            <p className="text-lg font-black mt-0.5" style={{ color: textPrimary }}>
              {nextTitle.emoji} {nextTitle.title}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-black"
              style={{ color: currentTitle.color }}
            >
              {exp}
            </p>
            <p className="text-xs" style={{ color: textMuted }}>
              / {expForNext} EXP
            </p>
          </div>
        </div>

        <ProgressBar
          value={exp}
          max={expForNext}
          color={currentTitle.color}
          height={12}
        />

        <div
          className="flex justify-between text-xs mt-2"
          style={{ color: textMuted }}
        >
          <span>Level {level}</span>
          <span className="font-semibold" style={{ color: currentTitle.color }}>
            {expForNext - exp} EXP to go
          </span>
          <span>Level {level + 1}</span>
        </div>
      </div>

      {/* ── Level Formula ────────────────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-3"
        style={{
          background: cardBg,
          border:     `1px solid ${cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <h3
          className="font-bold text-sm mb-3 flex items-center gap-2"
          style={{ color: textPrimary }}
        >
          <Zap className="w-4 h-4 text-indigo-500" />
          Level Formula
        </h3>

        <div
          className="rounded-xl p-3 text-center mb-3 font-mono text-sm font-bold"
          style={{ background: formulaBg, color: "#6366f1" }}
        >
          EXP needed = Current Level × 100
        </div>

        <div className="space-y-1.5">
          {[level - 1, level, level + 1, level + 2]
            .filter((l) => l > 0)
            .map((l) => {
              const isCurrentLevel = l === level;
              return (
                <div
                  key={l}
                  className="flex justify-between text-sm px-3 py-2 rounded-xl transition"
                  style={{
                    background: isCurrentLevel
                      ? "rgba(99,102,241,0.12)"
                      : rowIdleBg,
                    fontWeight: isCurrentLevel ? 700 : 500,
                    color:      isCurrentLevel ? "#6366f1" : textSecondary,
                  }}
                >
                  <span>Level {l} → {l + 1}</span>
                  <span>{l * 100} EXP</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── Milestone Badges ─────────────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-4"
        style={{
          background: cardBg,
          border:     `1px solid ${cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <h3
          className="font-bold text-sm mb-4 flex items-center gap-2"
          style={{ color: textPrimary }}
        >
          <Trophy className="w-4 h-4 text-yellow-500" />
          Milestones
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {LEVEL_TITLES.map((m) => {
            const reached = level >= m.level;
            return (
              <div
                key={m.level}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: reached
                    ? `${m.color}12`
                    : milestoneLockedBg,
                  border: reached
                    ? `1.5px solid ${m.color}35`
                    : `1.5px solid ${milestoneLockedBorder}`,
                  opacity: reached ? 1 : 0.45,
                  filter:  reached ? "none" : "grayscale(1)",
                }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: textPrimary }}
                  >
                    {m.title}
                  </p>
                  <p className="text-xs" style={{ color: textMuted }}>
                    Level {m.level}+
                  </p>
                </div>
                {reached && (
                  <span className="text-green-500 text-base">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EXP Sources ──────────────────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-5"
        style={{
          background: cardBg,
          border:     `1px solid ${cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <h3
          className="font-bold text-sm mb-3"
          style={{ color: textPrimary }}
        >
          Ways to Earn EXP
        </h3>

        {[
          {
            label: "Complete a habit",
            value: "+5 to +100 EXP",
            bg:    isDark ? "rgba(16,185,129,0.09)"  : "rgba(16,185,129,0.07)",
            color: "#10b981",
            emoji: "✅",
          },
          {
            label: "Daily streak bonus",
            value: "Multiplier",
            bg:    isDark ? "rgba(249,115,22,0.09)"  : "rgba(249,115,22,0.07)",
            color: "#f97316",
            emoji: "🔥",
          },
          {
            label: "100% daily completion",
            value: "Full day bonus",
            bg:    isDark ? "rgba(99,102,241,0.09)"  : "rgba(99,102,241,0.07)",
            color: "#6366f1",
            emoji: "⭐",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3
                       rounded-xl mb-2 last:mb-0"
            style={{ background: item.bg }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: textPrimary }}
            >
              {item.emoji} {item.label}
            </span>
            <span
              className="text-sm font-black"
              style={{ color: item.color }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelUp;