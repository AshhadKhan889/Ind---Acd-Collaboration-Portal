// controllers/studentController.js
const Application = require("../models/ApplicationModel");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// Student Dashboard → My Applications + Upcoming Deadlines
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ use _id instead of id

    // ✅ My Applications (Jobs, Projects, Internships)
    const myApplicationsRaw = await Application.find({ userId })
      .sort({ appliedAt: -1 })
      .lean();

    const myApplications = await Promise.all(
      myApplicationsRaw.map(async (app) => {
        let opportunityTitle = "Untitled";

        switch (app.opportunityType) {
          case "job": {
            const job = await Job.findById(app.opportunityId).select("jobTitle");
            if (job) opportunityTitle = job.jobTitle;
            break;
          }
          case "project": {
            const project = await Project.findById(app.opportunityId).select("projectTitle");
            if (project) opportunityTitle = project.projectTitle;
            break;
          }
          case "internship": {
            const internship = await Internship.findById(app.opportunityId).select("title");
            if (internship) opportunityTitle = internship.title;
            break;
          }
        }

        return {
          ...app,
          opportunityTitle,
        };
      })
    );

    // ✅ Upcoming Deadlines (next 5 jobs/projects/internships sorted by deadline)
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
      myApplications,
      upcomingDeadlines: {
        jobs,
        projects,
        internships,
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};

