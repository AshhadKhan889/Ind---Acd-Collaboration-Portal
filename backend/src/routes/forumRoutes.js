const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const {protect} = require("../middleware/authMiddleware");


// Protected routes
router.post("/", protect, forumController.createPost);
router.get("/", forumController.getAllPosts);
router.get("/:id", forumController.getPostById);
router.post("/:id/comment", protect, forumController.addComment);

module.exports = router;
