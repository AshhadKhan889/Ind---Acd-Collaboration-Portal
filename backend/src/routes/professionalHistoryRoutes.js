const express = require("express");
const router = express.Router();
const {
  createHistory,
  getHistories,
  getHistoryById,
  updateHistory,
  deleteHistory,
  getUserHistory,
} = require("../controllers/professionalHistoryController");

const { protect } = require("../middleware/authMiddleware");
const { isStudent } = require("../middleware/studentMiddleware");

// Routes (student-only)
router.post("/", protect, isStudent, createHistory);
router.get("/", protect, isStudent, getHistories);
router.get("/:id", protect, isStudent, getHistoryById);
router.put("/:id", protect, isStudent, updateHistory);
router.get("/user/:userId", protect, getUserHistory);
router.delete("/:id", protect, isStudent, deleteHistory);

module.exports = router;
