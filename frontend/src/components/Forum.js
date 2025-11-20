import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // ✅ icon for the button

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/forum")
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* ✅ Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={600}>
          Discussion Forum
        </Typography>

        {/* ✅ Create Post Button */}
        <Button
          component={Link}
          to="/forum/create"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Create New Discussion
        </Button>
      </Box>

      {/* ✅ Forum Posts List */}
      {posts.length === 0 ? (
        <Typography variant="body1">No discussions yet.</Typography>
      ) : (
        posts.map((post) => (
          <Card key={post._id} sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                {post.title}
              </Typography>
              <Typography variant="body2" sx={{ my: 1.5 }}>
                {post.content.slice(0, 180)}...
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {post.tags?.map((tag, i) => (
                  <Chip key={i} label={`#${tag}`} variant="outlined" size="small" />
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary">
                Posted by: {post.author?.fullName || "Anonymous"} |{" "}
                {new Date(post.createdAt).toLocaleString()}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  to={`/forum/${post._id}`}
                  variant="outlined"
                  color="primary"
                >
                  View Discussion
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default Forum;
