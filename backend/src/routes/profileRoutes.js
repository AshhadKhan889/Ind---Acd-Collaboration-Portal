const express = require("express");
const { createOrUpdateProfile, getProfile, getProfileById } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes
router.post("/", protect, createOrUpdateProfile);
router.get("/", protect, getProfile);
router.get("/:id", protect, getProfileById);

module.exports = router;
