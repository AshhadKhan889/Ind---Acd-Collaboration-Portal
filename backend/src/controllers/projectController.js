const Project = require("../models/Project");

exports.createProject = async (req, res) => {
  try {
    let projectData = { ...req.body };

    // ✅ Handle fields that may come as JSON strings (when using form-data)
    const parseIfString = (field) => {
      if (typeof projectData[field] === "string") {
        try {
          projectData[field] = JSON.parse(projectData[field]);
        } catch (err) {
          console.warn(`⚠️ Could not parse ${field}, keeping as string`);
        }
      }
    };

    parseIfString("keywords");
    parseIfString("requiredSkills");
    parseIfString("timeline");
    parseIfString("budget");
    parseIfString("collaborationPreferences");

    // ✅ Handle file uploads (if any)
    if (req.files && req.files.length > 0) {
      projectData.supportingDocuments = req.files.map((file) => file.path);
    }

    // ✅ Attach logged-in user (from auth middleware)
    projectData.postedBy = req.user._id;

    const project = new Project(projectData);
    await project.save();

    // Send notification + email to poster
    try {
      const Notification = require("../models/Notification");
      const User = require("../models/User");
      const sendEmail = require("../services/emailService");
      const poster = await User.findById(req.user._id);
      await Notification.create({
        user: req.user._id,
        title: "Project Posted",
        message: `Your project '${project.projectTitle}' was posted successfully`,
        link: `/project-details/${project._id}`,
        meta: { type: "project", id: project._id },
      });
      if (poster?.email) {
        await sendEmail(
          poster.email,
          "Your project was posted successfully",
          `<p>Hi ${poster.fullName},</p><p>Your project '<strong>${project.projectTitle}</strong>' was posted successfully.</p><p><a href="${process.env.FRONTEND_URL}/project-details/${project._id}">View project</a></p>`
        );
      }
    } catch (e) {
      console.warn("Notification/email for project post failed:", e.message);
    }

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("postedBy", "fullName email");
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("postedBy", "fullName email");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // ✅ Parse JSON fields if they come as strings
    const parseIfString = (field) => {
      if (typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (err) {
          console.warn(`⚠️ Could not parse ${field}, keeping as string`);
        }
      }
    };

    parseIfString("keywords");
    parseIfString("requiredSkills");
    parseIfString("timeline");
    parseIfString("budget");
    parseIfString("collaborationPreferences");

    // ✅ Handle uploaded files
    if (req.files && req.files.length > 0) {
      updateData.supportingDocuments = req.files.map((file) => file.path);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ postedBy: req.user._id })
      .populate("postedBy", "fullName email")
      .populate("applicants", "_id");

    const projectsWithCount = projects.map(project => ({
      ...project.toObject(),
      applicantCount: project.applicants ? project.applicants.length : 0,
    }));

    res.status(200).json({ success: true, projects: projectsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
