// src/routes/recommendationRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const Recommendation = require("../models/Recommendation");
const User = require("../models/User");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");
const Profile = require("../models/Profile");

const skillMapping = require("../utils/skillMapping");

// Expand skills using the mapping
function expandSkills(skillsArray) {
  let expanded = [];

  skillsArray.forEach((skill) => {
    const key = skill.toLowerCase().trim();

    // Add mapped skills if exists
    if (skillMapping[key]) {
      expanded.push(...skillMapping[key]);
    }

    // Always keep the skill itself
    expanded.push(key);
  });

  return [...new Set(expanded)];
}

// =======================
// POST: Recommend Opportunity
// =======================
router.post("/recommend/:opportunityId", protect, async (req, res) => {
  try {
    const academiaUser = req.user;
    const { opportunityId } = req.params;
    const { type, note } = req.body;

    if (academiaUser.roleID !== "Academia") {
      return res
        .status(403)
        .json({ message: "Only Academia can recommend opportunities." });
    }

    // Normalize type
    const modelType = type.charAt(0).toUpperCase() + type.slice(1);

    // Fetch opportunity
    let opportunity;
    if (modelType === "Job") opportunity = await Job.findById(opportunityId);
    else if (modelType === "Project")
      opportunity = await Project.findById(opportunityId);
    else if (modelType === "Internship")
      opportunity = await Internship.findById(opportunityId);
    else return res.status(400).json({ message: "Invalid opportunity type." });

    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found." });

    // Required skills
    const requiredSkills = (opportunity.requiredSkills || []).map((s) =>
      s.toLowerCase().trim()
    );
    const expandedRequiredSkills = expandSkills(requiredSkills);

    // STEP 1 — Get students of the same university
    const students = await User.find({
      institute: academiaUser.institute,
      roleID: "Student",
    });

    if (students.length === 0)
      return res.json({ message: "No students found in the same university." });

    // STEP 2 — Get profiles
    const studentIds = students.map((s) => s._id);
    const profiles = await Profile.find({ user: { $in: studentIds } });

    // STEP 3 — Skill Matching
    const matchedProfiles = profiles.filter((profile) => {
      if (!profile.skills || profile.skills.length === 0) return false;

      const studentSkills = profile.skills.map((s) => s.toLowerCase().trim());
      const expandedStudentSkills = expandSkills(studentSkills);

      return expandedStudentSkills.some((stuSkill) =>
        expandedRequiredSkills.some(
          (reqSkill) =>
            stuSkill.includes(reqSkill) || reqSkill.includes(stuSkill)
        )
      );
    });

    if (matchedProfiles.length === 0)
      return res.json({
        message: "No students found with matching skills for this opportunity.",
      });

    // STEP 4 — Bulk Insert Recommendations
    const recommendations = matchedProfiles.map((profile) => ({
      recommendedBy: academiaUser._id,
      recommendedTo: profile.user,
      opportunityId,
      type: modelType,
      note: note || "",
    }));

    await Recommendation.insertMany(recommendations);

    return res.json({
      message: `Recommended to ${matchedProfiles.length} students.`,
      matchedStudents: matchedProfiles.length,
    });
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// GET: Student Recommendations
// =======================
router.get("/my-recommendations", protect, async (req, res) => {
  try {
    const student = req.user;

    if (student.roleID !== "Student")
      return res.status(403).json({
        message: "Only students can access recommendations.",
      });

    const recommendations = await Recommendation.find({
      recommendedTo: student._id,
      notInterested: false,
    })
      .sort({ createdAt: -1 })
      .populate("recommendedBy", "fullName institute")
      .populate({
        path: "opportunityId",
        select: "-applicants -comments",
      });

    res.json(recommendations);
  } catch (err) {
    console.error("Fetch Recommendations Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Mark as Not Interested
router.post("/not-interested", protect, async (req, res) => {
  try {
    const { recommendationId } = req.body;

    const recommendation = await Recommendation.findByIdAndUpdate(
      recommendationId,
      { notInterested: true },
      { new: true }
    );

    if (!recommendation)
      return res.status(404).json({ message: "Recommendation not found" });

    res.json({ message: "Marked as not interested" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
