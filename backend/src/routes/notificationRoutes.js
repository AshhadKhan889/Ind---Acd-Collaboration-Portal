const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
	getMyNotifications,
	getUnreadCount,
	markAllRead,
	markOneRead,
} = require("../controllers/notificationController");

router.get("/", protect, getMyNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.post("/mark-all-read", protect, markAllRead);
router.post("/:id/mark-read", protect, markOneRead);

module.exports = router;


