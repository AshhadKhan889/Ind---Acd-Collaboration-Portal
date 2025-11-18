// controllers/academiaController.js
const Application = require("../models/ApplicationModel");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

exports.getAcademiaDashboard = async (req, res) => {
  try {
    const academiaId = req.user.id;

    // ✅ Posted opportunities by academia user
    const postedJobs = await Job.find({ postedBy: academiaId })
      .select("jobTitle applicationDeadline status")
      .sort({ createdAt: -1 });

    const postedProjects = await Project.find({ postedBy: academiaId })
      .select("projectTitle timeline.applicationDeadline status")
      .sort({ createdAt: -1 });

    const postedInternships = await Internship.find({ postedBy: academiaId })
      .select("title applicationDeadline status")
      .sort({ createdAt: -1 });

    // ✅ Upcoming deadlines
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
      upcomingDeadlines: {
        jobs,
        projects,
        internships,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
