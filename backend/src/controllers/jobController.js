const Job = require("../models/Job");

exports.createJob = async (req, res) => {
  try {
    let jobData = {};

    // ✅ Case 1: If jobData comes from form-data (multipart)
    if (req.body && Object.keys(req.body).length > 0) {
      jobData = { ...req.body };

      // Parse arrays if they come as strings
      if (typeof jobData.keywords === "string") {
        jobData.keywords = jobData.keywords.split(",").map((k) => k.trim());
      }
      if (typeof jobData.requiredSkills === "string") {
        jobData.requiredSkills = jobData.requiredSkills
          .split(",")
          .map((s) => s.trim());
      }
      if (typeof jobData.educationRequirements === "string") {
        jobData.educationRequirements = jobData.educationRequirements
          .split(",")
          .map((e) => e.trim());
      }
      if (typeof jobData.employeeBenefits === "string") {
        jobData.employeeBenefits = jobData.employeeBenefits
          .split(",")
          .map((b) => b.trim());
      }
    }

    // ✅ Case 2: If jobData comes from raw JSON
    if (req.is("application/json")) {
      jobData = req.body;
    }

    // ✅ Add uploaded files if any
    if (req.files && req.files.length > 0) {
      jobData.supportingDocuments = req.files.map((file) => file.path);
    }

    // ✅ Attach the user who posted
    const mongoose = require("mongoose");
    jobData.postedBy = new mongoose.Types.ObjectId(req.user._id);

    const job = new Job(jobData);
    await job.save();

    // Send notification + email to poster
    try {
      const Notification = require("../models/Notification");
      const User = require("../models/User");
      const sendEmail = require("../services/emailService");
      const poster = await User.findById(req.user._id);
      await Notification.create({
        user: req.user._id,
        title: "Job Posted",
        message: `Your job '${job.jobTitle}' was posted successfully`,
        link: `/job-details/${job._id}`,
        meta: { type: "job", id: job._id },
      });
      if (poster?.email) {
        await sendEmail(
          poster.email,
          "Your job was posted successfully",
          `<p>Hi ${poster.fullName},</p><p>Your job '<strong>${job.jobTitle}</strong>' was posted successfully.</p><p><a href="${process.env.FRONTEND_URL}/job-details/${job._id}">View job</a></p>`
        );
      }
    } catch (e) {
      console.warn("Notification/email for job post failed:", e.message);
    }

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "fullName email");
    res.status(200).json({ success: true, jobs }); // ✅ consistent
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "fullName email"
    );
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Convert string fields to arrays if necessary
    [
      "keywords",
      "requiredSkills",
      "educationRequirements",
      "employeeBenefits",
    ].forEach((field) => {
      if (typeof updateData[field] === "string") {
        updateData[field] = updateData[field].split(",").map((s) => s.trim());
      }
    });

    // ✅ Add new uploaded files
    if (req.files && req.files.length > 0) {
      updateData.supportingDocuments = req.files.map((file) => file.path);
    }

    const job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate("postedBy", "fullName email")
      .populate("applicants", "_id");

    const jobsWithCount = jobs.map(job => ({
      ...job.toObject(),
      applicantCount: job.applicants ? job.applicants.length : 0,
    }));

    res.status(200).json({ success: true, jobs: jobsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

