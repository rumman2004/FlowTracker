import User from "../Models/Usermodel.js";
import DailyRecord from "../Models/DailyRecordmodel.js";
import cloudinary from "../Config/cloudinary.js";
import streamifier from "streamifier";

// @desc Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const levelInfo = user.calculateLevel();

    res.json({
      ...user.toObject(),
      expForNext: levelInfo.expForNext,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;

    if (req.file) {
      // Upload to cloudinary
      if (user.profilePicPublicId) {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "flow-tracker/profiles", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      user.profilePic = uploadResult.secure_url;
      user.profilePicPublicId = uploadResult.public_id;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      level: user.level,
      exp: user.exp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update settings
export const updateSettings = async (req, res) => {
  try {
    const { notifications, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (notifications) user.notifications = notifications;
    if (theme) user.theme = theme;

    await user.save();

    res.json({ message: "Settings updated", notifications: user.notifications, theme: user.theme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    await user.save();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get weekly progress
export const getWeeklyProgress = async (req, res) => {
  try {
    const today = new Date();
    const records = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      records.push(dateStr);
    }

    const dbRecords = await DailyRecord.find({
      userId: req.user._id,
      date: { $in: records },
    });

    const result = records.map((date) => {
      const record = dbRecords.find((r) => r.date === date);
      return {
        date,
        completionRate: record ? record.completionRate : 0,
        completedHabits: record ? record.completedHabits : 0,
        totalHabits: record ? record.totalHabits : 0,
        expEarned: record ? record.totalExpEarned : 0,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get monthly progress
export const getMonthlyProgress = async (req, res) => {
  try {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const records = [];

    for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
      records.push(new Date(d).toISOString().split("T")[0]);
    }

    const dbRecords = await DailyRecord.find({
      userId: req.user._id,
      date: { $in: records },
    });

    const result = records.map((date) => {
      const record = dbRecords.find((r) => r.date === date);
      return {
        date,
        completionRate: record ? record.completionRate : 0,
        completedHabits: record ? record.completedHabits : 0,
        totalHabits: record ? record.totalHabits : 0,
        expEarned: record ? record.totalExpEarned : 0,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get EXP history
export const getExpHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("expHistory");
    const history = user.expHistory.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select("name profilePic level totalExp streak")
      .sort({ totalExp: -1 })
      .limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};