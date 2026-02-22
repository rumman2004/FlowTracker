import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["build", "quit"],
      required: true,
    },
    category: {
      type: String,
      enum: ["health", "fitness", "mindfulness", "productivity", "social", "learning", "other"],
      default: "other",
    },
    frequency: {
      type: String,
      enum: ["daily"],
      default: "daily",
    },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "⭐" },
    isCompletedToday: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    expReward: { type: Number, default: 20 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);