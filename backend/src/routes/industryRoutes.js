const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isIndustryOfficial } = require("../middleware/industryMiddleware");

const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// Industry Dashboard → Posted Opportunities + Upcoming Deadlines
router.get("/dashboard", protect, isIndustryOfficial, async (req, res) => {
  try {
    const industryId = req.user.id;

    // Posted by this industry official
    const postedJobs = await Job.find({ postedBy: industryId })
      .select("jobTitle applicationDeadline status")
      .sort({ createdAt: -1 });

    const postedProjects = await Project.find({ postedBy: industryId })
      .select("projectTitle timeline.applicationDeadline status")
      .sort({ createdAt: -1 });

    const postedInternships = await Internship.find({ postedBy: industryId })
      .select("title applicationDeadline status")
      .sort({ createdAt: -1 });

    // Upcoming deadlines (global next 5)
    const jobs = await Job.find({ applicationDeadline: { $gte: new Date() } })
      .select("jobTitle applicationDeadline")
      .sort({ applicationDeadline: 1 })
      .limit(5);

    const projects = await Project.find({ "timeline.applicationDeadline": { $gte: new Date() } })
      .select("projectTitle timeline.applicationDeadline")
      .sort({ "timeline.applicationDeadline": 1 })
      .limit(5);

    const internships = await Internship.find({ applicationDeadline: { $gte: new Date() } })
      .select("title applicationDeadline")
      .sort({ applicationDeadline: 1 })
      .limit(5);

    res.json({
      postedOpportunities: {
        jobs: postedJobs,
        projects: postedProjects,
        internships: postedInternships,
      },
      upcomingDeadlines: { jobs, projects, internships },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


