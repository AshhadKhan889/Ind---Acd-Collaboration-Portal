// routes/studentRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isStudent } = require("../middleware/studentMiddleware");
const { getDashboard } = require("../controllers/studentController");

// Student Dashboard → My Applications + Upcoming Deadlines
router.get("/dashboard", protect, isStudent, getDashboard);

module.exports = router;
