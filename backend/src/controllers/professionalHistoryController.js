const ProfessionalHistory = require("../models/ProfessionalHistory");

// Create new history (auto-assign userID)
const createHistory = async (req, res) => {
  try {
    const history = await ProfessionalHistory.create({
      userID: req.user._id,   // comes from auth middleware
      organization: req.body.organization,
      designation: req.body.designation,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all histories of the logged-in user
const getHistories = async (req, res) => {
  try {
    const histories = await ProfessionalHistory.find({ userID: req.user._id });
    res.json(histories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single history by ID (must belong to user)
const getHistoryById = async (req, res) => {
  try {
    const history = await ProfessionalHistory.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!history) return res.status(404).json({ message: "History not found" });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update history (only own)
const updateHistory = async (req, res) => {
  try {
    const history = await ProfessionalHistory.findOneAndUpdate(
      { _id: req.params.id, userID: req.user._id },
      req.body,
      { new: true }
    );

    if (!history) return res.status(404).json({ message: "History not found" });
    res.json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete history (only own)
const deleteHistory = async (req, res) => {
  try {
    const history = await ProfessionalHistory.findOneAndDelete({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!history) return res.status(404).json({ message: "History not found" });
    res.json({ message: "History removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const histories = await ProfessionalHistory.find({ userID: req.params.userId });
    res.json(histories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createHistory,
  getHistories,
  getHistoryById,
  updateHistory,
  deleteHistory,
  getUserHistory,
};
