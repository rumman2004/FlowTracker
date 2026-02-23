import cron from "node-cron";
import Habit from "../Models/Habitmodel.js";
import DailyRecord from "../Models/DailyRecordmodel.js";
import User from "../Models/Usermodel.js";

export const scheduleDailyReset = () => {

  // ── Runs every day at midnight 00:00 ─────────────────────────────────────
  cron.schedule("0 0 * * *", async () => {
    const today = new Date().toISOString().split("T")[0];
    console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Running daily habit reset for ${today}`);

    try {
      // ✅ STEP 1: Reset isCompletedToday on ALL habits
      const resetResult = await Habit.updateMany(
        { isCompletedToday: true },
        {
          $set: {
            isCompletedToday:    false,
            lastCompletedDate:   null,
          },
        }
      );
      console.log(`  ✅ Reset ${resetResult.modifiedCount} habits`);

      // ✅ STEP 2: Check each user's streak
      // If they completed at least one habit yesterday, keep streak
      // If they missed yesterday, reset streak to 0
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const allUsers = await User.find({ isActive: true });

      for (const user of allUsers) {
        const yesterdayRecord = await DailyRecord.findOne({
          userId: user._id,
          date:   yesterdayStr,
        });

        const completedYesterday =
          yesterdayRecord && yesterdayRecord.completedHabits > 0;

        if (!completedYesterday && user.streak > 0) {
          await User.findByIdAndUpdate(user._id, { $set: { streak: 0 } });
          console.log(`  ⚠️  Streak reset for user: ${user.email}`);
        }
      }

      // ✅ STEP 3: Create empty DailyRecord for today for all active users
      const activeUsers = await User.find({ isActive: true }).select("_id");
      const bulkOps = activeUsers.map((u) => ({
        updateOne: {
          filter: { userId: u._id, date: today },
          update: {
            $setOnInsert: {
              userId:          u._id,
              date:            today,
              completedHabits: 0,
              totalHabits:     0,
              completionRate:  0,
            },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await DailyRecord.bulkWrite(bulkOps);
        console.log(`  ✅ Daily records initialised for ${bulkOps.length} users`);
      }

      console.log("  🎉 Daily reset complete\n");
    } catch (err) {
      console.error("  ❌ Daily reset failed:", err.message);
    }
  }, {
    timezone: "UTC", // change to your timezone e.g. "Asia/Dhaka"
  });

  console.log("⏰ Daily reset scheduler registered — fires at 00:00 UTC");
};