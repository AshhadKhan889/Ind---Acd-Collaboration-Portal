import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  CircularProgress,
} from "@mui/material";

const ForumPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const token = localStorage.getItem("token"); // your saved JWT

  const fetchPost = async () => {
    try {
      const res = await axios.get(`/api/forum/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setPosting(true);
      await axios.post(
        `/api/forum/${id}/comment`,
        { text: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComment("");
      await fetchPost(); // reload updated post
    } catch (err) {
      console.error("Comment error:", err.response?.data || err);
      alert(err.response?.data?.message || "Error adding comment");
    } finally {
      setPosting(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {post.title}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.content}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Posted by: {post.author?.fullName || "Anonymous"} on{" "}
            {new Date(post.createdAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Comments ({post.comments?.length || 0})
      </Typography>

      {post.comments?.length === 0 && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          No comments yet. Be the first to share your thoughts!
        </Typography>
      )}

      {post.comments?.map((c, i) => (
        <Card
          key={i}
          sx={{ mb: 2, p: 2, display: "flex", alignItems: "flex-start", gap: 2 }}
        >
          <Avatar>
            {c.user?.fullName ? c.user.fullName.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{c.user?.fullName || "User"}</Typography>
            <Typography variant="body2">{c.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(c.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Card>
      ))}

      <Divider sx={{ my: 3 }} />

      <Box component="form" onSubmit={handleComment}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Write a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={posting}
        >
          {posting ? "Posting..." : "Add Comment"}
        </Button>
      </Box>
    </Box>
  );
};

export default ForumPost;
