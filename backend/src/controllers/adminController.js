// src/controllers/adminController.js
const User = require("../models/User");
const Restriction = require("../models/Restriction");

// If your Job/Project/Internship models have different filenames / fields adjust paths:
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// Allowed roles (must match your User.roleID enum)
const ALLOWED_ROLES = ["Student", "Academia", "Industry Official", "Admin"];

/**
 * GET /api/admin/users
 * List all users (without password)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    console.error("getAllUsers:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * PUT /api/admin/users/:userId/status
 * Generic status update (admin)
 * body: { status: "active"|"suspended"|"restricted"|"limited" }
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!["active", "suspended", "restricted", "limited"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, actionBy: req.user._id, actionAt: new Date() },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    await Restriction.create({
      email: user.email,
      type: "suspend",
      reason: `Admin set status: ${status}`,
      actionBy: req.user._id
    });

    res.json({ message: "User status updated", user });
  } catch (err) {
    console.error("updateUserStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only Admin can perform this action
    if (req.user.roleID !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user status to 'suspended'
    user.status = "suspended";
    user.actionBy = req.user._id;
    user.actionAt = Date.now();
    await user.save();

    // Log the restriction
    await Restriction.create({
      user: user._id,               // reference to affected user
      actionBy: req.user._id,       // admin who blocked
      type: "suspend",
      reason: `Blocked by admin ${req.user.email}`,
      email: user.email              // optional snapshot
    });

    res.json({ message: "User blocked successfully", user });
  } catch (err) {
    console.error("blockUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only Admin can perform this action
    if (req.user.roleID !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user status to 'active'
    user.status = "active";
    user.actionBy = req.user._id;
    user.actionAt = Date.now();
    await user.save();

    // Log the unblock action as a restriction record (optional type: "suspend")
    await Restriction.create({
      user: user._id,
      actionBy: req.user._id,
      type: "suspend",
      reason: `Unblocked by admin ${req.user.email}`,
      email: user.email
    });

    res.json({ message: "User unblocked successfully", user });
  } catch (err) {
    console.error("unblockUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * POST /api/admin/suspend
 * body: { email, reason }
 * Sets status = "suspended" on existing user and logs Restriction
 */
// const suspendUser = async (req, res) => {
//   try {
//     const { email, reason } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.isSuspended = true;
//     user.suspensionReason = reason;
//     await user.save();

//     res.json({ message: `User ${email} suspended successfully` });
//   } catch (err) {
//     console.error("Suspend error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * POST /api/admin/restrict
//  * body: { email, roleID, reason }
//  * Updates roleID & status = "restricted" for existing user and logs Restriction
//  */
// const restrictByRole = async (req, res) => {
//   try {
//     const { email, roleID, reason } = req.body;
//     if (!email || !roleID || !reason) {
//       return res.status(400).json({ message: "Email, roleID and reason are required" });
//     }
//     if (!ALLOWED_ROLES.includes(roleID)) {
//       return res.status(400).json({ message: "Invalid roleID" });
//     }

//     const user = await User.findOneAndUpdate(
//       { email },
//       { roleID, status: "restricted", actionBy: req.user._id, actionAt: new Date() },
//       { new: true, runValidators: true }
//     ).select("-passwordHash");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     await Restriction.create({
//       email,
//       type: "role",
//       role: roleID,
//       reason,
//       actionBy: req.user._id
//     });

//     res.json({ message: `User ${email} role changed to ${roleID}`, user });
//   } catch (err) {
//     console.error("restrictByRole:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * POST /api/admin/limit
//  * body: { email, limit, reason }
//  * Adds/updates `limit` on User and sets status = "limited"
//  */
// const limitUser = async (req, res) => {
//   try {
//     const { email, limit, reason } = req.body;
//     if (!email || limit == null || !reason) {
//       return res.status(400).json({ message: "Email, limit and reason are required" });
//     }

//     // update user (adds/overwrites `limit` field)
//     const user = await User.findOneAndUpdate(
//       { email },
//       { status: "limited", limit, actionBy: req.user._id, actionAt: new Date() },
//       { new: true }
//     ).select("-passwordHash");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     await Restriction.create({
//       email,
//       type: "limit",
//       limit,
//       reason,
//       actionBy: req.user._id
//     });

//     res.json({ message: `User ${email} limited to ${limit}`, user });
//   } catch (err) {
//     console.error("limitUser:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

/**
 * Content management endpoints for Admin
 */
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "fullName email roleID") // ✅ populate poster info
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("getAllJobs:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted", job });
  } catch (err) {
    console.error("deleteJob:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("postedBy", "fullName email roleID") // ✅ populate poster info
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("getAllProjects:", err);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted", project });
  } catch (err) {
    console.error("deleteProject:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate("postedBy", "fullName email roleID") // ✅ populate poster info
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    console.error("getAllInternships:", err);
    res.status(500).json({ message: "Error fetching internships" });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json({ message: "Internship deleted", internship });
  } catch (err) {
    console.error("deleteInternship:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ email: user.email });
  } catch (err) {
    console.error("GetUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  getAllUsers,
  updateUserStatus,
  blockUser,
  unblockUser,
  // suspendUser,
  // restrictByRole,
  // limitUser,
  getAllJobs,
  deleteJob,
  getAllProjects,
  deleteProject,
  getAllInternships,
  deleteInternship,
  getUserById,
};
