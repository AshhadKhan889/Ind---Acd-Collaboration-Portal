const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isStudent } = require("../middleware/studentMiddleware");
const { getSuggestions } = require("../utils/suggestions");

router.get("/", protect, isStudent, async (req, res) => {
  try {
    const suggestions = await getSuggestions(req.user._id);
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
});

module.exports = router;
