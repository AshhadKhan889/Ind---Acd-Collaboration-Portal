const express = require("express");
const { suspendByEmail } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Profile = require("../models/Profile");

const router = express.Router();

// ✅ Protected route: get logged-in user's profile
router.get("/profile", protect, (req, res) => {
  res.json({ user: req.user });
});

// ✅ Suspend user by email (admin-only)
router.post("/suspend-by-email", protect, suspendByEmail);

// ✅ NEW ROUTE: Get full profile of any user by ID
router.get("/profile/:id", async (req, res) => {
  try {
    // 1️⃣ Get the basic user info (excluding sensitive fields)
    const user = await User.findById(req.params.id).select(
      "-passwordHash -resetToken -resetTokenExpiry -__v"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Get the detailed profile info (if exists)
    const profile = await Profile.findOne({ user: user._id }).select(
      "-__v -createdAt -updatedAt"
    );

    // 3️⃣ Combine both
    const fullProfile = {
      ...user.toObject(),
      profile: profile ? profile.toObject() : null,
    };

    res.status(200).json(fullProfile);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
