import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  TextField,
  Button,
  MenuItem,
  IconButton,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

// Progress Tracking Component for Students
const ProgressTrackingSection = ({ userId }) => {
  const [progressData, setProgressData] = useState([]);
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [projectInfo, setProjectInfo] = useState({}); // { projectId: { postedBy: { roleID } } }
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [uploadingSubmission, setUploadingSubmission] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionApplicationId, setSubmissionApplicationId] = useState("");
  const [replyForms, setReplyForms] = useState({}); // { remarkId: replyText }
  const [replying, setReplying] = useState({}); // { remarkId: true/false }
  const [updateForm, setUpdateForm] = useState({
    applicationId: "",
    update: "",
    percentage: 0,
    currentStatus: "Not Started",
  });

  useEffect(() => {
    fetchProgress();
    fetchAcceptedApplications();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get("/api/profile/progress/my-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progress = res.data.progressTracking || [];
      setProgressData(progress);
      console.log("Progress data fetched:", progress);
    } catch (err) {
      console.error("Error fetching progress:", err);
      // Don't fail silently - show error to user
      if (err.response?.status !== 404) {
        console.error("Full error:", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedApplications = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get("/api/applications/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apps = res.data?.applications || res.data || [];
      // Filter for accepted project applications (exclude withdrawn - they won't be in the list anyway)
      const acceptedProjects = apps.filter(
        (app) => app.status === "Accepted" && app.opportunityType === "project"
      );
      setAcceptedApplications(acceptedProjects);
      
      // Fetch project information to check if they're Industry Official projects
      const projectInfoMap = {};
      for (const app of acceptedProjects) {
        try {
          const projectRes = await axios.get(`/api/projects/${app.opportunityId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const project = projectRes.data?.project || projectRes.data;
          if (project && project.postedBy) {
            projectInfoMap[app.opportunityId] = project;
          }
        } catch (err) {
          console.error(`Error fetching project ${app.opportunityId}:`, err);
        }
      }
      setProjectInfo(projectInfoMap);
      console.log("Accepted project applications:", acceptedProjects);
    } catch (err) {
      console.error("Error fetching accepted applications:", err);
    }
  };

  const handleUpdateProgress = async () => {
    if (!updateForm.applicationId || !updateForm.update.trim()) {
      alert("Please select a project and enter a progress update");
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "/api/profile/progress/update",
        {
          applicationId: updateForm.applicationId,
          update: updateForm.update,
          percentage: updateForm.percentage,
          currentStatus: updateForm.currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Progress updated successfully!");
      setUpdateForm({
        applicationId: "",
        update: "",
        percentage: 0,
        currentStatus: "Not Started",
      });
      fetchProgress();
      fetchAcceptedApplications();
    } catch (err) {
      console.error("Error updating progress:", err);
      alert(err.response?.data?.message || "Failed to update progress");
    }
  };

  const handleSubmissionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("File size must be less than 100MB!");
        return;
      }
      setSubmissionFile(file);
    }
  };

  const handleUploadSubmission = async () => {
    if (!submissionFile || !submissionApplicationId) {
      alert("Please select a file and project");
      return;
    }

    try {
      setUploadingSubmission(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", submissionFile);
      formData.append("applicationId", submissionApplicationId);

      await axios.post("/api/profile/progress/submission", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Submission uploaded successfully!");
      setSubmissionFile(null);
      setSubmissionApplicationId("");
      document.getElementById("submission-file-upload").value = "";
      fetchProgress();
    } catch (err) {
      console.error("Error uploading submission:", err);
      alert(err.response?.data?.message || "Failed to upload submission");
    } finally {
      setUploadingSubmission(false);
    }
  };

  // Show section if there are accepted project applications OR progress data exists
  // Always show the section if loading (so user knows something is happening)
  // or if there are accepted applications or progress data
  const shouldShow = loading || acceptedApplications.length > 0 || progressData.length > 0;

  if (!shouldShow) {
    // Even if no data, show a message so user knows the feature exists
    return (
      <Card sx={{ p: 3, mb: 5, boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📊 Project Progress Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No accepted project applications yet. Once your project application is accepted, you'll be able to track your progress here.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card sx={{ p: 3, mb: 5, boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📊 Project Progress Tracking
          </Typography>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading your progress...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Merge progress data with accepted applications to ensure all accepted projects are shown
  // Only include progress entries where application still exists and is accepted
  const allProjects = progressData
    .filter((p) => {
      // Only include if application status is Accepted (backend already filters, but double-check)
      return p.applicationId?.status === "Accepted";
    })
    .map((p) => ({
      ...p,
      progressUpdates: p.progressUpdates || [],
    }));
  
  // Add accepted applications that don't have progress tracking yet
  acceptedApplications.forEach((app) => {
    const appId = app._id?.toString();
    const exists = allProjects.some((p) => {
      const pAppId = p.applicationId?._id?.toString() || p.applicationId?.toString();
      return pAppId === appId;
    });
    
    if (!exists) {
      // Add accepted application that doesn't have progress tracking yet
      allProjects.push({
        applicationId: { _id: app._id, status: "Accepted" },
        projectId: { _id: app.opportunityId },
        projectTitle: app.opportunityTitle || "Project",
        progressUpdates: [],
        currentStatus: "Not Started",
        createdAt: app.appliedAt ? new Date(app.appliedAt) : new Date(),
      });
    }
  });

  return (
    <Card sx={{ p: 3, mb: 5, boxShadow: 6, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📊 Project Progress Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your progress for accepted project applications
        </Typography>

        {/* Update Progress Form */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            Add Progress Update
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={updateForm.applicationId}
                label="Select Project"
                onChange={(e) => {
                  const selected = allProjects.find(
                    (p) => {
                      const appId = p.applicationId?._id || p.applicationId;
                      return appId?.toString() === e.target.value;
                    }
                  );
                  
                  // Safely get the latest percentage
                  let latestPercentage = 0;
                  if (selected && selected.progressUpdates && Array.isArray(selected.progressUpdates) && selected.progressUpdates.length > 0) {
                    const lastUpdate = selected.progressUpdates[selected.progressUpdates.length - 1];
                    latestPercentage = lastUpdate?.percentage || 0;
                  }
                  
                  setUpdateForm({
                    ...updateForm,
                    applicationId: e.target.value,
                    percentage: latestPercentage,
                    currentStatus: selected?.currentStatus || "Not Started",
                  });
                }}
              >
                {allProjects
                  .filter((progress) => {
                    // Only show projects where application is still accepted (not withdrawn)
                    return progress.applicationId?.status === "Accepted";
                  })
                  .map((progress) => {
                    const appId = progress.applicationId?._id || progress.applicationId;
                    const appIdString = appId?.toString();
                    return (
                      <MenuItem key={appIdString || progress.projectTitle} value={appIdString}>
                        {progress.projectTitle || "Project"}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Progress Update"
              value={updateForm.update}
              onChange={(e) => setUpdateForm({ ...updateForm, update: e.target.value })}
              placeholder="Describe what you've accomplished..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Progress Percentage"
                  value={updateForm.percentage}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                  inputProps={{ min: 0, max: 100 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={updateForm.percentage}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Current Status</InputLabel>
                  <Select
                    value={updateForm.currentStatus}
                    label="Current Status"
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, currentStatus: e.target.value })
                    }
                  >
                    <MenuItem value="Not Started">Not Started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleUpdateProgress}
              disabled={!updateForm.applicationId || !updateForm.update.trim()}
            >
              Add Progress Update
            </Button>
          </Stack>
        </Paper>

        {/* Submission Upload Section (for 100% progress OR Industry Official projects) */}
        {(() => {
          // Check if there are any projects eligible for submission
          const hasCompletedProjects = allProjects.some((p) => {
            if (p.applicationId?.status !== "Accepted") return false;
            const latestUpdate = p.progressUpdates && p.progressUpdates.length > 0
              ? p.progressUpdates[p.progressUpdates.length - 1]
              : null;
            return latestUpdate?.percentage === 100 || p.currentStatus === "Completed";
          });
          
          const hasIndustryProjects = allProjects.some((p) => {
            if (p.applicationId?.status !== "Accepted") return false;
            const project = projectInfo[p.projectId?._id || p.projectId];
            const isIndustryOfficial = project?.postedBy && 
              (project.postedBy.roleID === "Industry Official" || project.postedBy.role === "industry official");
            return isIndustryOfficial;
          });
          
          return hasCompletedProjects || hasIndustryProjects;
        })() && (
          <>
            <Divider sx={{ my: 3 }} />
            <Paper sx={{ p: 2, mb: 3, backgroundColor: "#e3f2fd" }}>
              <Typography variant="h6" gutterBottom>
                📎 Upload Project Submission
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your project files (ZIP, RAR, PDF, DOC, DOCX - Max 100MB)
                <br />
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Project</InputLabel>
                  <Select
                    value={submissionApplicationId}
                    label="Select Project"
                    onChange={(e) => setSubmissionApplicationId(e.target.value)}
                  >
                    {allProjects
                      .filter((p) => {
                        // Only show projects that are still accepted (not withdrawn)
                        if (p.applicationId?.status !== "Accepted") return false;
                        
                        // Check if it's an Industry Official project
                        const project = projectInfo[p.projectId?._id || p.projectId];
                        const isIndustryOfficial = project?.postedBy && 
                          (project.postedBy.roleID === "Industry Official" || project.postedBy.role === "industry official");
                        
                        if (isIndustryOfficial) {
                          // Industry Official projects can always upload submissions
                          return true;
                        }
                        
                        // For Academia projects, require 100% progress
                        const latestUpdate = p.progressUpdates && p.progressUpdates.length > 0
                          ? p.progressUpdates[p.progressUpdates.length - 1]
                          : null;
                        return latestUpdate?.percentage === 100 || p.currentStatus === "Completed";
                      })
                      .map((progress) => {
                        const appId = progress.applicationId?._id || progress.applicationId;
                        const appIdString = appId?.toString();
                        const project = projectInfo[progress.projectId?._id || progress.projectId];
                        const isIndustryOfficial = project?.postedBy && 
                          (project.postedBy.roleID === "Industry Official" || project.postedBy.role === "industry official");
                        return (
                          <MenuItem key={appIdString} value={appIdString}>
                            {progress.projectTitle} 
                            {isIndustryOfficial && " (Industry Official)"}
                            {progress.submissionDocument && " ✓ Submitted"}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
                <Box>
                  <input
                    accept=".zip,.rar,.7z,.pdf,.doc,.docx"
                    style={{ display: "none" }}
                    id="submission-file-upload"
                    type="file"
                    onChange={handleSubmissionFileChange}
                  />
                  <label htmlFor="submission-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadFileIcon />}
                      fullWidth
                    >
                      {submissionFile ? submissionFile.name : "Choose Submission File (ZIP, RAR, PDF, DOC, DOCX)"}
                    </Button>
                  </label>
                </Box>
                {uploadingSubmission && <LinearProgress />}
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleUploadSubmission}
                  disabled={!submissionFile || !submissionApplicationId || uploadingSubmission}
                  startIcon={<CheckCircleIcon />}
                >
                  {uploadingSubmission ? "Uploading..." : "Upload Submission"}
                </Button>
              </Stack>
            </Paper>
          </>
        )}

        {/* Progress History */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Progress History
        </Typography>
        <Stack spacing={2}>
          {allProjects
            .filter((progress) => {
              // Only show projects where application is still accepted (not withdrawn)
              return progress.applicationId?.status === "Accepted";
            })
            .map((progress) => {
            const appId = progress.applicationId?._id || progress.applicationId;
            const appIdString = appId?.toString() || `project-${progress.projectTitle}`;
            const progressUpdates = progress.progressUpdates || [];
            
            return (
              <Accordion key={appIdString}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">{progress.projectTitle || "Project"}</Typography>
                    <Chip
                      label={progress.currentStatus || "Not Started"}
                      color={
                        progress.currentStatus === "Completed"
                          ? "success"
                          : progress.currentStatus === "In Progress"
                          ? "primary"
                          : "default"
                      }
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {progressUpdates.length > 0 ? (
                      progressUpdates.map((update, idx) => {
                        const updatePercentage = update?.percentage || 0;
                        return (
                          <Paper key={idx} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {update.updatedAt ? new Date(update.updatedAt).toLocaleString() : "No date"}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {updatePercentage}% Complete
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={updatePercentage} sx={{ mb: 1 }} />
                            <Typography>{update.update || "No description"}</Typography>
                          </Paper>
                        );
                      })
                    ) : (
                      <Typography color="text.secondary">No progress updates yet. Start by adding your first update above!</Typography>
                    )}
                    
                    {/* Show submission status if exists */}
                    {progress.submissionDocument && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: "#e8f5e9", borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          ✓ Submission Uploaded
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          File: {progress.submissionDocument.originalFileName || progress.submissionDocument.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(progress.submissionDocument.uploadedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {/* Show Remarks from Academia */}
                    {progress.remarks && progress.remarks.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          💬 Remarks from Academia
                        </Typography>
                        <Stack spacing={2}>
                          {progress.remarks
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

                                  {/* Replies Section */}
                                  {remark.replies && remark.replies.length > 0 && (
                                    <Box sx={{ ml: 2, mb: 2, pl: 2, borderLeft: "2px solid #ffd54f" }}>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                                        Your Replies:
                                      </Typography>
                                      <Stack spacing={1}>
                                        {remark.replies.map((reply, replyIdx) => (
                                          <Paper key={replyIdx} sx={{ p: 1.5, backgroundColor: "#f5f5f5" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                              <Typography variant="caption" fontWeight="bold">
                                                You
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

                                  {/* Reply Form */}
                                  <Box sx={{ mt: 1 }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={2}
                                      size="small"
                                      label="Reply to this remark"
                                      value={replyForms[remarkId] || ""}
                                      onChange={(e) => {
                                        setReplyForms({
                                          ...replyForms,
                                          [remarkId]: e.target.value,
                                        });
                                      }}
                                      placeholder="Type your reply..."
                                      sx={{ mb: 1 }}
                                    />
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<SendIcon />}
                                      onClick={async () => {
                                        const replyText = replyForms[remarkId];
                                        if (!replyText || !replyText.trim()) {
                                          alert("Please enter a reply");
                                          return;
                                        }
                                        try {
                                          setReplying({
                                            ...replying,
                                            [remarkId]: true,
                                          });
                                          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                                          await axios.post(
                                            "/api/profile/progress/remark/reply",
                                            {
                                              applicationId: appIdString,
                                              remarkId: remark._id,
                                              reply: replyText,
                                            },
                                            {
                                              headers: { Authorization: `Bearer ${token}` },
                                            }
                                          );
                                          alert("Reply sent successfully!");
                                          setReplyForms({
                                            ...replyForms,
                                            [remarkId]: "",
                                          });
                                          fetchProgress();
                                        } catch (err) {
                                          console.error("Error replying to remark:", err);
                                          alert(err.response?.data?.message || "Failed to send reply");
                                        } finally {
                                          setReplying({
                                            ...replying,
                                            [remarkId]: false,
                                          });
                                        }
                                      }}
                                      disabled={replying[remarkId] || !replyForms[remarkId]?.trim()}
                                    >
                                      {replying[remarkId] ? "Sending..." : "Send Reply"}
                                    </Button>
                                  </Box>
                                </Paper>
                              );
                            })}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

const UserProfile = () => {
  const { id } = useParams(); // User ID from route
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [form, setForm] = useState({
    email: "",
    gender: "",
    city: "",
    province: "",
    cellPhone: "",
    postalAddress: "",
    currentOrganization: "",
    professionalSummary: "",
    areaOfExpertise: "",
    skills: "",
    degree: "",
    institute: "",
    country: "",
    cgpa: "",
    yearOfCompletion: "",
    birthMonth: "",
    birthYear: "",
  });

  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch profile info
        const profileRes = await axios.get(`/api/users/profile/${id}`, { headers });
        setProfile(profileRes.data);

        // Fetch professional history
        const historyRes = await axios.get(`/api/professional-history/user/${id}`, { headers });
        setHistory(historyRes.data || []);

        // Fetch documents
        try {
          const docsRes = await axios.get(`/api/profile/documents/${id}`, { headers });
          setDocuments(docsRes.data.documents || []);
        } catch (docErr) {
          console.error("Error fetching documents:", docErr);
          setDocuments([]);
        }
      } catch (err) {
        console.error("Error fetching profile or history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, [id]);

  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  // Check if user is owner - handle both id and _id, and ensure string comparison
  const isOwner = loggedInUser && (String(loggedInUser.id || loggedInUser._id) === String(id));
  // Check if user is a student (case-insensitive)
  const isStudent = loggedInUser && (
    loggedInUser.roleID === "Student" || 
    loggedInUser.roleID === "student" ||
    loggedInUser.role === "student" ||
    loggedInUser.role === "Student"
  );

  const startEditing = () => {
    const details = profile?.profile || {};
    setForm({
      email: profile?.email || "",
      gender: details.gender || "",
      city: details.city || "",
      province: details.province || "",
      cellPhone: details.cellPhone || "",
      postalAddress: details.postalAddress || "",
      currentOrganization: details.currentOrganization || "",
      professionalSummary: details.professionalSummary || "",
      areaOfExpertise: details.areaOfExpertise || "",
      skills: Array.isArray(details.skills) ? details.skills.join(", ") : "",
      degree: details.academicQualification?.degree || "",
      institute: details.academicQualification?.institute || "",
      country: details.academicQualification?.country || "",
      cgpa: details.academicQualification?.cgpa || "",
      yearOfCompletion: details.academicQualification?.yearOfCompletion || "",
      birthMonth: details.dateOfBirth?.month || "",
      birthYear: details.dateOfBirth?.year || "",
    });
    setEditMode(true);
  };

  const cancelEditing = () => setEditMode(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitUpdate = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        email: form.email,
        gender: form.gender,
        dateOfBirth: { month: form.birthMonth, year: form.birthYear },
        postalAddress: form.postalAddress,
        city: form.city,
        province: form.province,
        cellPhone: form.cellPhone,
        currentOrganization: form.currentOrganization,
        professionalSummary: form.professionalSummary,
        areaOfExpertise: form.areaOfExpertise,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        academicQualification: {
          degree: form.degree,
          institute: form.institute,
          country: form.country,
          cgpa: form.cgpa,
          yearOfCompletion: form.yearOfCompletion,
        },
      };

      await axios.post(
        "/api/profile",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh view data
      const headers = { Authorization: `Bearer ${token}` };
      const profileRes = await axios.get(`/api/users/profile/${id}`, { headers });
      setProfile(profileRes.data);
      setEditMode(false);
    } catch (e) {
      console.error("Failed to update profile", e);
      alert(e.response?.data?.message || "Failed to update profile");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF, DOC, and DOCX files are allowed!");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB!");
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !documentName.trim()) {
      alert("Please select a file and enter a document name");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("documentName", documentName);

      await axios.post("/api/profile/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh documents
      const headers = { Authorization: `Bearer ${token}` };
      const docsRes = await axios.get(`/api/profile/documents/${id}`, { headers });
      setDocuments(docsRes.data.documents || []);

      // Reset form
      setUploadFile(null);
      setDocumentName("");
      document.getElementById("file-upload").value = "";
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`/api/profile/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh documents
      const headers = { Authorization: `Bearer ${token}` };
      const docsRes = await axios.get(`/api/profile/documents/${id}`, { headers });
      setDocuments(docsRes.data.documents || []);
      alert("Document deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete document");
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    // Construct the full URL - backend serves uploads at /uploads
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const fullUrl = `${baseURL}${fileUrl}`;
    window.open(fullUrl, "_blank");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );

  if (!profile)
    return (
      <Typography textAlign="center" mt={5} variant="h6">
        Profile not found
      </Typography>
    );

  const { fullName, email, roleID, institute, profile: details } = profile;

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Box sx={{ width: "70%" }}>
        {/* Profile Info */}
        <Card sx={{ p: 3, mb: 5, boxShadow: 6, borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
              <Box>
              <Typography variant="h4" fontWeight="bold">{fullName}</Typography>
              <Typography color="text.secondary">{email}</Typography>
              <Typography color="text.secondary">{roleID} — {institute}</Typography>
              </Box>
              {isOwner && !editMode && (
                <Button variant="contained" onClick={startEditing}>Edit</Button>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>Profile Information</Typography>
            {!editMode ? (
              details ? (
                <Stack spacing={1}>
                  <Typography><strong>Gender:</strong> {details.gender || "N/A"}</Typography>
                  <Typography><strong>City:</strong> {details.city || "N/A"}</Typography>
                  <Typography><strong>Province:</strong> {details.province || "N/A"}</Typography>
                  <Typography><strong>Phone:</strong> {details.cellPhone || "N/A"}</Typography>
                  <Typography><strong>Organization:</strong> {details.currentOrganization || "N/A"}</Typography>
                  <Typography><strong>Summary:</strong> {details.professionalSummary || "N/A"}</Typography>
                  <Typography><strong>Area of Expertise:</strong> {details.areaOfExpertise || "N/A"}</Typography>

                  {details.skills?.length > 0 && (
                    <Box mt={1}>
                      <Typography fontWeight="bold">Skills:</Typography>
                      <Stack direction="row" flexWrap="wrap" spacing={1} mt={0.5}>
                        {details.skills.map((skill, idx) => (
                          <Chip key={idx} label={skill} color="primary" variant="outlined" sx={{ mb: 1 }} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {details.academicQualification && (
                    <Box mt={3} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>Academic Qualification</Typography>
                      <Typography><strong>Degree:</strong> {details.academicQualification.degree}</Typography>
                      <Typography><strong>Institute:</strong> {details.academicQualification.institute}</Typography>
                      <Typography><strong>Country:</strong> {details.academicQualification.country || "N/A"}</Typography>
                      <Typography><strong>CGPA:</strong> {details.academicQualification.cgpa}</Typography>
                      <Typography><strong>Year of Completion:</strong> {details.academicQualification.yearOfCompletion}</Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography>No detailed profile information available.</Typography>
              )
            ) : (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Email" 
                      type="email"
                      value={form.email} 
                      onChange={handleChange("email")}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Gender" value={form.gender} onChange={handleChange("gender")} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Birth Month" value={form.birthMonth} onChange={handleChange("birthMonth")} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Birth Year" value={form.birthYear} onChange={handleChange("birthYear")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Postal Address" value={form.postalAddress} onChange={handleChange("postalAddress")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="City" value={form.city} onChange={handleChange("city")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Province" value={form.province} onChange={handleChange("province")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" value={form.cellPhone} onChange={handleChange("cellPhone")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Organization" value={form.currentOrganization} onChange={handleChange("currentOrganization")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={3} label="Professional Summary" value={form.professionalSummary} onChange={handleChange("professionalSummary")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Area of Expertise" value={form.areaOfExpertise} onChange={handleChange("areaOfExpertise")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Skills (comma separated)" value={form.skills} onChange={handleChange("skills")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Degree" value={form.degree} onChange={handleChange("degree")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Institute" value={form.institute} onChange={handleChange("institute")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Country" value={form.country} onChange={handleChange("country")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="CGPA" value={form.cgpa} onChange={handleChange("cgpa")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Year of Completion" value={form.yearOfCompletion} onChange={handleChange("yearOfCompletion")} />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={submitUpdate}>Save</Button>
                  <Button variant="text" onClick={cancelEditing}>Cancel</Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Professional History */}
        <Box mb={5}>
          <Typography variant="h5" fontWeight="bold" mb={2}>Professional History</Typography>
          {history.length > 0 ? (
            <Grid container spacing={2}>
              {history.map((item, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{item.designation}</Typography>
                      <Typography color="text.secondary">{item.organization}</Typography>
                      <Typography color="text.secondary">
                        {new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : "Present"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No professional history available.</Typography>
          )}
        </Box>

        {/* Progress Tracking Section (for Students with Accepted Project Applications) */}
        {isOwner && isStudent && (
          <ProgressTrackingSection userId={id} />
        )}

        {/* Documents Section */}
        <Card sx={{ p: 3, boxShadow: 6, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">Documents</Typography>
            </Stack>

            {/* Upload Section (only for owner) */}
            {isOwner && (
              <Box mb={4} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Upload Document</Typography>
                <Stack spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Document Type"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    SelectProps={{
                      native: false,
                    }}
                  >
                    <MenuItem value="CV">CV / Resume</MenuItem>
                    <MenuItem value="Transcript">Transcript</MenuItem>
                    <MenuItem value="Certificate">Certificate</MenuItem>
                    <MenuItem value="Cover Letter">Cover Letter</MenuItem>
                    <MenuItem value="Portfolio">Portfolio</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                  <Box>
                    <input
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadFileIcon />}
                        fullWidth
                      >
                        {uploadFile ? uploadFile.name : "Choose File (PDF, DOC, DOCX)"}
                      </Button>
                    </label>
                  </Box>
                  {uploading && <LinearProgress />}
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!uploadFile || !documentName || uploading}
                    fullWidth
                  >
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Documents List */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>Uploaded Documents</Typography>
            {documents.length > 0 ? (
              <Grid container spacing={2} mt={1}>
                {documents.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc._id}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 120,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {doc.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {doc.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                          fullWidth
                        >
                          Download
                        </Button>
                        {isOwner && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" mt={2}>
                No documents uploaded yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserProfile;
