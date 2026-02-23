import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:      { type: String, required: true, trim: true },
    icon:      { type: String, default: "⭐" },
    color:     { type: String, default: "#6366f1" },
    type:      { type: String, enum: ["build", "break"], default: "build" },
    expReward: { type: Number, default: 20 },
    isActive:  { type: Boolean, default: true },

    // ✅ These two fields are what the scheduler resets every midnight
    isCompletedToday:  { type: Boolean, default: false },
    lastCompletedDate: { type: String,  default: null },  // "YYYY-MM-DD"
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);