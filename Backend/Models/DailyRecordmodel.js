import mongoose from "mongoose";

// ─── Sub-schema for each habit snapshot entry ─────────────────────────────────
const habitSnapshotSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["build", "quit"],
      default: "build",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    expEarned: {
      type: Number,
      default: 0,
    },
  },
  { _id: false } // no separate _id for each snapshot entry
);

// ─── Main DailyRecord schema ──────────────────────────────────────────────────
const dailyRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // "YYYY-MM-DD" string — one record per user per day
    date: {
      type: String,
      required: true,
    },

    // ✅ Array of objects, NOT array of strings
    habitsSnapshot: {
      type: [habitSnapshotSchema],
      default: [],
    },

    totalHabits: {
      type: Number,
      default: 0,
    },

    completedHabits: {
      type: Number,
      default: 0,
    },

    totalExpEarned: {
      type: Number,
      default: 0,
    },

    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound index: one record per user per day ──────────────────────────────
dailyRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyRecord = mongoose.model("DailyRecord", dailyRecordSchema);

export default DailyRecord;