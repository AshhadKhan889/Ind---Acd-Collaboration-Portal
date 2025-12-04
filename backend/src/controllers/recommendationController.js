const Recommendation = require("../models/Recommendation");

exports.createRecommendation = async (req, res) => {
  try {
    const newRec = await Recommendation.create(req.body);
    res.status(201).json(newRec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendationsForStudent = async (req, res) => {
  try {
    const recs = await Recommendation.find({ recommendedTo: req.params.studentId })
      .populate("opportunityId")
      .populate("recommendedBy", "name");
    res.status(200).json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
