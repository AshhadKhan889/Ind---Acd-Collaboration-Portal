const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ✅ Create Job (with files)
router.post("/", protect, upload.array("supportingDocuments", 5), createJob);

// ✅ Get My Jobs (must be before "/:id")
router.get("/my-jobs", protect, getMyJobs);

// ✅ Get All Jobs
router.get("/", getJobs);

// ✅ Get Job By ID
router.get("/:id", getJobById);

// ✅ Update Job (with files)
router.put("/:id", protect, upload.array("supportingDocuments", 5), updateJob);

// ✅ Delete Job
router.delete("/:id", protect, deleteJob);



module.exports = router;
