const Profile = require("../models/Profile");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

/**
 * Suggest opportunities based on student's skills
 */
async function getSuggestions(studentId) {
  // Fetch student profile
  const profile = await Profile.findOne({ user: studentId });
  if (!profile) throw new Error("Student profile not found");

  const studentSkills = profile.skills || [];
  const studentSkillsLower = studentSkills.map((s) => s.trim().toLowerCase());

  // Function to calculate matching score
  const scoreOpportunities = (opportunities) =>
    opportunities.map((op) => {
      const oppSkills = (op.requiredSkills || []).map((s) => s.trim().toLowerCase());
      const matchingSkills = oppSkills.filter((skill) =>
        studentSkillsLower.includes(skill)
      );
      return { ...op.toObject(), score: matchingSkills.length };
    });

  // Fetch all opportunities
  const jobs = await Job.find();
  const projects = await Project.find();
  const internships = await Internship.find();

  // Score and sort by matching skills
  const scoredJobs = scoreOpportunities(jobs)
    .filter((op) => op.score > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const scoredProjects = scoreOpportunities(projects)
    .filter((op) => op.score > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const scoredInternships = scoreOpportunities(internships)
    .filter((op) => op.score > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Return top 5 of each
  return {
    jobs: scoredJobs.slice(0, 5),
    projects: scoredProjects.slice(0, 5),
    internships: scoredInternships.slice(0, 5),
  };
}

module.exports = { getSuggestions };
