const express = require("express");
const {
  createOrUpdateProfile,
  getProfile,
  getProfileById,
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateProgress,
  getMyProgress,
  getStudentsProgress,
  getProjectsWithProgress,
  uploadSubmission,
  downloadSubmission,
  addRemark,
  replyToRemark,
  getIndustryProjectSubmissions,
  getIndustryProjectsWithSubmissions,
  downloadIndustrySubmission,
  addIndustryRemark,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const { isStudent } = require("../middleware/studentMiddleware");
const { isAcademia } = require("../middleware/academiaMiddleware");
const { isIndustryOfficial } = require("../middleware/industryMiddleware");
const upload = require("../middleware/upload");
const submissionUpload = require("../middleware/submissionUpload");

const router = express.Router();

// Protected Routes
router.post("/", protect, createOrUpdateProfile);
router.get("/", protect, getProfile);
router.get("/:id", protect, getProfileById);

// Document routes
router.post("/documents", protect, upload.single("file"), uploadDocument);
router.get("/documents/:userId", protect, getDocuments);
router.delete("/documents/:documentId", protect, deleteDocument);

// Progress Tracking Routes
// Student routes
router.post("/progress/update", protect, isStudent, updateProgress);
router.get("/progress/my-progress", protect, isStudent, getMyProgress);

// Academia routes
router.get("/progress/project/:projectId", protect, isAcademia, getStudentsProgress);
router.get("/progress/projects", protect, isAcademia, getProjectsWithProgress);

// Submission routes
router.post("/progress/submission", protect, isStudent, submissionUpload.single("file"), uploadSubmission);
router.get("/progress/submission/:applicationId", protect, isAcademia, downloadSubmission);

// Remarks routes
router.post("/progress/remark", protect, isAcademia, addRemark);
router.post("/progress/remark/reply", protect, isStudent, replyToRemark);

// Industry Official routes for submissions
router.get("/industry/submissions/project/:projectId", protect, isIndustryOfficial, getIndustryProjectSubmissions);
router.get("/industry/submissions/projects", protect, isIndustryOfficial, getIndustryProjectsWithSubmissions);
router.get("/industry/submission/:applicationId", protect, isIndustryOfficial, downloadIndustrySubmission);
router.post("/industry/submission/remark", protect, isIndustryOfficial, addIndustryRemark);

module.exports = router;
