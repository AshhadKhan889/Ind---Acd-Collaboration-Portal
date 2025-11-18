// routes/opportunityRoutes.js
const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// ✅ Get all opportunities (Jobs + Projects + Internships)
router.get("/", async (req, res) => {
  try {
    const [jobs, projects, internships] = await Promise.all([
      Job.find().populate("postedBy", "name email"),
      Project.find().populate("postedBy", "name email"),
      Internship.find().populate("postedBy", "name email"),
    ]);

    res.json({
      success: true,
      jobs,
      projects,
      internships,
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
