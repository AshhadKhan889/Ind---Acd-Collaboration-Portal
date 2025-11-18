const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Comment = require("../models/Comment");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");
const {
  addComment,
  getCommentsByOpportunity,
  deleteComment,
  addReply,
} = require("../controllers/commentController");

// ============ JOB COMMENTS ============
router.post("/job/:opportunityId", protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { comment, commentType, visibility } = req.body;

    const job = await Job.findById(opportunityId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    

    const newComment = new Comment({
      comment, // ✅ matches schema
      commentType,
      visibility,
      commentedBy: req.user._id, // ✅ secure from logged-in user
      opportunity: opportunityId,
      opportunityModel: "Job", // ✅ matches schema
    });

    await newComment.save();

    // Push into Job.comments array
    job.comments.push(newComment._id);
    await job.save();

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ PROJECT COMMENTS ============
router.post("/project/:opportunityId", protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { comment, commentType, visibility } = req.body;

    const project = await Project.findById(opportunityId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const newComment = new Comment({
      comment,
      commentType,
      visibility,
      commentedBy: req.user._id,
      opportunity: opportunityId,
      opportunityModel: "Project", // ✅ FIXED
    });

    await newComment.save();

    project.comments.push(newComment._id);
    await project.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ INTERNSHIP COMMENTS ============
router.post("/internship/:opportunityId", protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { comment, commentType, visibility } = req.body;

    const internship = await Internship.findById(opportunityId);
    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    const newComment = new Comment({
      comment,
      commentType,
      visibility,
      commentedBy: req.user._id,
      opportunity: opportunityId,
      opportunityModel: "Internship", // ✅ FIXED
    });

    await newComment.save();
    internship.comments.push(newComment._id);
    await internship.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all comments for Job/Project/Internship
router.get("/:type/:id", protect, getCommentsByOpportunity);

router.post("/reply/:commentId", protect, addReply);

// ✅ Delete comment
router.delete("/:id", protect, deleteComment);

module.exports = router;
