const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/", protect, upload.array("supportingDocuments", 5), createProject);
router.get("/", getProjects);

// ✅ Place BEFORE "/:id"
router.get("/my-projects", protect, getMyProjects);

router.get("/:id", getProjectById);
router.put("/:id", protect, upload.array("supportingDocuments", 5), updateProject);
router.delete("/:id", protect, deleteProject);



module.exports = router;
