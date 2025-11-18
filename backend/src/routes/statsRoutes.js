const express = require("express");
const router = express.Router();

const Application = require("../models/ApplicationModel");
const User = require("../models/User");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// Public stats endpoint for homepage
router.get("/", async (req, res) => {
  try {
    const [collaborations, partners, jobs, projects, internships] = await Promise.all([
      Application.countDocuments({}),
      // Count everyone except Admin to avoid role label mismatches
      User.countDocuments({ roleID: { $ne: "Admin" } }),
      Job.countDocuments({}),
      Project.countDocuments({}),
      Internship.countDocuments({}),
    ]);

    const opportunities = jobs + projects + internships;

    res.json({ collaborations, partners, opportunities });
  } catch (err) {
    console.error("stats error", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;


