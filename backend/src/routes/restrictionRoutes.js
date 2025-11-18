const express = require("express");
const router = express.Router();
const Restriction = require("../models/Restriction");

// Suspend User
router.post("/suspend", async (req, res) => {
  try {
    const { email, reason } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { isSuspended: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: `${user.userType} (${email}) suspended.`,
      user,
      reason
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restrict by Role
router.post("/role", async (req, res) => {
  try {
    const { email, role, reason } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: `${user.userType} (${email}) role updated to ${role}`,
      user,
      reason
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Limit by Activity
router.post("/limit", async (req, res) => {
  try {
    const { email, limit, reason } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { activityLimit: limit },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: `${user.userType} (${email}) activity limited to ${limit}`,
      user,
      reason
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all restrictions (for admin panel logs)
router.get("/", async (req, res) => {
  try {
    const restrictions = await Restriction.find().sort({ createdAt: -1 });
    res.json(restrictions);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
