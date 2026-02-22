import { useState, useRef, useEffect } from "react";
import { useHabits } from "../../hooks/useHabits.js";
import { useTheme } from "../../Context/ThemeContext.jsx";
import Modal from "../../components/UI/Modal.jsx";
import {
  Plus, Edit2, Trash2, Flame,
  Sprout, BanIcon, CheckCircle2,
  ChevronDown, Check,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "health",       label: "🏥 Health" },
  { value: "fitness",      label: "💪 Fitness" },
  { value: "mindfulness",  label: "🧘 Mindfulness" },
  { value: "productivity", label: "⚡ Productivity" },
  { value: "social",       label: "👥 Social" },
  { value: "learning",     label: "📚 Learning" },
  { value: "other",        label: "✨ Other" },
];

const HABIT_TYPES = [
  { value: "build", label: "🌱 Build" },
  { value: "quit",  label: "🚫 Quit" },
];

const ICONS = [
  "⭐","💪","🧘","📚","🎯","🏃",
  "💧","🍎","😴","🚫","💡","🎨",
  "🎮","🏋️","🧠","✍️","🎵","🌿",
];

const COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f97316",
  "#10b981","#f59e0b","#3b82f6","#ef4444",
  "#06b6d4","#84cc16",
];

const defaultForm = {
  name: "",
  description: "",
  type: "build",
  category: "other",
  color: "#6366f1",
  icon: "⭐",
  expReward: 20,
};

// ─── Token factory ────────────────────────────────────────────────────────────
// NOTE: The Modal panel always has a DARK glass background regardless of theme,
// so modal-specific tokens are always "dark" values. Only page-level tokens
// (card, tab, text) respond to isDark.
const getTokens = (isDark) => ({
  // ── Page tokens ─────────────────────────────────────────────────────────
  textPrimary:    isDark ? "#f1f5f9"               : "#0f172a",
  textSecondary:  isDark ? "#94a3b8"               : "#64748b",
  cardBg:         isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
  cardBorder:     isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  tabBg:          isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
  tabBorder:      isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  tabIdleColor:   isDark ? "#9ca3af"               : "#64748b",
  separatorColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
  iconBtnBg:      isDark ? "rgba(99,102,241,0.08)"  : "rgba(99,102,241,0.06)",
  iconBtnDelBg:   isDark ? "rgba(239,68,68,0.08)"   : "rgba(239,68,68,0.06)",
  iconBtnColor:   isDark ? "#94a3b8"               : "#64748b",
  emptyTitle:     isDark ? "#9ca3af"               : "#6b7280",

  // ── Modal / form tokens — always DARK (modal bg is always dark glass) ──
  labelColor:     "rgba(255,255,255,0.45)",
  fieldBg:        "rgba(255,255,255,0.07)",
  fieldBorder:    "rgba(255,255,255,0.14)",
  fieldText:      "#ffffff",
  fieldPlaceholder: "rgba(255,255,255,0.3)",
  focusBorder:    "rgba(99,102,241,0.7)",
  focusRing:      "rgba(99,102,241,0.18)",

  // ── Dropdown — always DARK ───────────────────────────────────────────
  dropdownBg:     "rgba(15,12,35,0.99)",
  dropdownBorder: "rgba(99,102,241,0.3)",
  dropdownShadow: "0 20px 50px rgba(0,0,0,0.65)",
  dropdownText:   "rgba(255,255,255,0.8)",
  dropdownActive: "rgba(99,102,241,0.2)",
  dropdownHover:  "rgba(99,102,241,0.1)",
  dropdownTextActive: "#a5b4fc",
  chevronColor:   "rgba(255,255,255,0.4)",

  // ── Icon / color pickers — always DARK ──────────────────────────────
  pickerIdleBg:   "rgba(255,255,255,0.07)",
  colorRingBg:    "#0f0d2e",

  // ── Cancel button — always DARK ─────────────────────────────────────
  cancelBg:       "rgba(255,255,255,0.07)",
  cancelBgHover:  "rgba(255,255,255,0.12)",
  cancelText:     "rgba(255,255,255,0.6)",
  cancelBorder:   "rgba(255,255,255,0.12)",

  // ── EXP slider hints ─────────────────────────────────────────────────
  sliderHint:     "rgba(255,255,255,0.35)",
});

