// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const adminCtrl = require("../controllers/adminController");

// ✅ User management
router.get("/users", protect, isAdmin, adminCtrl.getAllUsers);   // Get all users
router.get("/users/:userId", protect, isAdmin, adminCtrl.getUserById); // Get single user by ID
router.put("/users/:userId/status", protect, isAdmin, adminCtrl.updateUserStatus);

// // ✅ Restriction actions (admin only)
// router.post("/suspend", protect, isAdmin, adminCtrl.suspendUser);
// router.post("/restrict", protect, isAdmin, adminCtrl.restrictByRole);
// router.post("/limit", protect, isAdmin, adminCtrl.limitUser);

router.put("/block/:userId", protect, isAdmin, adminCtrl.blockUser);
router.put("/unblock/:userId", protect, isAdmin, adminCtrl.unblockUser);

// ✅ Content management
router.get("/jobs", protect, isAdmin, adminCtrl.getAllJobs);
router.delete("/jobs/:id", protect, isAdmin, adminCtrl.deleteJob);

router.get("/projects", protect, isAdmin, adminCtrl.getAllProjects);
router.delete("/projects/:id", protect, isAdmin, adminCtrl.deleteProject);

router.get("/internships", protect, isAdmin, adminCtrl.getAllInternships);
router.delete("/internships/:id", protect, isAdmin, adminCtrl.deleteInternship);

router.get("/forum-posts", protect, isAdmin, adminCtrl.getAllForumPosts);
router.delete("/forum-posts/:id", protect, isAdmin, adminCtrl.deleteForumPost);

module.exports = router;
