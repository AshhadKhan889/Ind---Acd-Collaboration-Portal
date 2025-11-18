const ForumPost = require("../models/ForumPost");

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const post = await ForumPost.create({
      title,
      content,
      tags,
      author: req.user._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate("author", "fullName roleID")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
};

// Get single post
exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate("author", "fullName roleID")
      .populate("comments.user", "fullName roleID");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error fetching post", error: err.message });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      user: req.user._id,  // ✅ comes from JWT middleware
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
};



