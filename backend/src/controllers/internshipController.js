// controllers/internshipController.js
const Internship = require("../models/Internship");
const mongoose = require("mongoose");

// ✅ Create Internship
exports.createInternship = async (req, res) => {
  try {
    let internshipData = {};

    // Case 1: form-data (multipart with uploads)
    if (req.body && Object.keys(req.body).length > 0) {
      internshipData = { ...req.body };

      // Convert string fields to arrays if necessary
      [
        "keywords",
        "requiredSkills",
        "educationRequirements",
        "benefits",
        "targetMajors",
      ].forEach((field) => {
        if (typeof internshipData[field] === "string") {
          internshipData[field] = internshipData[field]
            .split(",")
            .map((v) => v.trim());
        }
      });
    }

    // Case 2: raw JSON
    if (req.is("application/json")) {
      internshipData = req.body;
    }

    // ✅ Handle uploaded files
    if (req.files && req.files.length > 0) {
      internshipData.supportingDocuments = req.files.map((file) => file.path);
    }

    // ✅ Attach the logged-in user
    internshipData.postedBy = new mongoose.Types.ObjectId(req.user._id);

    const internship = new Internship(internshipData);
    await internship.save();

    // Send notification + email to poster
    try {
      const Notification = require("../models/Notification");
      const User = require("../models/User");
      const sendEmail = require("../services/emailService");
      const poster = await User.findById(req.user._id);
      await Notification.create({
        user: req.user._id,
        title: "Internship Posted",
        message: `Your internship '${internship.title || internship.internshipTitle || "Internship"}' was posted successfully`,
        link: `/internship-details/${internship._id}`,
        meta: { type: "internship", id: internship._id },
      });
      if (poster?.email) {
        await sendEmail(
          poster.email,
          "Your internship was posted successfully",
          `<p>Hi ${poster.fullName},</p><p>Your internship '<strong>${internship.title}</strong>' was posted successfully.</p><p><a href="${process.env.FRONTEND_URL}/internship-details/${internship._id}">View internship</a></p>`
        );
      }
    } catch (e) {
      console.warn("Notification/email for internship post failed:", e.message);
    }

    res.status(201).json({ success: true, internship });
  } catch (error) {
    console.error("Error creating internship:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Get all internships
exports.getInternships = async (req, res) => {
  try {
    const internships = await Internship.find().populate(
      "postedBy",
      "fullName email"
    );
    res.status(200).json({ success: true, internships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get internship by ID
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "postedBy",
      "fullName"
    );
    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }
    res.status(200).json({ success: true, internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Internship (only owner)
exports.updateInternship = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // ✅ Convert stringified arrays into real arrays
    [
      "keywords",
      "requiredSkills",
      "educationRequirements",
      "benefits",
      "targetMajors",
    ].forEach((field) => {
      if (typeof updateData[field] === "string") {
        updateData[field] = updateData[field].split(",").map((v) => v.trim());
      }
    });

    // ✅ Handle stipend object
    if (updateData["stipend[min]"] || updateData["stipend[max]"]) {
      updateData.stipend = {
        min: updateData["stipend[min]"],
        max: updateData["stipend[max]"],
      };
      delete updateData["stipend[min]"];
      delete updateData["stipend[max]"];
    }

    // ✅ Handle supporting documents
    if (req.files && req.files.length > 0) {
      updateData.supportingDocuments = req.files.map((file) => file.path);
    }

    const internship = await Internship.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!internship) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Internship not found or not authorized",
        });
    }

    res.json({ success: true, internship });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete Internship (only owner)
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user._id,
    });

    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: "Not found or not authorized" });
    }

    res
      .status(200)
      .json({ success: true, message: "Internship deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get My Internships
exports.getMyInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.user._id })
      .populate("postedBy", "fullName email")
      .populate("applicants", "_id");

    const internshipsWithCount = internships.map((internship) => ({
      ...internship.toObject(),
      applicantCount: internship.applicants ? internship.applicants.length : 0,
    }));

    res.status(200).json({ success: true, internships: internshipsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
