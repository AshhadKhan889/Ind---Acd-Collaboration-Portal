import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  TextField,
  Divider,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Work,
  School,
  Science,
  Bookmark,
  Share,
  Search,
  FilterList,
  LocationOn,
  AccessTime,
  AttachMoney,
  UploadFile,
} from "@mui/icons-material";

const API_BASE = "http://localhost:5000/api";

const OpportunitiesHub = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Comment dialog state
  const [commentOpen, setCommentOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [commentType, setCommentType] = useState("General");
  const [commentVisibility, setCommentVisibility] = useState("Public");
  const [commentAttachment, setCommentAttachment] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch opportunities (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/opportunities`);
        const data = await res.json();
        if (!data.success) throw new Error("Failed to fetch opportunities");

        const { jobs, projects, internships } = data;

        const formattedJobs = (jobs || []).map((j) => ({
          id: j._id,
          type: "job",
          title: j.jobTitle,
          organization:
            j.organization ||
            j.postedBy?.fullName ||
            j.postedBy?.name ||
            "Unknown Organization",
          description: j.jobDescription || "No description provided",
          skills: j.requiredSkills || [],
          deadline: j.applicationDeadline || null,
          location: j.workLocation
            ? j.workLocation.charAt(0) + j.workLocation.slice(1).toLowerCase()
            : j.officeLocation || "Not specified",
          compensation:
            j.minSalary && j.maxSalary
              ? `${j.minSalary} - ${j.maxSalary} PKR`
              : "Unpaid / TBD",
          posted:
            j.createdAt && !Number.isNaN(new Date(j.createdAt).getTime())
              ? new Date(j.createdAt).toDateString()
              : "Date unavailable",
          postedAt:
            j.createdAt && !Number.isNaN(new Date(j.createdAt).getTime())
              ? new Date(j.createdAt).getTime()
              : 0,
        }));

        const formattedProjects = (projects || []).map((p) => ({
          id: p._id,
          type: "project",
          title: p.projectTitle,
          organization:
            p.organization || p.postedBy?.fullName || "Independent Project",
          description: p.projectDescription,
          skills: p.requiredSkills || [],
          deadline: p.applicationDeadline || p.timeline?.applicationDeadline || null,
          location: p.collaborationPreferences?.remoteAllowed
            ? "Remote"
            : "On-site",
          compensation: p.budget?.amount
            ? `${p.budget.amount} ${p.budget.currency || "PKR"}`
            : "Unpaid / TBD",
          posted:
            p.createdAt && !Number.isNaN(new Date(p.createdAt).getTime())
              ? new Date(p.createdAt).toDateString()
              : "Date unavailable",
          postedAt:
            p.createdAt && !Number.isNaN(new Date(p.createdAt).getTime())
              ? new Date(p.createdAt).getTime()
              : 0,
        }));

        const formattedInternships = (internships || []).map((i) => ({
          id: i._id,
          type: "internship",
          title: i.title,
          organization:
            i.organization || i.postedBy?.fullName || "Organization",
          description: i.description || "No description provided",
          skills: i.requiredSkills || [],
          deadline: i.applicationDeadline || i.deadline || null,
          location: i.workLocation || i.officeLocation || "Not specified",
          compensation: i.stipend
            ? `${i.stipend.min || 0} - ${i.stipend.max || 0} ${
                i.stipend.currency || "PKR"
              }`
            : "Unpaid",
          posted:
            i.createdAt && !Number.isNaN(new Date(i.createdAt).getTime())
              ? new Date(i.createdAt).toDateString()
              : "Date unavailable",
          postedAt:
            i.createdAt && !Number.isNaN(new Date(i.createdAt).getTime())
              ? new Date(i.createdAt).getTime()
              : 0,
        }));

        setOpportunities(
          [
            ...formattedProjects,
            ...formattedInternships,
            ...formattedJobs,
          ].sort((a, b) => (b.postedAt || 0) - (a.postedAt || 0))
        );
      } catch (err) {
        console.error("Error fetching opportunities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helpers: token and headers
  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const handleSave = (id) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Open dialog + fetch comments
  const handleOpenComment = async (opp) => {
    setSelectedOpportunity(opp);
    setCommentOpen(true);
    setCommentsLoading(true);
    setComments([]); // clear while loading

    try {
      console.log("GET comments for", opp.type, opp.id);
      const res = await axios.get(
        `${API_BASE}/comments/${opp.type}/${opp.id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      console.log("GET /comments response:", res.data);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(
        "Error fetching comments:",
        err.response?.data || err.message
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  // Submit comment (uses returned comment to update UI immediately)
  const handleSubmitComment = async () => {
    if (!selectedOpportunity) {
      console.error("No selected opportunity while submitting comment");
      return;
    }
    if (!commentContent || submitting) return;

    setSubmitting(true);
    try {
      const postRes = await axios.post(
        `${API_BASE}/comments/${selectedOpportunity.type.toLowerCase()}/${
          selectedOpportunity.id
        }`,
        {
          comment: commentContent,
          commentType,
          visibility: commentVisibility,
        },
        { headers: getAuthHeaders() }
      );

      console.log("POST /comments response:", postRes.data);

      const created = postRes.data.comment;
      if (created) {
        setComments((prev) => [created, ...prev]);
      } else {
        const res = await axios.get(
          `${API_BASE}/comments/${selectedOpportunity.type}/${selectedOpportunity.id}`,
          { headers: getAuthHeaders() }
        );
        setComments(res.data.comments || []);
      }

      setCommentContent("");
      setCommentType("General");
      setCommentVisibility("Public");
      setCommentAttachment(null);
    } catch (err) {
      console.error(
        "Error submitting comment:",
        err.response?.data || err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId, replyText) => {
    // Validate that replyText exists and is not empty after trimming
    if (!replyText || !replyText.trim()) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/comments/reply/${commentId}`,
        { comment: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reply = res.data.reply;
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), reply], replyDraft: "" }
            : c
        )
      );
    } catch (err) {
      console.error("Error adding reply:", err.response?.data || err.message);
    }
  };

  const handleCloseComment = () => {
    setCommentOpen(false);
    setSelectedOpportunity(null);
    setCommentContent("");
    setCommentType("General");
    setCommentVisibility("Public");
    setCommentAttachment(null);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      (opp.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (opp.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesTab =
      (activeTab === 0 && opp.type === "project") ||
      (activeTab === 1 && opp.type === "internship") ||
      (activeTab === 2 && opp.type === "job");

    return matchesSearch && matchesTab;
  });

  useEffect(() => {
    // debug: show comments when updated
    console.log("Comments state updated:", comments);
  }, [comments]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading opportunities...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
        >
          Academic Opportunities Hub
        </Typography>
        <Typography variant="h5" sx={{ color: "text.secondary" }}>
          Find your next research project, internship, or campus job
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Search sx={{ mr: 1, color: "action.active" }} />
          <TextField
            fullWidth
            placeholder="Search by keyword (e.g., 'AI')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="standard"
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Tabs
          value={activeTab}
          onChange={(e, nv) => setActiveTab(nv)}
          sx={{ mb: -1 }}
        >
          <Tab label="Collaborative Projects" icon={<Science />} />
          <Tab label="Internships" icon={<School />} />
          <Tab label="Jobs" icon={<Work />} />
        </Tabs>
      </Paper>

      {/* Results Count */}
      <Typography variant="subtitle1" sx={{ mb: 2, color: "text.secondary" }}>
        Showing {filteredOpportunities.length}{" "}
        {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
        {searchTerm && ` matching "${searchTerm}"`}
      </Typography>

      {/* Opportunities List */}
      <Box sx={{ display: "grid", gap: 3 }}>
        {filteredOpportunities.length > 0 ? (
          filteredOpportunities.map((opp) => (
            <Card
              key={opp.id}
              sx={{
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {opp.title}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      sx={{ mb: 1 }}
                    >
                      {opp.organization}
                    </Typography>
                  </Box>
                  <Box></Box>
                </Box>

                <Typography paragraph sx={{ mt: 2 }}>
                  {opp.description}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {opp.skills.length > 0 ? (
                    opp.skills.map((skill, i) => (
                      <Chip
                        key={i}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Chip label="No skills specified" size="small" />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    color: "text.secondary",
                  }}
                >
                  <Typography sx={{ display: "flex", alignItems: "center" }}>
                    <LocationOn sx={{ mr: 0.5, fontSize: 18 }} />
                    {opp.location}
                  </Typography>
                  {opp.deadline && (
                    <Typography sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTime sx={{ mr: 0.5, fontSize: 18 }} />
                      Apply by {new Date(opp.deadline).toLocaleDateString()}
                    </Typography>
                  )}
                  <Typography sx={{ display: "flex", alignItems: "center" }}>
                    <AttachMoney sx={{ mr: 0.5, fontSize: 18 }} />
                    {opp.compensation}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: "auto" }}>
                    Posted {opp.posted}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  {localStorage.getItem("role") === "Student" &&
                    (new Date(opp.deadline) > new Date() ? (
                      <Button
                        variant="contained"
                        sx={{ mr: 2 }}
                        href={`/apply/${opp.type}/${opp.id}`}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <Button variant="outlined" sx={{ mr: 2 }} disabled>
                        Deadline Passed
                      </Button>
                    ))}

                  <Button
                    variant="outlined"
                    sx={{ mr: 2 }}
                    onClick={() => navigate(`/${opp.type}-details/${opp.id}`)}
                  >
                    View Details
                  </Button>

                  <Button variant="text" onClick={() => handleOpenComment(opp)}>
                    Comment
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Paper
            elevation={0}
            sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              No opportunities found
            </Typography>
            <Typography sx={{ mb: 3 }}>
              {searchTerm
                ? `We couldn't find any matches for "${searchTerm}".`
                : "Check back soon for upcoming opportunities."}
            </Typography>
            <Button variant="outlined">Request Notification</Button>
          </Paper>
        )}
      </Box>

      {/* Comment Dialog */}
      <Dialog
        open={commentOpen}
        onClose={handleCloseComment}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Comments — {selectedOpportunity?.title}</DialogTitle>
        <DialogContent dividers>
          {/* Existing Comments */}
          <Box mb={2}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Discussion
            </Typography>

            {commentsLoading ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="caption" display="block">
                  Loading comments...
                </Typography>
              </Box>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <Box key={c._id || c.id} p={1} borderBottom="1px solid #eee">
                  {/* main comment */}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{c.commentedBy?.fullName || "User"}:</strong>{" "}
                    {c.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.visibility || "Public"} •{" "}
                    {new Date(
                      c.createdAt || c.created_at || Date.now()
                    ).toLocaleString()}
                  </Typography>

                  {/* replies list */}
                  {c.replies && c.replies.length > 0 && (
                    <Box ml={3} mt={1}>
                      {c.replies.map((r) => (
                        <Box key={r._id} mb={0.5}>
                          <Typography variant="body2">
                            <strong>
                              {r.commentedBy?.fullName || "User"}:
                            </strong>{" "}
                            {r.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(r.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* reply input */}
                  <Box ml={3} mt={1} display="flex" gap={1}>
                    <TextField
                      size="small"
                      placeholder="Write a reply..."
                      fullWidth
                      value={c.replyDraft || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setComments((prev) =>
                          prev.map((com) =>
                            com._id === c._id
                              ? { ...com, replyDraft: value }
                              : com
                          )
                        );
                      }}
                    />
                    <Button
                      onClick={() => handleReplySubmit(c._id, c.replyDraft)}
                      disabled={!c.replyDraft || !c.replyDraft.trim()}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No comments yet.
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Add New Comment */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Write a comment"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Comment Type"
            value={commentType}
            onChange={(e) => setCommentType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="General">General</MenuItem>
            <MenuItem value="Query">Query</MenuItem>
            <MenuItem value="Feedback">Feedback</MenuItem>
          </TextField>
          <TextField
            select
            label="Visibility"
            value={commentVisibility}
            onChange={(e) => setCommentVisibility(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Public">Public</MenuItem>
            <MenuItem value="Private">Private</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseComment}>Close</Button>
          <Button
            variant="contained"
            onClick={handleSubmitComment}
            disabled={!commentContent || submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OpportunitiesHub;