// ─── Inject placeholder CSS once ─────────────────────────────────────────────
// Inline style can't set ::placeholder colour, so we inject a tiny <style> tag.
const PLACEHOLDER_STYLE_ID = "habit-form-placeholder-style";
const ensurePlaceholderStyle = () => {
  if (document.getElementById(PLACEHOLDER_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = PLACEHOLDER_STYLE_ID;
  el.textContent = `
    .habit-form-field::placeholder {
      color: rgba(255,255,255,0.3) !important;
      opacity: 1;
    }
  `;
  document.head.appendChild(el);
};

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
const CustomSelect = ({ value, onChange, options, tokens }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onOutside);
    return ()  => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 500,
          color: tokens.fieldText,
          background: tokens.fieldBg,
          border: open
            ? `1px solid ${tokens.focusBorder}`
            : `1px solid ${tokens.fieldBorder}`,
          boxShadow: open ? `0 0 0 3px ${tokens.focusRing}` : "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <span style={{ color: tokens.fieldText }}>
          {selected?.label ?? value}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: tokens.chevronColor,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0, right: 0,
            zIndex: 999999,
            borderRadius: "14px",
            overflow: "hidden",
            background: tokens.dropdownBg,
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: `1px solid ${tokens.dropdownBorder}`,
            boxShadow: tokens.dropdownShadow,
            animation: "dropIn 0.15s ease both",
          }}
        >
          <style>{`
            @keyframes dropIn {
              from { opacity:0; transform:translateY(-6px); }
              to   { opacity:1; transform:translateY(0);    }
            }
          `}</style>

          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? tokens.dropdownTextActive
                    : tokens.dropdownText,
                  background: isActive ? tokens.dropdownActive : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = tokens.dropdownHover;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{option.label}</span>
                {isActive && (
                  <Check size={13} style={{ color: "#818cf8" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Habits Page ──────────────────────────────────────────────────────────────
const Habits = () => {
  const { habits, loading, addHabit, editHabit, removeHabit } = useHabits();
  const { isDark } = useTheme();
  const tokens = getTokens(isDark);

  // Inject placeholder colour CSS
  useEffect(() => { ensurePlaceholderStyle(); }, []);

  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form,         setForm]         = useState(defaultForm);
  const [activeTab,    setActiveTab]    = useState("build");
  const [deletingId,   setDeletingId]   = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingHabit(null);
    setForm({ ...defaultForm, type: activeTab });
    setIsModalOpen(true);
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setForm({
      name:        habit.name,
      description: habit.description ?? "",
      type:        habit.type,
      category:    habit.category,
      color:       habit.color,
      icon:        habit.icon,
      expReward:   habit.expReward,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingHabit) await editHabit(editingHabit._id, form);
    else await addHabit(form);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await removeHabit(id);
    setDeletingId(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
    setForm(defaultForm);
  };

  const filteredHabits = habits.filter((h) => h.type === activeTab);

  // ── Shared form styles (always dark — modal is dark glass) ────────────────
  const fieldStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 400,
    color: tokens.fieldText,            // ✅ always white in modal
    background: tokens.fieldBg,
    border: `1px solid ${tokens.fieldBorder}`,
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
    WebkitTextFillColor: tokens.fieldText, // ✅ fixes autofill override in Chrome
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: tokens.labelColor,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-24 md:pb-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="fade-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black"
              style={{ color: tokens.textPrimary }}>
            My Habits
          </h1>
          <p className="text-sm mt-0.5"
             style={{ color: tokens.textSecondary }}>
            {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-2xl
                     text-sm font-semibold transition hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Habit
        </button>
      </div>

      {/* ── Type Tabs ───────────────────────────────────────────────────── */}
      <div
        className="flex p-1 rounded-2xl fade-up stagger-1"
        style={{
          gap: "4px",
          background: tokens.tabBg,
          border: `1px solid ${tokens.tabBorder}`,
        }}
      >
        {[
          { key: "build", label: "Build Habits", icon: <Sprout size={16} /> },
          { key: "quit",  label: "Quit Habits",  icon: <BanIcon size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5
                       rounded-xl text-sm font-semibold transition-all duration-200"
            style={
              activeTab === tab.key
                ? {
                    color: "#ffffff",
                    background:
                      tab.key === "build"
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "linear-gradient(135deg, #ef4444, #dc2626)",
                    boxShadow:
                      tab.key === "build"
                        ? "0 4px 15px rgba(99,102,241,0.3)"
                        : "0 4px 15px rgba(239,68,68,0.3)",
                  }
                : { color: tokens.tabIdleColor }
            }
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">
              {tab.key === "build" ? "Build" : "Quit"}
            </span>
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs fade-up stagger-2"
         style={{ color: tokens.textSecondary }}>
        {filteredHabits.length} {activeTab} habit
        {filteredHabits.length !== 1 ? "s" : ""}
      </p>

      {/* ── Habit List / Empty ───────────────────────────────────────────── */}
      {filteredHabits.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl fade-up stagger-2"
          style={{
            background: tokens.cardBg,
            border: `1px solid ${tokens.cardBorder}`,
          }}
        >
          <p className="text-5xl mb-3">
            {activeTab === "build" ? "🌱" : "🚫"}
          </p>
          <p className="font-medium" style={{ color: tokens.emptyTitle }}>
            No {activeTab} habits yet
          </p>
          <p className="text-sm mt-1 mb-5"
             style={{ color: tokens.textSecondary }}>
            {activeTab === "build"
              ? "Start building positive habits today!"
              : "Track habits you want to quit"}
          </p>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Add Your First
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit, i) => (
            <div
              key={habit._id}
              className="habit-item p-4 flex items-center gap-3 rounded-2xl fade-up"
              style={{
                animationDelay: `${i * 0.05}s`,
                background: tokens.cardBg,
                border: `1px solid ${tokens.cardBorder}`,
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Icon bubble */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center
                           text-2xl flex-shrink-0"
                style={{
                  background:  (habit.color ?? "#6366f1") + "18",
                  border:      `1.5px solid ${habit.color ?? "#6366f1"}35`,
                  boxShadow:   `0 4px 12px ${habit.color ?? "#6366f1"}20`,
                }}
              >
                {habit.icon ?? "⭐"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate"
                   style={{ color: tokens.textPrimary }}>
                  {habit.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs capitalize"
                        style={{ color: tokens.textSecondary }}>
                    {habit.category}
                  </span>
                  <span className="text-xs"
                        style={{ color: tokens.separatorColor }}>
                    •
                  </span>
                  <span className="text-xs font-semibold"
                        style={{ color: habit.color ?? "#6366f1" }}>
                    +{habit.expReward} EXP
                  </span>
                  {(habit.streak ?? 0) > 0 && (
                    <>
                      <span className="text-xs"
                            style={{ color: tokens.separatorColor }}>
                        •
                      </span>
                      <span className="text-xs text-orange-400 font-semibold
                                       flex items-center gap-0.5">
                        <Flame size={12} />
                        {habit.streak}
                      </span>
                    </>
                  )}
                </div>
                {habit.description && (
                  <p className="text-xs mt-1 truncate"
                     style={{ color: tokens.textSecondary }}>
                    {habit.description}
                  </p>
                )}
              </div>

              {habit.isCompletedToday && (
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(habit)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                  style={{ background: tokens.iconBtnBg, color: tokens.iconBtnColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = tokens.iconBtnColor)}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(habit._id)}
                  disabled={deletingId === habit._id}
                  className="w-8 h-8 rounded-xl flex items-center justify-center
                             transition disabled:opacity-50"
                  style={{ background: tokens.iconBtnDelBg, color: tokens.iconBtnColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = tokens.iconBtnColor)}
                >
                  {deletingId === habit._id ? (
                    <div className="w-3 h-3 border-2 border-red-400/40
                                    border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingHabit ? "✏️ Edit Habit" : "✨ Add New Habit"}
      >
        <form onSubmit={handleSubmit}>

          {/* ── Habit Name ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Habit Name *</label>
            <input
              type="text"
              // ✅ className adds ::placeholder styling via injected CSS
              className="habit-form-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={fieldStyle}
              placeholder="e.g., Morning Exercise"
              required
              onFocus={(e) => {
                e.target.style.borderColor = tokens.focusBorder;
                e.target.style.boxShadow   = `0 0 0 3px ${tokens.focusRing}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = tokens.fieldBorder;
                e.target.style.boxShadow   = "none";
              }}
            />
          </div>

          {/* ── Description ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Description</label>
            <textarea
              className="habit-form-field"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...fieldStyle, resize: "none" }}
              rows={2}
              placeholder="Optional description..."
              onFocus={(e) => {
                e.target.style.borderColor = tokens.focusBorder;
                e.target.style.boxShadow   = `0 0 0 3px ${tokens.focusRing}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = tokens.fieldBorder;
                e.target.style.boxShadow   = "none";
              }}
            />
          </div>

          {/* ── Type + Category ─────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Type</label>
              <CustomSelect
                value={form.type}
                onChange={(val) => setForm({ ...form, type: val })}
                options={HABIT_TYPES}
                tokens={tokens}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <CustomSelect
                value={form.category}
                onChange={(val) => setForm({ ...form, category: val })}
                options={CATEGORIES}
                tokens={tokens}
              />
            </div>
          </div>

          {/* ── Icon Picker ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ICONS.map((icon) => {
                const isActive = form.icon === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      background: isActive
                        ? "linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.25))"
                        : tokens.pickerIdleBg,
                      border: isActive
                        ? "1.5px solid rgba(99,102,241,0.65)"
                        : "1.5px solid rgba(255,255,255,0.08)",
                      transform: isActive ? "scale(1.12)" : "scale(1)",
                      boxShadow: isActive
                        ? "0 4px 12px rgba(99,102,241,0.35)"
                        : "none",
                    }}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Color Picker ────────────────────────────────────────────── */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Color</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {COLORS.map((color) => {
                const isActive = form.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                      transform:  isActive ? "scale(1.18)" : "scale(1)",
                      boxShadow:  isActive
                        ? `0 0 0 2.5px ${tokens.colorRingBg}, 0 0 0 4.5px ${color}`
                        : `0 2px 8px ${color}50`,
                      border: "none",
                    }}
                  >
                    {isActive && (
                      <Check size={13} color="#fff" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── EXP Slider ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              EXP Reward:{" "}
              {/* ✅ fixed — was using broken Tailwind class */}
              <span style={{ color: "#818cf8", fontWeight: 900 }}>
                {form.expReward}
              </span>
            </label>
            <input
              type="range"
              value={form.expReward}
              onChange={(e) =>
                setForm({ ...form, expReward: Number(e.target.value) })
              }
              min={5} max={100} step={5}
              style={{
                width: "100%",
                accentColor: "#6366f1",
                cursor: "pointer",
              }}
            />
            {/* ✅ fixed — was using broken Tailwind class */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: tokens.sliderHint,
                marginTop: "2px",
              }}
            >
              <span>5 EXP</span>
              <span>100 EXP</span>
            </div>
          </div>

          {/* ── Action Buttons ──────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: 600,
                color: tokens.cancelText,
                background: tokens.cancelBg,
                border: `1px solid ${tokens.cancelBorder}`,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.cancelBgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = tokens.cancelBg;
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#ffffff",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(99,102,241,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity   = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity   = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {editingHabit ? "Save Changes" : "Add Habit"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Habits;