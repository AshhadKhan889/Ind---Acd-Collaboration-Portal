// controllers/commentController.js
const Comment = require("../models/Comment");
const Job = require("../models/Job");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// ✅ Add a new comment
exports.addComment = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { comment, commentType, visibility } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    let opportunityModel;
    if (type === "job") opportunityModel = "Job";
    else if (type === "project") opportunityModel = "Project";
    else if (type === "internship") opportunityModel = "Internship";
    else
      return res.status(400).json({ success: false, message: "Invalid type" });

    // create new comment
    const newComment = new Comment({
      comment,
      commentType,
      visibility,
      commentedBy: req.user._id,
      opportunity: id,
      opportunityModel,
    });

    await newComment.save();

    const savedComment = await Comment.findById(newComment._id).populate(
      "commentedBy",
      "fullName email"
    );

    let updatedDoc;
    if (opportunityModel === "Job") {
      updatedDoc = await Job.findByIdAndUpdate(
        id,
        { $push: { comments: savedComment._id } },
        { new: true }
      ).populate({
        path: "comments",
        populate: { path: "commentedBy", select: "fullName email" },
      });
    } else if (opportunityModel === "Project") {
      updatedDoc = await Project.findByIdAndUpdate(
        id,
        { $push: { comments: savedComment._id } },
        { new: true }
      ).populate({
        path: "comments",
        populate: { path: "commentedBy", select: "fullName email" },
      });
    } else if (opportunityModel === "Internship") {
      updatedDoc = await Internship.findByIdAndUpdate(
        id,
        { $push: { comments: savedComment._id } },
        { new: true }
      ).populate({
        path: "comments",
        populate: { path: "commentedBy", select: "fullName email" },
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: savedComment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all comments for job/project/internship
exports.getCommentsByOpportunity = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user._id;

    let model;
    if (type === "job") model = Job;
    else if (type === "project") model = Project;
    else if (type === "internship") model = Internship;
    else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    const opportunity = await model
      .findById(id)
      .populate({
        path: "comments",
        populate: [
          { path: "commentedBy", select: "fullName email" },
          {
            path: "replies",
            populate: { path: "commentedBy", select: "fullName email" },
          },
        ],
      })
      .populate("postedBy", "fullName email"); // ✅ Ensure we know who posted the opportunity

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // ✅ Filter comments
    const comments = opportunity.comments
      .filter((c) => {
        // Public comments visible to everyone
        if (c.visibility === "Public") return true;

        // Private comments visible only to commenter and the opportunity poster
        if (c.visibility === "Private") {
          const isCommenter =
            c.commentedBy?._id.toString() === userId.toString();
          const isPoster =
            opportunity.postedBy?._id.toString() === userId.toString();
          return isCommenter || isPoster;
        }

        return false;
      })
      .map((comment) => {
        // ✅ Filter replies with same visibility logic
        const filteredReplies = comment.replies.filter((r) => {
          if (r.visibility === "Public") return true;
          if (r.visibility === "Private") {
            const isReplier =
              r.commentedBy?._id.toString() === userId.toString();
            const isPoster =
              opportunity.postedBy?._id.toString() === userId.toString();
            return isReplier || isPoster;
          }
          return false;
        });

        return { ...comment.toObject(), replies: filteredReplies };
      });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Add reply to a comment
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Reply text required" });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Create reply comment but DO NOT push it into Job/Project/Internship
    const reply = new Comment({
      comment,
      commentedBy: req.user._id,
      opportunity: parentComment.opportunity,
      opportunityModel: parentComment.opportunityModel,
    });

    const savedReply = await reply.save();

    // Link the reply to the parent comment only
    parentComment.replies.push(savedReply._id);
    await parentComment.save();

    // Populate user info for frontend display
    const populatedReply = await Comment.findById(savedReply._id).populate(
      "commentedBy",
      "fullName email"
    );

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      reply: populatedReply,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ message: "Server error while adding reply" });
  }
};

// ✅ Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    if (comment.commentedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
