import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx";
import { getWeeklyProgress } from "../../Services/userservice.js";
import { getTodayProgress } from "../../Services/habitservice.js";
import API from "../../Services/api.js";
import StatCard from "../../components/UI/StatCard.jsx";
import ProgressBar from "../../components/UI/ProgressBar.jsx";
import {
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import {
  CheckCircle2, Circle, Zap,
  Flame, Target, TrendingUp,
} from "lucide-react";

// ─── Custom Chart Tooltip — theme-aware ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;

  let displayLabel = label;
  try { displayLabel = format(parseISO(label), "EEE, MMM d"); } catch {}

  return (
    <div
      style={{
        background:     dark ? "rgba(15,13,40,0.97)"  : "rgba(255,255,255,0.97)",
        border:         dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.2)",
        borderRadius:   "12px",
        padding:        "10px 14px",
        backdropFilter: "blur(20px)",
        boxShadow:      "0 8px 32px rgba(0,0,0,0.15)",
      }}
    >
      <p style={{
        fontSize: "11px", fontWeight: 600,
        color: dark ? "#e2e8f0" : "#1e293b",
        marginBottom: "3px",
      }}>
        {displayLabel}
      </p>
      <p style={{ fontSize: "12px", fontWeight: 700, color: "#6366f1" }}>
        {payload[0].value}% completion
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Home = () => {
  const { user, updateUser } = useAuth();
  const { isDark }           = useTheme();

  const [todayData,  setTodayData]  = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [expPopups,  setExpPopups]  = useState([]);
  const popupRef = useRef(0);

  // ── Theme tokens ────────────────────────────────────────────────────────
  const textPrimary       = isDark ? "#f1f5f9"               : "#0f172a";
  const textSecondary     = isDark ? "#94a3b8"               : "#64748b";
  const cardBg            = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)";
  const cardBorder        = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const gridStroke        = isDark ? "rgba(99,102,241,0.1)"   : "rgba(99,102,241,0.12)";
  const tickFill          = isDark ? "#64748b"                : "#94a3b8";
  const habitRowDone      = isDark ? "rgba(16,185,129,0.08)"  : "rgba(16,185,129,0.07)";
  const habitRowIdle      = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const habitBorderDone   = isDark ? "rgba(16,185,129,0.3)"   : "rgba(16,185,129,0.3)";
  const habitBorderHover  = isDark ? "rgba(99,102,241,0.3)"   : "rgba(99,102,241,0.25)";

  // ── Fetch — wrapped in useCallback so effects can depend on it ───────────
  const fetchData = useCallback(async () => {
    try {
      const [todayRes, weeklyRes] = await Promise.all([
        getTodayProgress(),
        getWeeklyProgress(),
      ]);
      setTodayData(todayRes.data);
      setWeeklyData(weeklyRes.data);
    } catch (err) {
      console.error("fetchData error:", err);
      toast.error("Failed to load home data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Midnight auto-refresh ────────────────────────────────────────────────
  // When the clock hits 00:00 the backend scheduler has already reset
  // isCompletedToday → false on every habit, so a fresh fetch is all we need
  // to make habits selectable again without requiring a page reload.
  useEffect(() => {
    let dailyInterval = null;

    const scheduleNextMidnight = () => {
      const now      = new Date();
      const midnight = new Date();
      // next 00:00:05 — 5-second buffer so the cron job finishes first
      midnight.setHours(24, 0, 5, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();

      console.log(
        `⏰ Habit reset auto-refresh in ${Math.round(msUntilMidnight / 1000 / 60)} min`
      );

      const midnightTimer = setTimeout(async () => {
        console.log("🔄 Midnight — refreshing habits...");
        // Force loading spinner so the user sees fresh data
        setLoading(true);
        await fetchData();

        // After the first midnight hit, refresh every 24 h
        dailyInterval = setInterval(async () => {
          setLoading(true);
          await fetchData();
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);

      // Clean up both the timeout and any interval that was already running
      return midnightTimer;
    };

    const timer = scheduleNextMidnight();

    return () => {
      clearTimeout(timer);
      if (dailyInterval) clearInterval(dailyInterval);
    };
  }, [fetchData]); // fetchData is stable (useCallback with no deps)

  // ── Toggle habit ─────────────────────────────────────────────────────────
  const handleToggle = async (habitId) => {
    if (togglingId === habitId) return;

    const habitBefore = todayData?.habits?.find((h) => h._id === habitId);
    if (!habitBefore) return;

    setTogglingId(habitId);
    try {
      const { data } = await API.patch(`/habits/${habitId}/toggle`);

      updateUser({
        level:    data.user.level,
        exp:      data.user.exp,
        totalExp: data.user.totalExp,
        streak:   data.user.streak,
      });

      // ✅ Show +EXP popup only when completing (not un-completing)
      if (!habitBefore.isCompletedToday) {
        const id = ++popupRef.current;
        setExpPopups((prev) => [...prev, { id, text: `+${habitBefore.expReward} EXP` }]);
        setTimeout(() => {
          setExpPopups((prev) => prev.filter((p) => p.id !== id));
        }, 1600);
      }

      await fetchData();
    } catch (err) {
      console.error("toggleHabit error:", err);
      toast.error("Failed to update habit");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const level      = user?.level || 1;
  const exp        = user?.exp   || 0;
  const expForNext = level * 100;

  const greeting =
    new Date().getHours() < 12 ? "Good Morning"
    : new Date().getHours() < 18 ? "Good Afternoon"
    : "Good Evening";

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#6366f1", borderRightColor: "#8b5cf6" }}
        />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24 md:pb-6">

      {/* ── EXP Popups ────────────────────────────────────────────────── */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {expPopups.map((popup) => (
          <div
            key={popup.id}
            className="exp-popup flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{
              background:     isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)",
              border:         "1px solid rgba(99,102,241,0.3)",
              backdropFilter: "blur(12px)",
              color:          isDark ? "#a5b4fc" : "#4f46e5",
              boxShadow:      "0 8px 24px rgba(99,102,241,0.2)",
            }}
          >
            <Zap className="w-4 h-4" />
            {popup.text}
          </div>
        ))}
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="fade-up flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: textSecondary }}>
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1
            className="text-2xl md:text-3xl font-black mt-0.5"
            style={{ color: textPrimary }}
          >
            {greeting},{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {user?.name?.split(" ")[0] ?? "Trainer"}
            </span>{" "}
            👋
          </h1>
        </div>
        <div
          className="level-badge px-3 py-1.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          Lv. {level}
        </div>
      </div>

      {/* ── Level / EXP Hero Card ─────────────────────────────────────── */}
      <div
        className="liquid-glass liquid-glass-shimmer p-5 fade-up stagger-1"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(139,92,246,0.85))",
          border:     "1px solid rgba(255,255,255,0.2)",
          boxShadow:  "0 20px 60px rgba(99,102,241,0.3)",
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-indigo-100 text-sm font-medium">Total Experience</p>
            <p className="text-3xl font-black text-white mt-0.5">
              {(user?.totalExp ?? 0).toLocaleString()}
              <span className="text-lg text-indigo-200 ml-1">EXP</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-indigo-100 text-sm">Streak</p>
            <p className="text-2xl font-black text-white flex items-center gap-1 justify-end">
              <Flame className="w-6 h-6 text-orange-300" />
              {user?.streak ?? 0}
            </p>
          </div>
        </div>
        <ProgressBar value={exp} max={expForNext} color="#fff" height={10} />
        <div className="flex justify-between text-indigo-100 text-xs mt-2">
          <span>Level {level}</span>
          <span>{expForNext - exp} EXP to Level {level + 1}</span>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-up stagger-2">
        <StatCard
          title="Today"
          value={`${todayData?.completedHabits ?? 0}/${todayData?.totalHabits ?? 0}`}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))"
          subtitle="habits done"
          delay={0.1}
        />
        <StatCard
          title="Completion"
          value={`${todayData?.completionRate ?? 0}%`}
          icon={<Target className="w-5 h-5 text-indigo-500" />}
          gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))"
          subtitle="today's rate"
          delay={0.15}
        />
        <StatCard
          title="Total EXP"
          value={(user?.totalExp ?? 0).toLocaleString()}
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          gradient="linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))"
          subtitle="all time"
          delay={0.2}
        />
        <StatCard
          title="Streak"
          value={`${user?.streak ?? 0}d`}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          gradient="linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.1))"
          subtitle="daily streak"
          delay={0.25}
        />
      </div>

      {/* ── Today's Habits ────────────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-3"
        style={{
          background:     cardBg,
          border:         `1px solid ${cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-bold flex items-center gap-2"
            style={{ color: textPrimary }}
          >
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            Today's Habits
          </h2>
          {(todayData?.totalHabits ?? 0) > 0 && (
            <span className="text-xs font-medium" style={{ color: textSecondary }}>
              {todayData.completedHabits}/{todayData.totalHabits} done
            </span>
          )}
        </div>

        {/* Progress bar */}
        {(todayData?.totalHabits ?? 0) > 0 && (
          <div className="mb-4">
            <ProgressBar
              value={todayData.completedHabits}
              max={todayData.totalHabits}
              color="#6366f1"
              height={6}
            />
          </div>
        )}

        {/* Empty state */}
        {!todayData?.habits?.length ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">🌱</p>
            <p className="text-sm font-medium" style={{ color: textSecondary }}>
              No habits yet. Add some in the Habits page!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayData.habits.map((habit, i) => {
              const isToggling = togglingId === habit._id;
              return (
                <div
                  key={habit._id}
                  onClick={() => !isToggling && handleToggle(habit._id)}
                  className={`habit-item flex items-center gap-3 p-3 rounded-xl
                              border transition-all cursor-pointer
                              ${isToggling ? "opacity-60 cursor-wait" : ""}`}
                  style={{
                    background: habit.isCompletedToday ? habitRowDone : habitRowIdle,
                    border:     `1px solid ${habit.isCompletedToday ? habitBorderDone : "transparent"}`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                  onMouseEnter={(e) => {
                    if (!habit.isCompletedToday)
                      e.currentTarget.style.borderColor = habitBorderHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!habit.isCompletedToday)
                      e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  {/* Check icon */}
                  <button
                    className="habit-check-btn flex-shrink-0"
                    disabled={isToggling}
                    aria-label={habit.isCompletedToday ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {habit.isCompletedToday ? (
                      <CheckCircle2
                        className="w-7 h-7 text-green-500"
                        style={{ filter: "drop-shadow(0 2px 8px rgba(16,185,129,0.4))" }}
                      />
                    ) : (
                      <Circle
                        className="w-7 h-7"
                        style={{ color: isDark ? "#374151" : "#d1d5db" }}
                      />
                    )}
                  </button>

                  {/* Habit icon bubble */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      backgroundColor: (habit.color || "#6366f1") + "20",
                      border:          `1.5px solid ${habit.color || "#6366f1"}40`,
                    }}
                  >
                    {habit.icon || "⭐"}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm truncate"
                      style={{
                        color:                 habit.isCompletedToday ? textSecondary : textPrimary,
                        textDecoration:        habit.isCompletedToday ? "line-through" : "none",
                        textDecorationColor:   textSecondary,
                      }}
                    >
                      {habit.name}
                    </p>
                    <p className="text-xs capitalize" style={{ color: textSecondary }}>
                      {habit.type} • +{habit.expReward} EXP
                    </p>
                  </div>

                  {/* Type badge */}
                  <div
                    className="text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0"
                    style={{
                      background: habit.type === "build"
                        ? "rgba(99,102,241,0.1)"
                        : "rgba(239,68,68,0.1)",
                      color: habit.type === "build" ? "#6366f1" : "#ef4444",
                    }}
                  >
                    {habit.type}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Weekly Progress Chart ──────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl fade-up stagger-4"
        style={{
          background:     cardBg,
          border:         `1px solid ${cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          className="font-bold flex items-center gap-2 mb-5"
          style={{ color: textPrimary }}
        >
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Weekly Progress
        </h2>

        {weeklyData.every((d) => d.completionRate === 0) ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <TrendingUp
              className="w-8 h-8"
              style={{ color: isDark ? "#374151" : "#d1d5db" }}
            />
            <p className="text-sm" style={{ color: textSecondary }}>
              Complete habits today to see your chart populate!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={weeklyData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={isDark ? 0.25 : 0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  try { return format(parseISO(d), "EEE"); } catch { return d; }
                }}
                tick={{ fontSize: 11, fill: tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip dark={isDark} />} />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#weekGrad)"
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default Home;