const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Application = require("../models/ApplicationModel");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const {
      email,
      gender,
      dateOfBirth,
      postalAddress,
      city,
      province,
      cellPhone,
      currentOrganization,
      professionalSummary,
      areaOfExpertise,
      skills,
      academicQualification,
    } = req.body;

    // If email is provided, validate and update it in User model
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered to another account." });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      // Update user email
      await User.findByIdAndUpdate(userId, { email });
    }

    let profile = await Profile.findOne({ user: userId });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: userId },
        {
          gender,
          dateOfBirth,
          postalAddress,
          city,
          province,
          cellPhone,
          currentOrganization,
          professionalSummary,
          areaOfExpertise,
          skills,
          academicQualification,
        },
        { new: true }
      );

      await User.findByIdAndUpdate(userId, { profileCompleted: true });

      return res.json({
        message: "Profile updated successfully",
        profileCompleted: true,
        profile,
      });
    }

    // Create new profile
    const newProfile = new Profile({
      user: userId,
      gender,
      dateOfBirth,
      postalAddress,
      city,
      province,
      cellPhone,
      currentOrganization,
      professionalSummary,
      areaOfExpertise,
      skills,
      academicQualification,
    });

    await newProfile.save();
    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    res.json({
      message: "Profile created successfully",
      profileCompleted: true,
      profile: newProfile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      "username email roleID profileCompleted"
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    let { id } = req.params; // user ID from frontend

    // If frontend sends "me", replace with logged-in user's ID
    if (id === "me") {
      if (!req.user || !req.user.id)
        return res.status(401).json({ message: "Unauthorized" });
      id = req.user.id;
    }

    // Validate that the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user ID" });

    // Fetch user info (excluding sensitive fields)
    const user = await User.findById(id).select(
      "-passwordHash -resetToken -resetTokenExpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch extended profile
    const profile = await Profile.findOne({ user: id });
    res.json({ user, profile });
  } catch (err) {
    console.error("getProfileById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Document management functions
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const { documentName } = req.body; // e.g., "CV", "Transcript", "Certificate"

    if (!documentName) {
      // Delete uploaded file if no document name provided
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Document name is required" });
    }

    // Find or create profile
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please complete your profile first." });
    }

    // Add document to profile
    // Store the full path for deletion, but we'll use just the filename for public URLs
    const document = {
      name: documentName,
      fileName: req.file.originalname,
      filePath: req.file.path, // Full path for file deletion
      uploadedAt: new Date(),
    };

    // Use findOneAndUpdate with $push to only update documents array
    // This avoids triggering full document validation
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $push: { documents: document } },
      { new: true }
    );

    if (!updatedProfile) {
      // Clean up uploaded file if profile update failed
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Profile not found" });
    }

    // Get the newly added document (last one in the array)
    const newDocument = updatedProfile.documents[updatedProfile.documents.length - 1];

    res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        _id: newDocument._id,
        name: newDocument.name,
        fileName: newDocument.fileName,
        filePath: newDocument.filePath,
        uploadedAt: newDocument.uploadedAt,
      },
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Upload document error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if user is viewing their own documents or is authorized (e.g., job poster viewing applicant)
    // For now, allow viewing if user is owner or if they have applied to a job/internship/project
    // You can add more authorization logic here
    const isOwner = userId === requestingUserId.toString();

    // Return documents with public file paths
    // Extract just the filename from the stored path (could be absolute or relative)
    const documents = profile.documents.map((doc) => {
      // Get filename from path (handles both absolute and relative paths)
      const fileName = path.basename(doc.filePath);
      return {
        _id: doc._id,
        name: doc.name,
        fileName: doc.fileName,
        fileUrl: `/uploads/${fileName}`, // Public URL served by express.static
        uploadedAt: doc.uploadedAt,
      };
    });

    res.json({ documents, isOwner });
  } catch (err) {
    console.error("Get documents error:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    // Find profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find document
    const document = profile.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from filesystem
    // filePath is already an absolute path from multer
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove document from profile
    profile.documents.pull(documentId);
    await profile.save();

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Progress Tracking Functions
// Student: Update progress for an accepted application
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId, update, percentage, currentStatus } = req.body;

    if (!applicationId || !update) {
      return res.status(400).json({ message: "Application ID and update are required" });
    }

    // Validate application exists and belongs to this student
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found. It may have been withdrawn." });
    }

    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application's progress" });
    }

    // Check if application is accepted (not withdrawn or rejected)
    if (application.status !== "Accepted") {
      return res.status(400).json({ 
        message: "Can only update progress for accepted applications. This application may have been withdrawn." 
      });
    }

    // Only allow progress updates for projects
    if (application.opportunityType !== "project") {
      return res.status(400).json({ message: "Progress tracking is only available for projects" });
    }

    // Get project details
    const project = await Project.findById(application.opportunityId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find or create profile
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please complete your profile first." });
    }

    // Find existing progress tracking entry
    let progressEntry = profile.progressTracking.find(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    // Get the latest percentage from previous updates, or use 0 if none exist
    let latestPercentage = 0;
    if (progressEntry && progressEntry.progressUpdates && progressEntry.progressUpdates.length > 0) {
      const lastUpdate = progressEntry.progressUpdates[progressEntry.progressUpdates.length - 1];
      latestPercentage = lastUpdate?.percentage || 0;
    }

    // Determine the final percentage to use
    const finalPercentage = percentage !== undefined && percentage !== null ? percentage : latestPercentage;

    if (!progressEntry) {
      // Create new progress tracking entry using $push (avoids full document validation)
      const newProgressEntry = {
        applicationId: application._id,
        projectId: project._id,
        projectTitle: project.projectTitle,
        progressUpdates: [{
          update,
          percentage: finalPercentage,
          updatedAt: new Date(),
        }],
        currentStatus: currentStatus || "Not Started",
        createdAt: new Date(),
      };

      await Profile.findOneAndUpdate(
        { user: userId },
        { $push: { progressTracking: newProgressEntry } },
        { new: true, runValidators: false }
      );
    } else {
      // Update existing entry using array filters (avoids full document validation)
      const updateQuery = {
        $push: {
          "progressTracking.$[entry].progressUpdates": {
            update,
            percentage: finalPercentage,
            updatedAt: new Date(),
          },
        },
      };

      // Update current status if provided
      if (currentStatus) {
        updateQuery.$set = {
          "progressTracking.$[entry].currentStatus": currentStatus,
        };
      }

      await Profile.findOneAndUpdate(
        { user: userId },
        updateQuery,
        {
          arrayFilters: [{ "entry.applicationId": application._id }],
          new: true,
          runValidators: false,
        }
      );
    }

    // Fetch the updated entry to return
    const updatedProfile = await Profile.findOne({ user: userId });
    const updatedProgressEntry = updatedProfile.progressTracking.find(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    res.json({
      message: "Progress updated successfully",
      progressTracking: updatedProgressEntry,
    });
  } catch (err) {
    console.error("Update progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Student: Get their own progress for all accepted applications
const getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId });

    // If profile doesn't exist, return empty array (not an error)
    if (!profile) {
      return res.json({
        progressTracking: [],
      });
    }

    // Populate application and project details for each progress entry
    // Filter out entries where application was withdrawn or is not accepted
    const progressWithDetails = await Promise.all(
      (profile.progressTracking || []).map(async (entry) => {
        try {
          const application = await Application.findById(entry.applicationId)
            .select("status opportunityType")
            .lean();
          
          // If application doesn't exist (was withdrawn) or is not accepted, exclude it
          if (!application || application.status !== "Accepted") {
            return null;
          }

          const project = await Project.findById(entry.projectId)
            .select("projectTitle")
            .lean();

          return {
            ...entry.toObject(),
            applicationId: {
              _id: entry.applicationId,
              status: application.status,
              opportunityType: application.opportunityType,
            },
            projectId: {
              _id: entry.projectId,
              projectTitle: project?.projectTitle || entry.projectTitle,
            },
            projectTitle: project?.projectTitle || entry.projectTitle,
          };
        } catch (err) {
          console.error("Error populating progress entry:", err);
          return null; // Exclude entries with errors (likely withdrawn)
        }
      })
    );

    // Filter out null entries (withdrawn applications)
    const validProgress = progressWithDetails.filter(entry => entry !== null);

    res.json({
      progressTracking: validProgress,
    });
  } catch (err) {
    console.error("Get my progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Academia: Get progress of all students for their projects
const getStudentsProgress = async (req, res) => {
  try {
    const academiaId = req.user.id;
    const { projectId } = req.params;

    // Verify the project belongs to this academia user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.postedBy.toString() !== academiaId.toString()) {
      return res.status(403).json({ message: "Not authorized to view progress for this project" });
    }

    // Find all accepted applications for this project
    const acceptedApplications = await Application.find({
      opportunityId: projectId,
      opportunityType: "project",
      status: "Accepted",
    }).populate("userId", "fullName email");

    // Get progress for each student
    const studentsProgress = await Promise.all(
      acceptedApplications.map(async (application) => {
        const profile = await Profile.findOne({ user: application.userId._id });
        if (!profile) {
          return {
            student: {
              _id: application.userId._id,
              fullName: application.userId.fullName,
              email: application.userId.email,
            },
            applicationId: application._id,
            progress: null,
          };
        }

        const progressEntry = profile.progressTracking.find(
          (entry) => entry.applicationId.toString() === application._id.toString()
        );

        // For academia, only return the latest progress update (not the full history)
        let progressForAcademia = null;
        if (progressEntry) {
          const latestUpdate = progressEntry.progressUpdates && progressEntry.progressUpdates.length > 0
            ? progressEntry.progressUpdates[progressEntry.progressUpdates.length - 1]
            : null;

          // Only include submission document if project is completed (100% or status is Completed)
          const isCompleted = (latestUpdate && latestUpdate.percentage === 100) || 
                             progressEntry.currentStatus === "Completed";
          
          progressForAcademia = {
            applicationId: progressEntry.applicationId,
            projectId: progressEntry.projectId,
            projectTitle: progressEntry.projectTitle,
            currentStatus: progressEntry.currentStatus,
            // Only include the latest update, not the full history
            latestUpdate: latestUpdate,
            // Only show submission if project is completed
            submissionDocument: (isCompleted && progressEntry.submissionDocument) ? progressEntry.submissionDocument : null,
            remarks: progressEntry.remarks || [],
            createdAt: progressEntry.createdAt,
          };
        }

        return {
          student: {
            _id: application.userId._id,
            fullName: application.userId.fullName,
            email: application.userId.email,
          },
          applicationId: application._id,
          progress: progressForAcademia,
        };
      })
    );

    res.json({
      project: {
        _id: project._id,
        projectTitle: project.projectTitle,
      },
      studentsProgress,
    });
  } catch (err) {
    console.error("Get students progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Academia: Get all projects with student progress
const getProjectsWithProgress = async (req, res) => {
  try {
    const academiaId = req.user.id;

    // Get all projects posted by this academia user
    const projects = await Project.find({ postedBy: academiaId })
      .select("projectTitle createdAt timeline")
      .sort({ createdAt: -1 });

    // For each project, get accepted applications count and progress summary
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const acceptedApplications = await Application.find({
          opportunityId: project._id,
          opportunityType: "project",
          status: "Accepted",
        });

        const studentsWithProgress = await Promise.all(
          acceptedApplications.map(async (application) => {
            const profile = await Profile.findOne({ user: application.userId });
            if (!profile) return null;

            const progressEntry = profile.progressTracking.find(
              (entry) => entry.applicationId.toString() === application._id.toString()
            );

            if (!progressEntry) return null;

            const user = await User.findById(application.userId).select("fullName email");
            const latestUpdate = progressEntry.progressUpdates.length > 0
              ? progressEntry.progressUpdates[progressEntry.progressUpdates.length - 1]
              : null;
            
            // Only include submission document if project is completed (100% or status is Completed)
            const isCompleted = (latestUpdate && latestUpdate.percentage === 100) || 
                               progressEntry.currentStatus === "Completed";
            
            return {
              student: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
              },
              applicationId: application._id,
              currentStatus: progressEntry.currentStatus,
              latestUpdate: latestUpdate,
              // Only show submission if project is completed
              submissionDocument: (isCompleted && progressEntry.submissionDocument) ? progressEntry.submissionDocument : null,
              remarks: progressEntry.remarks || [],
              totalUpdates: progressEntry.progressUpdates.length,
            };
          })
        );

        return {
          project: {
            _id: project._id,
            projectTitle: project.projectTitle,
            createdAt: project.createdAt,
          },
          acceptedCount: acceptedApplications.length,
          studentsProgress: studentsWithProgress.filter((s) => s !== null),
        };
      })
    );

    res.json({ projectsWithProgress });
  } catch (err) {
    console.error("Get projects with progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Upload submission document for completed project (100% progress) OR Industry Official projects
const uploadSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!applicationId) {
      // Delete uploaded file if no application ID provided
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Application ID is required" });
    }

    // Validate application exists and belongs to this student
    const application = await Application.findById(applicationId);
    if (!application) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.userId.toString() !== userId.toString()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: "Not authorized to upload submission for this application" });
    }

    // Check if application is accepted
    if (application.status !== "Accepted") {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Can only upload submission for accepted applications" });
    }

    // Check if this is an Industry Official project
    const project = await Project.findById(application.opportunityId).populate("postedBy", "roleID");
    if (!project) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Project not found" });
    }

    const isIndustryOfficialProject = project.postedBy && 
      (project.postedBy.roleID === "Industry Official" || project.postedBy.role === "industry official");

    // Find profile
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Profile not found. Please complete your profile first." });
    }

    // Find or create progress entry
    let progressIndex = profile.progressTracking.findIndex(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    if (progressIndex === -1) {
      // For Industry Official projects, create a new progress entry without progress updates
      if (isIndustryOfficialProject) {
        const newProgressEntry = {
          applicationId: application._id,
          projectId: project._id,
          projectTitle: project.projectTitle,
          progressUpdates: [],
          currentStatus: "In Progress",
          createdAt: new Date(),
        };
        // Use $push to add the new progress entry
        await Profile.findOneAndUpdate(
          { user: userId },
          { $push: { progressTracking: newProgressEntry } },
          { new: true, runValidators: false }
        );
        // Fetch the updated profile to get the correct index
        profile = await Profile.findOne({ user: userId });
        progressIndex = profile.progressTracking.findIndex(
          (entry) => entry.applicationId.toString() === applicationId.toString()
        );
      } else {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "Progress tracking not found for this application" });
      }
    }

    const progressEntry = profile.progressTracking[progressIndex];

    // For Academia projects, check if progress is 100% or status is Completed
    // For Industry Official projects, skip this check
    if (!isIndustryOfficialProject) {
      const latestPercentage = progressEntry.progressUpdates && progressEntry.progressUpdates.length > 0
        ? progressEntry.progressUpdates[progressEntry.progressUpdates.length - 1].percentage
        : 0;

      if (latestPercentage < 100 && progressEntry.currentStatus !== "Completed") {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          message: "Submission can only be uploaded when progress is 100% or status is Completed" 
        });
      }
    }

    // Delete old submission if exists
    if (progressEntry.submissionDocument && progressEntry.submissionDocument.filePath) {
      if (fs.existsSync(progressEntry.submissionDocument.filePath)) {
        fs.unlinkSync(progressEntry.submissionDocument.filePath);
      }
    }

    // Update submission document using MongoDB update operators
    await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          [`progressTracking.${progressIndex}.submissionDocument`]: {
            fileName: req.file.filename,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: false }
    );

    res.json({
      message: "Submission uploaded successfully",
      submission: {
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        uploadedAt: new Date(),
      },
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Upload submission error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Download submission document (for Academia)
const downloadSubmission = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const academiaId = req.user.id;

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify the project belongs to this academia user
    const project = await Project.findById(application.opportunityId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.postedBy.toString() !== academiaId.toString()) {
      return res.status(403).json({ message: "Not authorized to download this submission" });
    }

    // Find student profile
    const profile = await Profile.findOne({ user: application.userId });
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Find progress entry
    const progressEntry = profile.progressTracking.find(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    if (!progressEntry || !progressEntry.submissionDocument) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const filePath = progressEntry.submissionDocument.filePath;
    const originalFileName = progressEntry.submissionDocument.originalFileName;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Submission file not found on server" });
    }

    // Send file
    res.download(filePath, originalFileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (err) {
    console.error("Download submission error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Academia: Add remark to student progress
const addRemark = async (req, res) => {
  try {
    const academiaId = req.user.id;
    const { applicationId, remark } = req.body;

    if (!applicationId || !remark || !remark.trim()) {
      return res.status(400).json({ message: "Application ID and remark are required" });
    }

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify the project belongs to this academia user
    const project = await Project.findById(application.opportunityId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.postedBy.toString() !== academiaId.toString()) {
      return res.status(403).json({ message: "Not authorized to add remarks for this project" });
    }

    // Find student profile
    const profile = await Profile.findOne({ user: application.userId });
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Find progress entry
    const progressIndex = profile.progressTracking.findIndex(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    if (progressIndex === -1) {
      return res.status(404).json({ message: "Progress tracking not found for this application" });
    }

    // Get academia user details
    const academiaUser = await User.findById(academiaId).select("fullName");
    if (!academiaUser) {
      return res.status(404).json({ message: "Academia user not found" });
    }

    // Add remark using MongoDB update operators
    await Profile.findOneAndUpdate(
      { user: application.userId },
      {
        $push: {
          [`progressTracking.${progressIndex}.remarks`]: {
            remark: remark.trim(),
            addedBy: academiaId,
            addedByName: academiaUser.fullName,
            addedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: false }
    );

    // Send notification to student
    try {
      const Notification = require("../models/Notification");
      await Notification.create({
        user: application.userId,
        title: "New Remark on Your Progress",
        message: `You have received a new remark from ${academiaUser.fullName} regarding your progress on ${project.projectTitle}.`,
        link: `/profile/me`,
        meta: {
          type: "progress_remark",
          projectId: project._id,
          projectTitle: project.projectTitle,
        },
      });
    } catch (e) {
      console.warn("Notification for remark failed:", e.message);
    }

    res.json({
      message: "Remark added successfully",
    });
  } catch (err) {
    console.error("Add remark error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Student: Reply to a remark
const replyToRemark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId, remarkId, reply } = req.body;

    if (!applicationId || !remarkId || !reply || !reply.trim()) {
      return res.status(400).json({ message: "Application ID, Remark ID, and reply are required" });
    }

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify the application belongs to this student
    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to reply to remarks for this application" });
    }

    // Find student profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find progress entry
    const progressIndex = profile.progressTracking.findIndex(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    if (progressIndex === -1) {
      return res.status(404).json({ message: "Progress tracking not found for this application" });
    }

    const progressEntry = profile.progressTracking[progressIndex];

    // Find the remark
    const remarkIndex = progressEntry.remarks.findIndex(
      (remark) => remark._id.toString() === remarkId.toString()
    );

    if (remarkIndex === -1) {
      return res.status(404).json({ message: "Remark not found" });
    }

    // Get student user details
    const studentUser = await User.findById(userId).select("fullName");
    if (!studentUser) {
      return res.status(404).json({ message: "Student user not found" });
    }

    // Add reply by directly updating the nested array
    // Find the remark and push the reply
    const remark = progressEntry.remarks[remarkIndex];
    
    // Ensure replies array exists
    if (!remark.replies) {
      remark.replies = [];
    }
    
    // Add the reply to the remark's replies array
    remark.replies.push({
      reply: reply.trim(),
      repliedBy: userId,
      repliedByName: studentUser.fullName,
      repliedAt: new Date(),
    });

    // Save the profile (mark the nested path as modified to ensure it saves)
    profile.markModified(`progressTracking.${progressIndex}.remarks.${remarkIndex}.replies`);
    await profile.save({ validateBeforeSave: false });

    // Send notification to academia (project owner)
    try {
      const Notification = require("../models/Notification");
      const project = await Project.findById(progressEntry.projectId);
      if (project && project.postedBy) {
        await Notification.create({
          user: project.postedBy,
          title: "Student Replied to Your Remark",
          message: `${studentUser.fullName} has replied to your remark on ${progressEntry.projectTitle}.`,
          link: `/student-progress/${project._id}`,
          meta: {
            type: "remark_reply",
            projectId: project._id,
            projectTitle: progressEntry.projectTitle,
            studentId: userId,
          },
        });
      }
    } catch (e) {
      console.warn("Notification for reply failed:", e.message);
    }

    res.json({
      message: "Reply added successfully",
    });
  } catch (err) {
    console.error("Reply to remark error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Industry Official: Get student submissions for their projects
const getIndustryProjectSubmissions = async (req, res) => {
  try {
    const industryId = req.user.id;
    const { projectId } = req.params;

    // Verify the project belongs to this industry official
    const project = await Project.findById(projectId).populate("postedBy", "roleID role");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if project belongs to this industry official
    // Handle both populated and non-populated postedBy
    const postedById = project.postedBy?._id?.toString() || project.postedBy?.toString() || project.postedBy;
    if (postedById.toString() !== industryId.toString()) {
      return res.status(403).json({ message: "Not authorized to view submissions for this project" });
    }

    // Verify it's an Industry Official project
    // If postedBy is populated, check roleID/role; otherwise fetch the user
    let isIndustryOfficialProject = false;
    if (project.postedBy && typeof project.postedBy === 'object') {
      isIndustryOfficialProject = project.postedBy.roleID === "Industry Official" || 
                                   project.postedBy.role === "industry official";
    } else {
      // If not populated, fetch the user to check role
      const User = require("../models/User");
      const poster = await User.findById(project.postedBy);
      if (poster) {
        isIndustryOfficialProject = poster.roleID === "Industry Official" || 
                                     poster.role === "industry official";
      }
    }
    
    if (!isIndustryOfficialProject) {
      return res.status(400).json({ message: "This endpoint is only for Industry Official projects" });
    }

    // Find all accepted applications for this project
    const acceptedApplications = await Application.find({
      opportunityId: projectId,
      opportunityType: "project",
      status: "Accepted",
    }).populate("userId", "fullName email");

    // Get submissions for each student
    const studentsSubmissions = await Promise.all(
      acceptedApplications.map(async (application) => {
        const profile = await Profile.findOne({ user: application.userId._id });
        if (!profile) {
          return {
            student: {
              _id: application.userId._id,
              fullName: application.userId.fullName,
              email: application.userId.email,
            },
            applicationId: application._id,
            submission: null,
            remarks: [],
          };
        }

        const progressEntry = profile.progressTracking.find(
          (entry) => entry.applicationId.toString() === application._id.toString()
        );

        return {
          student: {
            _id: application.userId._id,
            fullName: application.userId.fullName,
            email: application.userId.email,
          },
          applicationId: application._id,
          submission: progressEntry?.submissionDocument || null,
          remarks: progressEntry?.remarks || [],
        };
      })
    );

    res.json({
      project: {
        _id: project._id,
        projectTitle: project.projectTitle,
      },
      studentsSubmissions,
    });
  } catch (err) {
    console.error("Get industry project submissions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Industry Official: Get all projects with student submissions
const getIndustryProjectsWithSubmissions = async (req, res) => {
  try {
    const industryId = req.user.id;

    // Get all projects posted by this industry official
    const projects = await Project.find({ postedBy: industryId })
      .select("projectTitle createdAt timeline")
      .sort({ createdAt: -1 });

    // For each project, get accepted applications count and submissions summary
    const projectsWithSubmissions = await Promise.all(
      projects.map(async (project) => {
        const acceptedApplications = await Application.find({
          opportunityId: project._id,
          opportunityType: "project",
          status: "Accepted",
        });

        const studentsWithSubmissions = await Promise.all(
          acceptedApplications.map(async (application) => {
            const profile = await Profile.findOne({ user: application.userId });
            if (!profile) return null;

            const progressEntry = profile.progressTracking.find(
              (entry) => entry.applicationId.toString() === application._id.toString()
            );

            if (!progressEntry) return null;

            const user = await User.findById(application.userId).select("fullName email");
            
            return {
              student: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
              },
              applicationId: application._id,
              submission: progressEntry.submissionDocument || null,
              remarks: progressEntry.remarks || [],
            };
          })
        );

        return {
          project: {
            _id: project._id,
            projectTitle: project.projectTitle,
            createdAt: project.createdAt,
          },
          acceptedCount: acceptedApplications.length,
          studentsSubmissions: studentsWithSubmissions.filter((s) => s !== null),
        };
      })
    );

    res.json({ projectsWithSubmissions });
  } catch (err) {
    console.error("Get industry projects with submissions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Industry Official: Download submission document
const downloadIndustrySubmission = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const industryId = req.user.id;

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify the project belongs to this industry official
    const project = await Project.findById(application.opportunityId).populate("postedBy", "roleID role");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if project belongs to this industry official
    // Handle both populated and non-populated postedBy
    const postedById = project.postedBy?._id?.toString() || project.postedBy?.toString() || project.postedBy;
    if (postedById.toString() !== industryId.toString()) {
      return res.status(403).json({ message: "Not authorized to download this submission" });
    }

    // Find student profile
    const profile = await Profile.findOne({ user: application.userId });
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Find progress entry
    const progressEntry = profile.progressTracking.find(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    if (!progressEntry || !progressEntry.submissionDocument) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const filePath = progressEntry.submissionDocument.filePath;
    const originalFileName = progressEntry.submissionDocument.originalFileName;

    if (!filePath) {
      return res.status(404).json({ message: "Submission file path not found" });
    }

    // Resolve the file path (handle both absolute and relative paths)
    const path = require("path");
    let resolvedPath = filePath;
    if (!path.isAbsolute(filePath)) {
      // If relative path, resolve from project root
      resolvedPath = path.join(__dirname, "../../", filePath);
    }

    if (!fs.existsSync(resolvedPath)) {
      console.error(`File not found at path: ${resolvedPath}`);
      return res.status(404).json({ 
        message: "Submission file not found on server",
        details: `File path: ${resolvedPath}`
      });
    }

    // Send file
    res.download(resolvedPath, originalFileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error downloading file", error: err.message });
        }
      }
    });
  } catch (err) {
    console.error("Download industry submission error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Industry Official: Add remark to student submission
const addIndustryRemark = async (req, res) => {
  try {
    const industryId = req.user.id;
    const { applicationId, remark } = req.body;

    if (!applicationId || !remark || !remark.trim()) {
      return res.status(400).json({ message: "Application ID and remark are required" });
    }

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify the project belongs to this industry official
    const project = await Project.findById(application.opportunityId).populate("postedBy", "roleID role");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if project belongs to this industry official
    // Handle both populated and non-populated postedBy
    const postedById = project.postedBy?._id?.toString() || project.postedBy?.toString() || project.postedBy;
    if (postedById.toString() !== industryId.toString()) {
      return res.status(403).json({ message: "Not authorized to add remarks for this project" });
    }

    // Find student profile
    const profile = await Profile.findOne({ user: application.userId });
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Find progress entry
    const progressIndex = profile.progressTracking.findIndex(
      (entry) => entry.applicationId.toString() === applicationId.toString()
    );

    if (progressIndex === -1) {
      return res.status(404).json({ message: "Progress tracking not found for this application" });
    }

    // Get industry official user details
    const industryUser = await User.findById(industryId).select("fullName");
    if (!industryUser) {
      return res.status(404).json({ message: "Industry official user not found" });
    }

    // Add remark using MongoDB update operators
    await Profile.findOneAndUpdate(
      { user: application.userId },
      {
        $push: {
          [`progressTracking.${progressIndex}.remarks`]: {
            remark: remark.trim(),
            addedBy: industryId,
            addedByName: industryUser.fullName,
            addedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: false }
    );

    // Send notification to student
    try {
      const Notification = require("../models/Notification");
      await Notification.create({
        user: application.userId,
        title: "New Remark on Your Submission",
        message: `You have received a new remark from ${industryUser.fullName} regarding your submission for ${project.projectTitle}.`,
        link: `/profile/me`,
        meta: {
          type: "submission_remark",
          projectId: project._id,
          projectTitle: project.projectTitle,
        },
      });
    } catch (e) {
      console.warn("Notification for remark failed:", e.message);
    }

    res.json({
      message: "Remark added successfully",
    });
  } catch (err) {
    console.error("Add industry remark error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 👉 Export properly
module.exports = {
  createOrUpdateProfile,
  getProfile,
  getProfileById,
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateProgress,
  getMyProgress,
  getStudentsProgress,
  getProjectsWithProgress,
  uploadSubmission,
  downloadSubmission,
  addRemark,
  replyToRemark,
  getIndustryProjectSubmissions,
  getIndustryProjectsWithSubmissions,
  downloadIndustrySubmission,
  addIndustryRemark,
};
