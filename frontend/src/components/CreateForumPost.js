import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";

const CreateForumPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("Please fill in all fields");

    setLoading(true);
    try {
      await axios.post(
        "/api/forum",
        {
          title,
          content,
          tags: tags.split(",").map((t) => t.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Discussion post created successfully!");
      navigate("/forum");
    } catch (err) {
      console.error(err);
      alert("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 3, maxWidth: 600, mx: "auto", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Create New Discussion
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Posting..." : "Create Post"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateForumPost;
