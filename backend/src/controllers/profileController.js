const Profile = require("../models/Profile");
const User = require("../models/User");

const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const {
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
      academicQualification
    } = req.body;

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
          academicQualification
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

// 👉 Add this
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
    const { id } = req.params; // user ID passed from frontend

    // Fetch user info (excluding sensitive fields)
    const user = await User.findById(id).select("-passwordHash -resetToken -resetTokenExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch extended profile
    const profile = await Profile.findOne({ user: id });
    res.json({ user, profile });
  } catch (err) {
    console.error("getProfileById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 👉 Export properly
module.exports = {
  createOrUpdateProfile,
  getProfile,
  getProfileById,
};
