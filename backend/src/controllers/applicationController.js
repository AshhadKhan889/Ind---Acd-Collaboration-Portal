// controllers/applicationController.js
const mongoose = require("mongoose");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");
const Application = require("../models/ApplicationModel");

exports.applyForOpportunity = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user._id; // from auth middleware

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can apply for opportunities.",
      });
    }

    // Handle file upload - resume file will be in req.file if uploaded
    let resumeFilePath = null;
    if (req.file) {
      resumeFilePath = req.file.filename; // Store just the filename, full path will be /uploads/filename
    }

    // Destructure all possible fields from request body
    const {
      note,
      resumeUrl, // Keep for backward compatibility but prefer file upload

      // Job fields
      positionAppliedFor,
      expectedSalary,
      experienceLevel,

      // Internship fields
      educationLevel,
      university,
      graduationDate,
      internshipDuration,
      learningObjectives,

      // Project fields
      projectTitle,
      projectType,
      areaOfInterest,
      proposedContribution,
      motivation,
    } = req.body;

    let opportunityModel;
    if (type === "job") opportunityModel = Job;
    else if (type === "project") opportunityModel = Project;
    else if (type === "internship") opportunityModel = Internship;
    else return res.status(400).json({ message: "Invalid opportunity type" });

    const opportunity = await opportunityModel.findById(id);
    if (!opportunity) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const existing = await Application.findOne({
      userId,
      opportunityId: id,
      opportunityType: type,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already applied for this opportunity" });
    }

    // Validate that either resume file or resume URL is provided
    if (!resumeFilePath && !resumeUrl) {
      return res.status(400).json({ 
        message: "Resume is required. Please upload a resume file." 
      });
    }

    // Save application in Applications DB
    const application = new Application({
      userId,
      opportunityId: id,
      opportunityType: type,
      note,
      resumeUrl: resumeFilePath ? null : resumeUrl, // Use URL only if no file uploaded
      resumeFilePath: resumeFilePath, // Store file path if uploaded

      // Job fields
      positionAppliedFor,
      expectedSalary,
      experienceLevel,

      // Internship fields
      educationLevel,
      university,
      graduationDate,
      internshipDuration,
      learningObjectives,

      // Project fields
      projectTitle,
      projectType,
      areaOfInterest,
      proposedContribution,
      motivation,
    });

    await application.save();

    // Push applicant into Job/Project/Internship DB
    await opportunityModel.findByIdAndUpdate(
      id,
      { $addToSet: { applicants: userId } }, // prevents duplicate userIds
      { new: true }
    );

    // Notify applicant (email + in-app)
    try {
      const Notification = require("../models/Notification");
      const User = require("../models/User");
      const sendEmail = require("../services/emailService");
      const applicant = await User.findById(userId);

      const linkBase =
        type === "job"
          ? "/job-details/"
          : type === "project"
          ? "/project-details/"
          : "/internship-details/";

      // Build a human-friendly title based on opportunity
      let opportunityTitle = "";
      if (type === "job") opportunityTitle = opportunity.jobTitle || "Job";
      else if (type === "project") opportunityTitle = opportunity.projectTitle || "Project";
      else if (type === "internship") opportunityTitle = opportunity.title || "Internship";

      await Notification.create({
        user: userId,
        title: "Application Submitted",
        message: `You successfully applied for ${type}: ${opportunityTitle}.`,
        link: `${linkBase}${id}`,
        meta: { type, id, title: opportunityTitle },
      });

      if (applicant?.email) {
        await sendEmail(
          applicant.email,
          `Successfully applied for ${type}: ${opportunityTitle}`,
          `<p>Hi ${applicant.fullName},</p><p>Your application for <strong>${opportunityTitle}</strong> (${type}) was submitted successfully.</p>`
        );
      }
    } catch (e) {
      console.warn("Notification/email for application failed:", e.message);
    }

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getApplicantsForOpportunity = async (req, res) => {
  try {
    const { type, id } = req.params;

    const applicants = await Application.find({
      opportunityId: id,
      opportunityType: type,
    })
      .populate("userId", "fullName email") // adjust field names based on your User model
      .exec();

    res.json(applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id; // auth middleware must set req.user

    // fetch user's applications
    const apps = await Application.find({ userId })
      .sort({ appliedAt: -1 })
      .lean();

    // For each application, fetch title & postedBy from the appropriate collection
    const populated = await Promise.all(
      apps.map(async (app) => {
        let opportunityTitle = "Untitled";
        let opportunityPostedBy = "Unknown";

        try {
          if (app.opportunityType === "job") {
            const job = await Job.findById(app.opportunityId)
              .select("jobTitle postedBy")
              .populate("postedBy", "fullName email")
              .lean();
            if (job) {
              opportunityTitle = job.jobTitle || opportunityTitle;
              opportunityPostedBy =
                (job.postedBy &&
                  (job.postedBy.fullName || job.postedBy.email)) ||
                opportunityPostedBy;
            }
          } else if (app.opportunityType === "project") {
            const project = await Project.findById(app.opportunityId)
              .select("projectTitle postedBy")
              .populate("postedBy", "fullName email")
              .lean();
            if (project) {
              opportunityTitle = project.projectTitle || opportunityTitle;
              opportunityPostedBy =
                (project.postedBy &&
                  (project.postedBy.fullName || project.postedBy.email)) ||
                opportunityPostedBy;
            }
          } else if (app.opportunityType === "internship") {
            const internship = await Internship.findById(app.opportunityId)
              .select("title postedBy")
              .populate("postedBy", "fullName email")
              .lean();
            if (internship) {
              opportunityTitle = internship.title || opportunityTitle;
              opportunityPostedBy =
                (internship.postedBy &&
                  (internship.postedBy.fullName ||
                    internship.postedBy.email)) ||
                opportunityPostedBy;
            }
          }
        } catch (err) {
          // if the opportunity was removed, keep Untitled/Unknown but don't crash
          console.warn(
            "Error populating opportunity for app",
            app._id,
            err.message
          );
        }

        return {
          ...app,
          opportunityTitle,
          opportunityPostedBy,
        };
      })
    );

    return res.status(200).json({ success: true, applications: populated });
  } catch (error) {
    console.error("getMyApplications error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // application ID
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Reviewed", "Accepted", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Fetch the correct opportunity
    let OpportunityModel;
    if (application.opportunityType === "job") OpportunityModel = Job;
    else if (application.opportunityType === "project")
      OpportunityModel = Project;
    else if (application.opportunityType === "internship")
      OpportunityModel = Internship;
    else return res.status(400).json({ message: "Invalid opportunity type" });

    const opportunity = await OpportunityModel.findById(
      application.opportunityId
    );
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Only the user who posted the opportunity can update status
    if (opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update status" });
    }

    // Update status
    application.status = status;
    await application.save();

    // Send notification to student about status update
    try {
      const Notification = require("../models/Notification");
      const User = require("../models/User");
      const sendEmail = require("../services/emailService");
      const Profile = require("../models/Profile");

      const student = await User.findById(application.userId);
      if (student) {
        // Build opportunity title
        let opportunityTitle = "";
        if (application.opportunityType === "job") opportunityTitle = opportunity.jobTitle || "Job";
        else if (application.opportunityType === "project") opportunityTitle = opportunity.projectTitle || "Project";
        else if (application.opportunityType === "internship") opportunityTitle = opportunity.title || "Internship";

        const linkBase =
          application.opportunityType === "job"
            ? "/job-details/"
            : application.opportunityType === "project"
            ? "/project-details/"
            : "/internship-details/";

        // Create notification
        await Notification.create({
          user: application.userId,
          title: `Application ${status}`,
          message: `Your application for ${application.opportunityType}: ${opportunityTitle} has been ${status.toLowerCase()}.`,
          link: `${linkBase}${application.opportunityId}`,
          meta: {
            type: application.opportunityType,
            id: application.opportunityId,
            title: opportunityTitle,
            status: status,
          },
        });

        // Send email notification
        if (student.email) {
          const statusMessage =
            status === "Accepted"
              ? "Congratulations! Your application has been accepted."
              : status === "Rejected"
              ? "We regret to inform you that your application has been rejected."
              : `Your application status has been updated to ${status}.`;

          await sendEmail(
            student.email,
            `Application ${status}: ${opportunityTitle}`,
            `<p>Hi ${student.fullName},</p><p>${statusMessage}</p><p>Application for: <strong>${opportunityTitle}</strong> (${application.opportunityType})</p>`
          );
        }

        // If application is accepted for a project, initialize progress tracking
        if (status === "Accepted" && application.opportunityType === "project") {
          let profile = await Profile.findOne({ user: application.userId });
          if (profile) {
            // Check if progress tracking already exists for this application
            const existingProgress = profile.progressTracking.find(
              (entry) => entry.applicationId.toString() === application._id.toString()
            );

            if (!existingProgress) {
              // Initialize progress tracking
              profile.progressTracking.push({
                applicationId: application._id,
                projectId: opportunity._id,
                projectTitle: opportunity.projectTitle,
                progressUpdates: [],
                currentStatus: "Not Started",
                createdAt: new Date(),
              });
              await profile.save();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Notification/email for status update failed:", e.message);
    }

    res.json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const appId = req.params.id;

    const application = await Application.findOne({ _id: appId, userId });

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    await application.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("withdrawApplication error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
