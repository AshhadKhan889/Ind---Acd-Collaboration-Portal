// routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { applyForOpportunity, getApplicantsForOpportunity, getMyApplications, withdrawApplication, updateApplicationStatus } = require("../controllers/applicationController");
const resumeUpload = require("../middleware/resumeUpload");

router.post("/:type/:id", protect, resumeUpload.single("resume"), applyForOpportunity);
router.get("/:type/:id/applicants", protect, getApplicantsForOpportunity);
router.get("/my-applications", protect, getMyApplications);
router.put("/status/:id", protect, updateApplicationStatus);
router.delete("/:id", protect, withdrawApplication);

module.exports = router;
