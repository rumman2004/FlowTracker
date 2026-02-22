import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const expHistorySchema = new mongoose.Schema({
  exp: { type: Number, required: true },
  level: { type: Number, required: true },
  reason: { type: String, default: "Daily habits completed" },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: {
      type: String,
      default: "",
    },
    profilePicPublicId: { type: String, default: "" },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    totalExp: { type: Number, default: 0 },
    expHistory: [expHistorySchema],
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    theme: { type: String, default: "light" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Level calculation: each level requires level * 100 EXP
userSchema.methods.calculateLevel = function () {
  let level = 1;
  let expNeeded = 100;
  let remainingExp = this.totalExp;

  while (remainingExp >= expNeeded) {
    remainingExp -= expNeeded;
    level++;
    expNeeded = level * 100;
  }

  this.level = level;
  this.exp = remainingExp;
  return { level, exp: remainingExp, expForNext: expNeeded };
};

export default mongoose.model("User", userSchema);