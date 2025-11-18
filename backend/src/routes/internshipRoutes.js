const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const { protect } = require("../middleware/authMiddleware"); 
const upload = require("../middleware/uploadMiddleware"); 
const User = require("../models/User");
const {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getMyInternships
} = require("../controllers/internshipController");

// ✅ Create Internship
router.post(
  "/",
  protect,
  upload.array("supportingDocuments", 5),
  createInternship
);

// ✅ Get All Internships
router.get("/", async (req, res) => {
  try {
    const internships = await Internship.find().populate("postedBy", "fullName email");

    // Normalize any legacy records where postedBy is stored as an email string
    const normalized = await Promise.all(
      internships.map(async (i) => {
        if (typeof i.postedBy === "string") {
          const user = await User.findOne({ email: i.postedBy }, "fullName email");
          if (user) {
            const obj = i.toObject();
            obj.postedBy = { _id: user._id, fullName: user.fullName, email: user.email };
            return obj;
          }
        }
        return i;
      })
    );

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get My Internships
router.get("/my-internships", protect, getMyInternships);


// ✅ Get Single Internship
router.get("/:id", getInternshipById);

// ✅ Update Internship (owner only)
router.put(
  "/:id",
  protect,
  upload.array("supportingDocuments", 5),  // multer parses FormData
  updateInternship
);

// ✅ Delete Internship (owner only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const internship = await Internship.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user._id,
    });
    if (!internship) return res.status(404).json({ error: "Not found or not authorized" });
    res.json({ message: "Internship deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
