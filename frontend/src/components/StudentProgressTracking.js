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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CommentIcon from "@mui/icons-material/Comment";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const StudentProgressTracking = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarkForms, setRemarkForms] = useState({}); // { applicationId: remark }
  const [addingRemark, setAddingRemark] = useState({}); // { applicationId: true/false }

  useEffect(() => {
    if (projectId) {
      fetchProjectProgress();
    } else {
      fetchAllProjectsProgress();
    }
  }, [projectId]);

  const fetchProjectProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/profile/progress/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching project progress:", err);
      setError(err.response?.data?.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjectsProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "/api/profile/progress/projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData({ projectsWithProgress: res.data.projectsWithProgress || [] });
    } catch (err) {
      console.error("Error fetching projects progress:", err);
      setError(err.response?.data?.message || "Failed to load progress");
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
          📊 Student Progress Tracking
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          {data.project?.projectTitle}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {data.studentsProgress && data.studentsProgress.length > 0 ? (
          <Grid container spacing={3}>
            {data.studentsProgress.map((studentProgress) => (
              <Grid item xs={12} md={6} key={studentProgress.student._id}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {studentProgress.student.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {studentProgress.student.email}
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/profile/${studentProgress.student._id}`)}
                      sx={{ mt: 1, mb: 2 }}
                    >
                      View Full Profile
                    </Button>

                    {studentProgress.progress ? (
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle2">Status:</Typography>
                          <Chip
                            label={studentProgress.progress.currentStatus}
                            color={
                              studentProgress.progress.currentStatus === "Completed"
                                ? "success"
                                : studentProgress.progress.currentStatus === "In Progress"
                                ? "primary"
                                : "default"
                            }
                            size="small"
                          />
                        </Box>

                        {studentProgress.progress.latestUpdate ? (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Latest Progress:
                            </Typography>
                            <Paper
                              sx={{
                                p: 2,
                                mb: 1,
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(studentProgress.progress.latestUpdate.updatedAt).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" fontWeight="bold">
                                  {studentProgress.progress.latestUpdate.percentage}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={studentProgress.progress.latestUpdate.percentage}
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2">{studentProgress.progress.latestUpdate.update}</Typography>
                            </Paper>
                          </>
                        ) : (
                          <Typography color="text.secondary" sx={{ mt: 2 }}>
                            No progress updates yet
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
                              value={remarkForms[studentProgress.applicationId] || ""}
                              onChange={(e) => {
                                setRemarkForms({
                                  ...remarkForms,
                                  [studentProgress.applicationId]: e.target.value,
                                });
                              }}
                              placeholder="Provide feedback or remarks about the student's progress..."
                              sx={{ mb: 1 }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<SendIcon />}
                              onClick={async () => {
                                const remark = remarkForms[studentProgress.applicationId];
                                if (!remark || !remark.trim()) {
                                  alert("Please enter a remark");
                                  return;
                                }
                                try {
                                  setAddingRemark({
                                    ...addingRemark,
                                    [studentProgress.applicationId]: true,
                                  });
                                  const token = localStorage.getItem("token");
                                  await axios.post(
                                    "/api/profile/progress/remark",
                                    {
                                      applicationId: studentProgress.applicationId,
                                      remark: remark,
                                    },
                                    {
                                      headers: { Authorization: `Bearer ${token}` },
                                    }
                                  );
                                  alert("Remark added successfully!");
                                  setRemarkForms({
                                    ...remarkForms,
                                    [studentProgress.applicationId]: "",
                                  });
                                  // Refresh data
                                  if (projectId) {
                                    fetchProjectProgress();
                                  } else {
                                    fetchAllProjectsProgress();
                                  }
                                } catch (err) {
                                  console.error("Error adding remark:", err);
                                  alert(err.response?.data?.message || "Failed to add remark");
                                } finally {
                                  setAddingRemark({
                                    ...addingRemark,
                                    [studentProgress.applicationId]: false,
                                  });
                                }
                              }}
                              disabled={addingRemark[studentProgress.applicationId] || !remarkForms[studentProgress.applicationId]?.trim()}
                            >
                              {addingRemark[studentProgress.applicationId] ? "Adding..." : "Add Remark"}
                            </Button>
                          </Paper>

                          {/* Display Remarks */}
                          {studentProgress.progress.remarks && studentProgress.progress.remarks.length > 0 ? (
                            <Stack spacing={2}>
                              {studentProgress.progress.remarks
                                .slice()
                                .reverse()
                                .map((remark, idx) => {
                                  const remarkId = remark._id?.toString() || `remark-${idx}`;
                                  return (
                                    <Paper key={remarkId} sx={{ p: 2, backgroundColor: "#fff9e6" }}>
                                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                          {remark.addedByName || "Academia"}
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

                        {/* Submission Download Section - Only show if completed and submission exists */}
                        {studentProgress.progress.submissionDocument && 
                         studentProgress.progress.latestUpdate && 
                         (studentProgress.progress.latestUpdate.percentage === 100 || 
                          studentProgress.progress.currentStatus === "Completed") && (
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
                              <strong>File:</strong> {studentProgress.progress.submissionDocument.originalFileName || 
                               studentProgress.progress.submissionDocument.fileName}
                            </Typography>
                            <Box sx={{ 
                              p: 1.5, 
                              backgroundColor: "#fff", 
                              borderRadius: 1, 
                              mb: 1.5,
                              border: "1px solid #c8e6c9"
                            }}>
                              <Typography variant="body2" fontWeight="bold" color="success.main" gutterBottom>
                                📅 Latest Upload:
                              </Typography>
                              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                                {new Date(studentProgress.progress.submissionDocument.uploadedAt).toLocaleString()}
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
                                    `/api/profile/progress/submission/${studentProgress.applicationId}`,
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
                                      studentProgress.progress.submissionDocument.originalFileName ||
                                        "submission.zip"
                                    );
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    // Clean up the object URL
                                    window.URL.revokeObjectURL(url);
                                  })
                                  .catch((err) => {
                                    console.error("Download error:", err);
                                    alert("Failed to download submission");
                                  });
                              }}
                              fullWidth
                            >
                              Download Latest Submission
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" sx={{ mt: 2 }}>
                        Progress tracking not started yet
                      </Typography>
                    )}
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
  if (data && data.projectsWithProgress) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          📊 Student Progress Tracking - All Projects
        </Typography>

        {data.projectsWithProgress.length > 0 ? (
          <Stack spacing={3} sx={{ mt: 3 }}>
            {data.projectsWithProgress.map((projectData) => (
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
                        navigate(`/student-progress/${projectData.project._id}`)
                      }
                    >
                      View Details
                    </Button>
                  </Box>

                  {projectData.studentsProgress && projectData.studentsProgress.length > 0 ? (
                    <Grid container spacing={2}>
                      {projectData.studentsProgress.map((student) => (
                        <Grid item xs={12} sm={6} md={4} key={student.student._id}>
                          <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {student.student.fullName}
                            </Typography>
                            <Chip
                              label={student.currentStatus}
                              size="small"
                              color={
                                student.currentStatus === "Completed"
                                  ? "success"
                                  : student.currentStatus === "In Progress"
                                  ? "primary"
                                  : "default"
                              }
                              sx={{ mt: 1 }}
                            />
                            {student.latestUpdate ? (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Latest: {new Date(student.latestUpdate.updatedAt).toLocaleDateString()}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={student.latestUpdate.percentage}
                                  sx={{ mt: 0.5 }}
                                />
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  {student.latestUpdate.update.substring(0, 50)}
                                  {student.latestUpdate.update.length > 50 ? "..." : ""}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                No progress updates yet
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

                            {/* Submission Status - Only show if completed and submission exists */}
                            {student.submissionDocument && 
                             student.latestUpdate && 
                             (student.latestUpdate.percentage === 100 || student.currentStatus === "Completed") && (
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
                                  📅 Uploaded: {new Date(student.submissionDocument.uploadedAt).toLocaleString()}
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
                                        `/api/profile/progress/submission/${student.applicationId}`,
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
                                          student.submissionDocument.originalFileName || "submission.zip"
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
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      No progress updates from students yet
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

export default StudentProgressTracking;

