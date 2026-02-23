import Habit from "../Models/Habitmodel.js";
import User from "../Models/Usermodel.js";
import DailyRecord from "../Models/DailyRecordmodel.js"; // ✅ Added missing import

// @desc    Get all active habits for the logged-in user
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(habits);
  } catch (error) {
    console.error("Error in getHabits:", error);
    res.status(500).json({ message: "Server error while fetching habits" });
  }
};

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res) => {
  try {
    const { name, description, type, category, color, icon, expReward } =
      req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description: description || "",
      type,
      category: category || "other",
      color: color || "#6366f1",
      icon: icon || "⭐",
      expReward: expReward || 20,
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error("Error in createHabit:", error);
    res.status(500).json({ message: "Server error while creating habit" });
  }
};

// @desc    Update an existing habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedHabit);
  } catch (error) {
    console.error("Error in updateHabit:", error);
    res.status(500).json({ message: "Server error while updating habit" });
  }
};

// @desc    Soft delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    habit.isActive = false;
    await habit.save();

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error in deleteHabit:", error);
    res.status(500).json({ message: "Server error while deleting habit" });
  }
};

// @desc  Toggle habit complete / incomplete for today
// @route PATCH /api/habits/:id/toggle
export const toggleHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const today     = new Date().toISOString().split("T")[0];
    const wasCompleted = habit.isCompletedToday;

    // ✅ Toggle the flag
    habit.isCompletedToday  = !wasCompleted;
    habit.lastCompletedDate = habit.isCompletedToday ? today : null;
    await habit.save();

    const user = await User.findById(req.user._id);

    if (habit.isCompletedToday) {
      // ── Completing ──────────────────────────────────────────────────────
      user.exp      += habit.expReward;
      user.totalExp += habit.expReward;

      // Level up check
      while (user.exp >= user.level * 100) {
        user.exp   -= user.level * 100;
        user.level += 1;
      }

      // Streak: only increment once per day
      const lastActive  = user.lastActiveDate
        ? new Date(user.lastActiveDate).toISOString().split("T")[0]
        : null;

      if (lastActive !== today) {
        user.streak       += 1;
        user.lastActiveDate = new Date();
      }

      // Update DailyRecord
      await DailyRecord.findOneAndUpdate(
        { userId: user._id, date: today },
        {
          $inc: { completedHabits: 1 },
          $set: { totalHabits: await Habit.countDocuments({ userId: user._id, isActive: true }) },
        },
        { upsert: true, new: true }
      );

    } else {
      // ── Un-completing ───────────────────────────────────────────────────
      user.exp      = Math.max(0, user.exp      - habit.expReward);
      user.totalExp = Math.max(0, user.totalExp - habit.expReward);

      await DailyRecord.findOneAndUpdate(
        { userId: user._id, date: today },
        { $inc: { completedHabits: -1 } },
        { new: true }
      );
    }

    // Recalculate completion rate in DailyRecord
    const record = await DailyRecord.findOne({ userId: user._id, date: today });
    if (record) {
      const total = await Habit.countDocuments({ userId: user._id, isActive: true });
      record.totalHabits    = total;
      record.completionRate = total > 0
        ? Math.round((record.completedHabits / total) * 100)
        : 0;
      await record.save();
    }

    await user.save();

    res.json({
      habit: {
        _id:              habit._id,
        isCompletedToday: habit.isCompletedToday,
      },
      user: {
        exp:      user.exp,
        totalExp: user.totalExp,
        level:    user.level,
        streak:   user.streak,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get today's habits + progress summary
// @route   GET /api/habits/today-progress
// @access  Private
export const getTodayProgress = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    const completed = habits.filter((h) => h.isCompletedToday).length;
    const total = habits.length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      totalHabits: total,
      completedHabits: completed,
      completionRate,
      habits,
    });
  } catch (error) {
    console.error("Error in getTodayProgress:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching today's progress" });
  }
};