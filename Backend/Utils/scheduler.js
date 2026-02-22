import cron from "node-cron";
import Habit from "../Models/Habitmodel.js";
import User from "../Models/Usermodel.js";
import DailyRecord from "../Models/DailyRecordmodel.js";

export const scheduleDailyReset = () => {
  // Runs every day at 12:00 AM
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily habit reset at midnight...");

    try {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Get all active users
      const users = await User.find({ isActive: true });

      for (const user of users) {
        const habits = await Habit.find({ userId: user._id, isActive: true });

        if (habits.length === 0) continue;

        // Save yesterday's record before resetting
        const completed = habits.filter((h) => h.isCompletedToday);
        const totalExpEarned = completed.reduce((sum, h) => sum + h.expReward, 0);

        await DailyRecord.findOneAndUpdate(
          { userId: user._id, date: yesterdayStr },
          {
            userId: user._id,
            date: yesterdayStr,
            habitsSnapshot: habits.map((h) => ({
              habitId: h._id,
              name: h.name,
              type: h.type,
              isCompleted: h.isCompletedToday,
              expEarned: h.isCompletedToday ? h.expReward : 0,
            })),
            totalHabits: habits.length,
            completedHabits: completed.length,
            totalExpEarned,
            completionRate:
              habits.length > 0
                ? Math.round((completed.length / habits.length) * 100)
                : 0,
          },
          { upsert: true, new: true }
        );

        // Update streak
        const lastDate = user.lastActiveDate
          ? new Date(user.lastActiveDate).toISOString().split("T")[0]
          : null;

        if (completed.length > 0) {
          if (lastDate === yesterdayStr) {
            user.streak += 1;
          } else {
            user.streak = 1;
          }
          user.lastActiveDate = yesterday;
        } else {
          user.streak = 0;
        }
        await user.save();

        // Reset all habits
        await Habit.updateMany(
          { userId: user._id, isActive: true },
          { isCompletedToday: false, completedAt: null }
        );
      }

      console.log("Daily reset completed successfully.");
    } catch (error) {
      console.error("Daily reset error:", error);
    }
  });
};