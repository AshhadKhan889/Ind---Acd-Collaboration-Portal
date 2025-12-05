import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ For comments
  const [openComments, setOpenComments] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [replyTexts, setReplyTexts] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [jobsRes, projectsRes, internshipsRes] = await Promise.all([
          axios.get("/api/jobs/my-jobs", { headers }),
          axios.get("/api/projects/my-projects", { headers }),
          axios.get("/api/internships/my-internships", { headers }),
        ]);

        setJobs(jobsRes.data.jobs || jobsRes.data || []);
        setProjects(projectsRes.data.projects || projectsRes.data || []);
        setInternships(
          internshipsRes.data.internships || internshipsRes.data || []
        );

        setLoading(false);
      } catch (error) {
        console.error(error.response?.data || error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Fetch comments
  const handleViewComments = async (type, id) => {
    setOpenComments(true);
    setSelectedItem({ type, id });
    setLoadingComments(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(`/api/comments/${type}/${id}`, { headers });
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoadingComments(false);
    }
  };

  // ✅ Handle reply submission
  const handleReplySubmit = async (commentId) => {
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        `/api/comments/reply/${commentId}`,
        { comment: replyText },
        { headers }
      );

      // ✅ Update comments state
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), res.data.reply] }
            : c
        )
      );

      // ✅ Clear input
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Delete handlers
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`/api/${type}s/${id}`, { headers });

      // ✅ Remove from UI instantly
      if (type === "job") {
        setJobs((prev) => prev.filter((item) => item._id !== id));
      } else if (type === "project") {
        setProjects((prev) => prev.filter((item) => item._id !== id));
      } else if (type === "internship") {
        setInternships((prev) => prev.filter((item) => item._id !== id));
      }

      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(`Failed to delete ${type}.`);
    }
  };

  return (
    <Box p={4}>
      {/* ================== JOBS ================== */}
      <Typography variant="h4" gutterBottom>
        My Posted Jobs
      </Typography>

      {jobs.length === 0 ? (
        <Typography>You haven't posted any jobs yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {job.jobTitle}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({job.applicantCount || 0} Applicants)
                    </Typography>
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/jobs/update/${job._id}`)}
                  >
                    Edit Job
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => navigate(`/job/${job._id}/applicants`)}
                  >
                    View Applicants
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleViewComments("job", job._id)}
                  >
                    View Comments
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete("job", job._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ================== PROJECTS ================== */}
      <Box mt={6}>
        <Typography variant="h4" gutterBottom>
          My Posted Projects
        </Typography>

        {projects.length === 0 ? (
          <Typography>You haven't posted any projects yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {project.projectTitle}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({project.applicantCount || 0} Applicants)
                      </Typography>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() =>
                        navigate(`/projects/update/${project._id}`)
                      }
                    >
                      Edit Project
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() =>
                        navigate(`/project/${project._id}/applicants`)
                      }
                    >
                      View Applicants
                    </Button>
                    <Button
                      size="small"
                      color="success"
                      onClick={() =>
                        navigate(`/industry-submissions/${project._id}`)
                      }
                    >
                      View Submissions
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleViewComments("project", project._id)}
                    >
                      View Comments
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete("project", project._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ================== INTERNSHIPS ================== */}
      <Box mt={6}>
        <Typography variant="h4" gutterBottom>
          My Posted Internships
        </Typography>

        {internships.length === 0 ? (
          <Typography>You haven't posted any internships yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {internships.map((internship) => (
              <Grid item xs={12} sm={6} md={4} key={internship._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {internship.title}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({internship.applicantCount || 0} Applicants)
                      </Typography>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() =>
                        navigate(`/internships/update/${internship._id}`)
                      }
                    >
                      Edit Internship
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() =>
                        navigate(`/internship/${internship._id}/applicants`)
                      }
                    >
                      View Applicants
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        handleViewComments("internship", internship._id)
                      }
                    >
                      View Comments
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete("internship", internship._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ================== COMMENTS DIALOG ================== */}
      <Dialog
        open={openComments}
        onClose={() => setOpenComments(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Comments
          <IconButton
            aria-label="close"
            onClick={() => setOpenComments(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loadingComments ? (
            <CircularProgress />
          ) : comments.length === 0 ? (
            <Typography>No comments yet.</Typography>
          ) : (
            comments.map((c) => (
              <Box
                key={c._id}
                mb={2}
                p={1}
                border="1px solid #ddd"
                borderRadius="8px"
              >
                <Typography variant="body1">{c.comment}</Typography>
                <Typography variant="caption" color="text.secondary">
                  By: {c.commentedBy?.fullName || "Unknown"} (
                  {c.visibility?.toUpperCase()})
                </Typography>

                {c.replies?.length > 0 && (
                  <Box mt={1} ml={2}>
                    {c.replies.map((r) => (
                      <Box
                        key={r._id}
                        mb={1}
                        p={1}
                        borderLeft="2px solid #1976d2"
                      >
                        <Typography variant="body2">{r.comment}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          By: {r.commentedBy?.fullName || "Unknown"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <Box mt={1} display="flex" alignItems="center">
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Write a reply..."
                    value={replyTexts[c._id] || ""}
                    onChange={(e) =>
                      setReplyTexts((prev) => ({
                        ...prev,
                        [c._id]: e.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <Button
                    sx={{ ml: 1 }}
                    variant="contained"
                    onClick={() => handleReplySubmit(c._id)}
                  >
                    Reply
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MyJobsPage;
