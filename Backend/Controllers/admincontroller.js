import User from "../Models/Usermodel.js";
import Habit from "../Models/Habitmodel.js";
import DailyRecord from "../Models/DailyRecordmodel.js";

// @desc  Get admin dashboard stats
// @route GET /api/admin/dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers  = await User.countDocuments({ isActive: true });
    const totalHabits = await Habit.countDocuments({ isActive: true });

    // Active users today (last active within 24 h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeToday = await User.countDocuments({
      lastActiveDate: { $gte: yesterday },
    });

    // New users per month — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top 10 leaderboard
    const leaderboard = await User.find({ isActive: true })
      .select("name email profilePic level totalExp streak")
      .sort({ totalExp: -1 })
      .limit(10);

    // Daily active users — last 7 days
    const dailyActive = [];
    for (let i = 6; i >= 0; i--) {
      const date    = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count   = await DailyRecord.countDocuments({
        date:            dateStr,
        completedHabits: { $gt: 0 },
      });
      dailyActive.push({ date: dateStr, count });
    }

    res.json({
      totalUsers,
      totalHabits,
      activeToday,
      monthlyGrowth,
      leaderboard,
      dailyActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all users
// @route GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Toggle user active status
// @route PATCH /api/admin/users/:id/toggle
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message:  `User ${user.isActive ? "activated" : "deactivated"}`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};