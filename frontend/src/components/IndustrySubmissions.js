import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Divider,
  Grid,
  Chip,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CommentIcon from "@mui/icons-material/Comment";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const IndustrySubmissions = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarkForms, setRemarkForms] = useState({}); // { applicationId: remark }
  const [addingRemark, setAddingRemark] = useState({}); // { applicationId: true/false }

  useEffect(() => {
    if (projectId) {
      fetchProjectSubmissions();
    } else {
      fetchAllProjectsSubmissions();
    }
  }, [projectId]);

  const fetchProjectSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/profile/industry/submissions/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching project submissions:", err);
      setError(err.response?.data?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjectsSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "/api/profile/industry/submissions/projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData({ projectsWithSubmissions: res.data.projectsWithSubmissions || [] });
    } catch (err) {
      console.error("Error fetching projects submissions:", err);
      setError(err.response?.data?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Single project view
  if (projectId && data) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          📎 Student Submissions
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          {data.project?.projectTitle}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {data.studentsSubmissions && data.studentsSubmissions.length > 0 ? (
          <Grid container spacing={3}>
            {data.studentsSubmissions.map((studentSubmission) => (
              <Grid item xs={12} md={6} key={studentSubmission.student._id}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {studentSubmission.student.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {studentSubmission.student.email}
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/profile/${studentSubmission.student._id}`)}
                      sx={{ mt: 1, mb: 2 }}
                    >
                      View Full Profile
                    </Button>

                    {studentSubmission.submission ? (
                      <Box>
                        <Box sx={{ mt: 2, p: 2, backgroundColor: "#e8f5e9", borderRadius: 1, border: "1px solid #4caf50" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Submission Received
                              </Typography>
                            </Box>
                            <Chip 
                              label="Latest Submission" 
                              color="success" 
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>File:</strong> {studentSubmission.submission.originalFileName || 
                             studentSubmission.submission.fileName}
                          </Typography>
                          <Box sx={{ 
                            p: 1.5, 
                            backgroundColor: "#fff", 
                            borderRadius: 1, 
                            mb: 1.5,
                            border: "1px solid #c8e6c9"
                          }}>
                            <Typography variant="body2" fontWeight="bold" color="success.main" gutterBottom>
                              📅 Uploaded:
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                              {new Date(studentSubmission.submission.uploadedAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => {
                              const token = localStorage.getItem("token");
                              axios
                                .get(
                                  `/api/profile/industry/submission/${studentSubmission.applicationId}`,
                                  {
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: "blob",
                                  }
                                )
                                .then((response) => {
                                  const url = window.URL.createObjectURL(new Blob([response.data]));
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.setAttribute(
                                    "download",
                                    studentSubmission.submission.originalFileName ||
                                      "submission.zip"
                                  );
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                })
                                .catch((err) => {
                                  console.error("Download error:", err);
                                  alert("Failed to download submission");
                                });
                            }}
                            fullWidth
                          >
                            Download Submission
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography color="text.secondary" sx={{ mt: 2 }}>
                        No submission uploaded yet
                      </Typography>
                    )}

                    {/* Remarks Section */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        💬 Remarks & Feedback
                      </Typography>
                      
                      {/* Add Remark Form */}
                      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f5f5f5" }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Add Remark"
                          value={remarkForms[studentSubmission.applicationId] || ""}
                          onChange={(e) => {
                            setRemarkForms({
                              ...remarkForms,
                              [studentSubmission.applicationId]: e.target.value,
                            });
                          }}
                          placeholder="Provide feedback or remarks about the student's submission..."
                          sx={{ mb: 1 }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={async () => {
                            const remark = remarkForms[studentSubmission.applicationId];
                            if (!remark || !remark.trim()) {
                              alert("Please enter a remark");
                              return;
                            }
                            try {
                              setAddingRemark({
                                ...addingRemark,
                                [studentSubmission.applicationId]: true,
                              });
                              const token = localStorage.getItem("token");
                              await axios.post(
                                "/api/profile/industry/submission/remark",
                                {
                                  applicationId: studentSubmission.applicationId,
                                  remark: remark,
                                },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              alert("Remark added successfully!");
                              setRemarkForms({
                                ...remarkForms,
                                [studentSubmission.applicationId]: "",
                              });
                              // Refresh data
                              if (projectId) {
                                fetchProjectSubmissions();
                              } else {
                                fetchAllProjectsSubmissions();
                              }
                            } catch (err) {
                              console.error("Error adding remark:", err);
                              alert(err.response?.data?.message || "Failed to add remark");
                            } finally {
                              setAddingRemark({
                                ...addingRemark,
                                [studentSubmission.applicationId]: false,
                              });
                            }
                          }}
                          disabled={addingRemark[studentSubmission.applicationId] || !remarkForms[studentSubmission.applicationId]?.trim()}
                        >
                          {addingRemark[studentSubmission.applicationId] ? "Adding..." : "Add Remark"}
                        </Button>
                      </Paper>

                      {/* Display Remarks */}
                      {studentSubmission.remarks && studentSubmission.remarks.length > 0 ? (
                        <Stack spacing={2}>
                          {studentSubmission.remarks
                            .slice()
                            .reverse()
                            .map((remark, idx) => {
                              const remarkId = remark._id?.toString() || `remark-${idx}`;
                              return (
                                <Paper key={remarkId} sx={{ p: 2, backgroundColor: "#fff9e6" }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                      {remark.addedByName || "Industry Official"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(remark.addedAt).toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ mb: 2 }}>
                                    {remark.remark}
                                  </Typography>

                                  {/* Display Student Replies */}
                                  {remark.replies && remark.replies.length > 0 && (
                                    <Box sx={{ ml: 2, mb: 2, pl: 2, borderLeft: "2px solid #4caf50" }}>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                                        Student Replies:
                                      </Typography>
                                      <Stack spacing={1}>
                                        {remark.replies.map((reply, replyIdx) => (
                                          <Paper key={replyIdx} sx={{ p: 1.5, backgroundColor: "#e8f5e9" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                              <Typography variant="caption" fontWeight="bold">
                                                {reply.repliedByName || "Student"}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {new Date(reply.repliedAt).toLocaleString()}
                                              </Typography>
                                            </Box>
                                            <Typography variant="body2">{reply.reply}</Typography>
                                          </Paper>
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}
                                </Paper>
                              );
                            })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No remarks yet. Add your first remark above.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No accepted students for this project yet</Typography>
        )}
      </Box>
    );
  }

  // All projects view
  if (data && data.projectsWithSubmissions) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          📎 Student Submissions - All Projects
        </Typography>

        {data.projectsWithSubmissions.length > 0 ? (
          <Stack spacing={3} sx={{ mt: 3 }}>
            {data.projectsWithSubmissions.map((projectData) => (
              <Card key={projectData.project._id} sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">
                        {projectData.project.projectTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {projectData.acceptedCount} accepted student(s)
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() =>
                        navigate(`/industry-submissions/${projectData.project._id}`)
                      }
                    >
                      View Details
                    </Button>
                  </Box>

                  {projectData.studentsSubmissions && projectData.studentsSubmissions.length > 0 ? (
                    <Grid container spacing={2}>
                      {projectData.studentsSubmissions.map((student) => (
                        <Grid item xs={12} sm={6} md={4} key={student.student._id}>
                          <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {student.student.fullName}
                            </Typography>
                            
                            {/* Submission Status */}
                            {student.submission ? (
                              <Box sx={{ mt: 1, p: 1.5, backgroundColor: "#e8f5e9", borderRadius: 1, border: "1px solid #4caf50" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <CheckCircleIcon sx={{ color: "success.main", fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" fontWeight="bold">
                                      Submission Received
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label="Latest" 
                                    color="success" 
                                    size="small"
                                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold" }}
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: "0.7rem" }}>
                                  📅 Uploaded: {new Date(student.submission.uploadedAt).toLocaleString()}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => {
                                    const token = localStorage.getItem("token");
                                    axios
                                      .get(
                                        `/api/profile/industry/submission/${student.applicationId}`,
                                        {
                                          headers: { Authorization: `Bearer ${token}` },
                                          responseType: "blob",
                                        }
                                      )
                                      .then((response) => {
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement("a");
                                        link.href = url;
                                        link.setAttribute(
                                          "download",
                                          student.submission.originalFileName || "submission.zip"
                                        );
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                      })
                                      .catch((err) => {
                                        console.error("Download error:", err);
                                        alert("Failed to download submission");
                                      });
                                  }}
                                  sx={{ mt: 0.5 }}
                                  fullWidth
                                >
                                  Download Latest
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                No submission yet
                              </Typography>
                            )}

                            {/* Remarks Count */}
                            {student.remarks && student.remarks.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {student.remarks.length} remark(s)
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      No submissions from students yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography>No projects with accepted students yet</Typography>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography>No data available</Typography>
    </Box>
  );
};

export default IndustrySubmissions;

