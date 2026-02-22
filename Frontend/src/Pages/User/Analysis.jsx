import { useState, useEffect } from "react";
import {
  getWeeklyProgress,
  getMonthlyProgress,
  getExpHistory,
} from "../../Services/userservice.js";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { BarChart2, Calendar, Zap, TrendingUp, Trophy } from "lucide-react";
import { useTheme } from "../../Context/ThemeContext.jsx"; // ✅ import your theme hook

// ─── Glass Tooltip — theme-aware ─────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label, valueFormatter, dark }) => {
  if (!active || !payload?.length) return null;

  let displayLabel = label;
  try {
    displayLabel = format(parseISO(label), "EEE, MMM d");
  } catch {
    displayLabel = label;
  }

  return (
    <div
      style={{
        background: dark
          ? "rgba(15, 13, 40, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        border: dark
          ? "1px solid rgba(99,102,241,0.3)"
          : "1px solid rgba(99,102,241,0.2)",
        borderRadius: "12px",
        padding: "10px 14px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: dark ? "#e2e8f0" : "#1e293b",
          marginBottom: "4px",
        }}
      >
        {displayLabel}
      </p>
      {payload.map((entry, i) => (
        <p
          key={i}
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: entry.color,
          }}
        >
          {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyChart = ({ icon: Icon, message, color = "#6366f1", dark }) => (
  <div className="flex flex-col items-center justify-center h-48 gap-3">
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ background: `${color}18` }}
    >
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <p
      className="text-sm text-center max-w-xs"
      style={{ color: dark ? "#6b7280" : "#9ca3af" }}
    >
      {message}
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Analysis = () => {
  const { isDark } = useTheme(); // ✅ get current theme

  const [weeklyData,  setWeeklyData]  = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expHistory,  setExpHistory]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("weekly");

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [weekly, monthly, exp] = await Promise.all([
          getWeeklyProgress(),
          getMonthlyProgress(),
          getExpHistory(),
        ]);
        setWeeklyData(weekly.data   ?? []);
        setMonthlyData(monthly.data ?? []);
        setExpHistory(exp.data?.slice(0, 50) ?? []);
      } catch (err) {
        console.error("Analysis fetchAll error:", err);
        toast.error("Failed to load analysis data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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

  // ── Theme-driven colour tokens ───────────────────────────────────────────
  const textPrimary   = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const cardBg        = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder    = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const gridStroke    = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickFill      = isDark ? "#64748b" : "#94a3b8";
  const rowBg         = isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)";
  const barTrackBg    = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  // Shared recharts tick style — reacts to theme
  const tickStyle = { fill: tickFill, fontSize: 11 };

  // ── Derived values ───────────────────────────────────────────────────────
  const activeDays = weeklyData.filter((d) => (d.totalHabits ?? 0) > 0);
  const avgWeekly  =
    activeDays.length > 0
      ? Math.round(
          activeDays.reduce((s, d) => s + (d.completionRate ?? 0), 0) /
            activeDays.length
        )
      : 0;

  const totalExpThisMonth = monthlyData.reduce(
    (s, d) => s + (d.expEarned ?? 0), 0
  );

  const bestDay = weeklyData.reduce(
    (best, d) =>
      (d.completionRate ?? 0) > (best.completionRate ?? 0) ? d : best,
    weeklyData[0] ?? {}
  );

  let cumulative = 0;
  const expCumulative = [...expHistory].reverse().map((e) => {
    cumulative += e.exp ?? 0;
    let shortDate = "—";
    try { shortDate = format(new Date(e.date), "MMM d"); } catch {}
    return { ...e, cumulative, shortDate };
  });

  const weeklyEmpty    = weeklyData.every((d) => (d.completionRate ?? 0) === 0);
  const weeklyExpEmpty = weeklyData.every((d) => (d.expEarned ?? 0) === 0);
  const monthlyEmpty   = monthlyData.every((d) => (d.completionRate ?? 0) === 0);
  const expHistoryEmpty = expHistory.length === 0;

  const tabs = [
    { key: "weekly",  label: "Weekly",  icon: BarChart2 },
    { key: "monthly", label: "Monthly", icon: Calendar  },
    { key: "history", label: "EXP Log", icon: Zap       },
  ];

  // ── Reusable section card ────────────────────────────────────────────────
  const Card = ({ children, className = "" }) => (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {children}
    </div>
  );

  // ── Chart title row ──────────────────────────────────────────────────────
  const ChartHeader = ({ title, right }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-sm" style={{ color: textPrimary }}>
        {title}
      </h3>
      {right && (
        <span className="text-xs" style={{ color: textSecondary }}>
          {right}
        </span>
      )}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6 space-y-5">

      {/* Page Header */}
      <div className="fade-up">
        <h1
          className="text-2xl font-black"
          style={{ color: textPrimary }}
        >
          Analysis
        </h1>
        <p className="text-sm mt-0.5" style={{ color: textSecondary }}>
          Your habit performance overview
        </p>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-up stagger-1">
        {[
          { label: "Avg Weekly Rate", value: `${avgWeekly}%`,                              icon: TrendingUp, color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
          { label: "EXP This Month",  value: `⚡ ${totalExpThisMonth.toLocaleString()}`,   icon: Zap,        color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
          { label: "EXP Events",      value: expHistory.length,                            icon: BarChart2,  color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          { label: "Best Day (Week)", value: (bestDay?.completionRate ?? 0) > 0 ? `${bestDay.completionRate}%` : "—",
                                                                                            icon: Trophy,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl p-4 card-hover"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: card.bg }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </div>
                <p className="text-xs truncate" style={{ color: textSecondary }}>
                  {card.label}
                </p>
              </div>
              <p className="text-xl font-black" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div
        className="flex p-1 rounded-2xl fade-up stagger-2"
        style={{
          gap: "4px",
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${cardBorder}`,
        }}
      >
        {tabs.map((tab) => {
          const Icon    = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5
                         rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#ffffff",
                      boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
                    }
                  : { color: textSecondary }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          WEEKLY TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "weekly" && (
        <div className="space-y-4 fade-up">

          {/* Completion Rate Bar Chart */}
          <Card>
            <ChartHeader
              title="Completion Rate"
              right={`Avg: ${avgWeekly}%`}
            />
            {weeklyEmpty ? (
              <EmptyChart
                icon={BarChart2}
                color="#6366f1"
                dark={isDark}
                message="Complete habits today to see your weekly completion rate here."
              />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={weeklyData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => { try { return format(parseISO(d), "EEE"); } catch { return d; } }}
                    tick={tickStyle} axisLine={false} tickLine={false}
                  />
                  <YAxis domain={[0, 100]} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip valueFormatter={(v) => `${v}% completion`} dark={isDark} />} />
                  <Bar dataKey="completionRate" fill="url(#barGrad)" radius={[8,8,0,0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* EXP Area Chart */}
          <Card>
            <ChartHeader
              title="EXP Earned"
              right={`Total: ${weeklyData.reduce((s, d) => s + (d.expEarned ?? 0), 0).toLocaleString()} EXP`}
            />
            {weeklyExpEmpty ? (
              <EmptyChart
                icon={Zap}
                color="#8b5cf6"
                dark={isDark}
                message="EXP earned each day will appear here as you complete habits."
              />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => { try { return format(parseISO(d), "EEE"); } catch { return d; } }}
                    tick={tickStyle} axisLine={false} tickLine={false}
                  />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip valueFormatter={(v) => `${v} EXP`} dark={isDark} />} />
                  <Area
                    type="monotone" dataKey="expEarned"
                    stroke="#8b5cf6" strokeWidth={2.5}
                    fill="url(#expAreaGrad)"
                    dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#8b5cf6", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Day Breakdown */}
          <Card>
            <ChartHeader title="Day Breakdown" />
            <div className="space-y-2">
              {weeklyData.map((day) => {
                let dayLabel = day.date;
                try { dayLabel = format(parseISO(day.date), "EEEE, MMM d"); } catch {}
                const rate = day.completionRate ?? 0;
                return (
                  <div
                    key={day.date}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: rowBg }}
                  >
                    <div className="w-28 flex-shrink-0">
                      <p className="text-xs font-semibold" style={{ color: textPrimary }}>
                        {dayLabel}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div
                        className="w-full rounded-full overflow-hidden"
                        style={{ height: "8px", background: barTrackBg }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${rate}%`,
                            background:
                              rate >= 80 ? "linear-gradient(90deg,#10b981,#34d399)"
                            : rate >= 50 ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                            : rate >  0  ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                            :              barTrackBg,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: textSecondary }}>
                        {day.completedHabits ?? 0}/{day.totalHabits ?? 0}
                      </p>
                      <p
                        className="text-xs font-black"
                        style={{
                          color:
                            rate >= 80 ? "#10b981"
                          : rate >= 50 ? "#6366f1"
                          : rate >  0  ? "#f59e0b"
                          :              textSecondary,
                        }}
                      >
                        {rate}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MONTHLY TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "monthly" && (
        <div className="space-y-4 fade-up">

          {/* Mini stat pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Days Tracked", value: monthlyData.filter((d) => (d.totalHabits ?? 0) > 0).length, color: "#6366f1" },
              { label: "Days 100%",    value: monthlyData.filter((d) => (d.completionRate ?? 0) === 100).length, color: "#10b981" },
              { label: "Total EXP",   value: totalExpThisMonth.toLocaleString(), color: "#8b5cf6" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3 text-center"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <p className="text-xl font-black" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Monthly Completion Rate */}
          <Card>
            <ChartHeader
              title="Monthly Completion Rate"
              right={format(new Date(), "MMMM yyyy")}
            />
            {monthlyEmpty ? (
              <EmptyChart
                icon={Calendar}
                color="#10b981"
                dark={isDark}
                message="Your monthly completion trend will appear here as you complete habits."
              />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => { try { return format(parseISO(d), "d"); } catch { return d; } }}
                    tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd"
                  />
                  <YAxis domain={[0, 100]} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip valueFormatter={(v) => `${v}% completion`} dark={isDark} />} />
                  <Area
                    type="monotone" dataKey="completionRate"
                    stroke="#10b981" strokeWidth={2.5}
                    fill="url(#monthAreaGrad)"
                    dot={false} activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Monthly EXP */}
          <Card>
            <ChartHeader title="Monthly EXP Earned" />
            {monthlyData.every((d) => (d.expEarned ?? 0) === 0) ? (
              <EmptyChart
                icon={Zap}
                color="#8b5cf6"
                dark={isDark}
                message="EXP earned each day of the month will appear here."
              />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monthExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => { try { return format(parseISO(d), "d"); } catch { return d; } }}
                    tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd"
                  />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip valueFormatter={(v) => `${v} EXP`} dark={isDark} />} />
                  <Area
                    type="monotone" dataKey="expEarned"
                    stroke="#8b5cf6" strokeWidth={2.5}
                    fill="url(#monthExpGrad)"
                    dot={false} activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EXP HISTORY TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-4 fade-up">

          {/* Cumulative Line Chart */}
          <Card>
            <ChartHeader
              title="Cumulative EXP Growth"
              right={
                expCumulative.length > 0
                  ? `${expCumulative[expCumulative.length - 1]?.cumulative?.toLocaleString()} total`
                  : "0 total"
              }
            />
            {expHistoryEmpty ? (
              <EmptyChart
                icon={TrendingUp}
                color="#6366f1"
                dark={isDark}
                message="Your cumulative EXP growth curve will appear here after completing habits."
              />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={expCumulative} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="shortDate" tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip valueFormatter={(v) => `${v?.toLocaleString()} EXP total`} dark={isDark} />} />
                  <Line
                    type="monotone" dataKey="cumulative"
                    stroke="#6366f1" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* EXP Event Log */}
          <Card>
            <ChartHeader
              title="EXP Event Log"
              right={`${expHistory.length} events`}
            />
            {expHistoryEmpty ? (
              <EmptyChart
                icon={Zap}
                color="#6366f1"
                dark={isDark}
                message="Every time you complete a habit and earn EXP it will be logged here."
              />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                {expHistory.map((entry, i) => {
                  let dateLabel = "—";
                  try {
                    dateLabel = format(new Date(entry.date), "MMM d, yyyy · h:mm a");
                  } catch {}
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl
                                 transition-all hover:scale-[1.01]"
                      style={{ background: rowBg }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(99,102,241,0.12)" }}
                        >
                          <Zap className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: textPrimary }}
                          >
                            {entry.reason ?? "EXP Earned"}
                          </p>
                          <p className="text-xs" style={{ color: textSecondary }}>
                            {dateLabel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-black text-indigo-500">
                          +{entry.exp} EXP
                        </p>
                        <p className="text-xs" style={{ color: textSecondary }}>
                          Lv.{entry.level ?? "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analysis;