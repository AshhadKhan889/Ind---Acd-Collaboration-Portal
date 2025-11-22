import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Button,
  Stack,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material";
import {
  Science,
  LocationOn,
  Groups,
  AttachMoney,
  Event,
  CheckCircle,
  Public,
  Code,
  Assignment,
  Send,
  Description,
  Download,
} from "@mui/icons-material";

const ProjectDetails = () => {
  const location = useLocation();
  const { state } = location;
  const { id } = useParams();
  const navigate = useNavigate();

  const initialProject = state ? state.project ?? state : null;

  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(!initialProject);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!project && id) {
      const fetchProject = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/projects/${id}`,
            token ? { headers: { Authorization: `Bearer ${token}` } } : {}
          );
          const fetchedProject = res.data?.project ?? res.data;
          if (!fetchedProject) throw new Error("Project not found in response");
          setProject(fetchedProject);
        } catch (err) {
          console.error("❌ Error fetching project:", err);
          setError("Failed to load project details.");
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, project]);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography>Loading project details...</Typography>
      </Box>
    );

  if (error) return <Typography color="error">{error}</Typography>;
  if (!project) return <Typography>No project data found.</Typography>;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(dateString);
    }
  };

  const currency = project.budget?.currency ?? project.budgetCurrency ?? "PKR";
  const currencySymbol = "Rs";

  // 🔗 Helper to form accessible file URLs
  const getFileUrl = (filePath) =>
    filePath.startsWith("http")
      ? filePath
      : `http://localhost:5000/uploads/${filePath.split("\\").pop()}`;

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            {project.projectTitle ?? project.title ?? "Untitled Project"}
          </Typography>

          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 500, mb: 2 }}
          >
            {project.organization ?? "Organization not specified"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              icon={<Science />}
              label={project.projectType ?? project.type ?? "—"}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<LocationOn />}
              label={
                project.collaborationPreferences?.remoteAllowed ?? project.isRemote
                  ? "Remote"
                  : "On-site"
              }
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<Groups />}
              label={`Team: ${project.teamSize ?? "—"}`}
              variant="outlined"
              size="small"
            />
          </Box>

          <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
            {project.projectDescription ?? project.description ?? "No description."}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Left column */}
          <Grid item xs={12} md={8}>
            {/* Skills & Domain */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Groups sx={{ mr: 1, color: "primary.main" }} />
                Ideal Collaborators
              </Typography>
              <Typography paragraph>{project.targetCollaborators ?? "Not specified"}</Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Required Skills
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {project.requiredSkills?.length ? (
                  project.requiredSkills.map((skill, i) => (
                    <Chip key={i} label={skill} color="primary" sx={{ mb: 1 }} />
                  ))
                ) : (
                  <Typography color="text.secondary">Not specified</Typography>
                )}
              </Stack>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Project Domain
              </Typography>
              <Chip
                label={project.projectDomain ?? project.domain ?? "Not specified"}
                icon={<Code />}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Box>

            {/* Supporting Documents */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Description sx={{ mr: 1, color: "primary.main" }} />
                Supporting Documents
              </Typography>
              {project.supportingDocuments?.length ? (
                <List dense>
                  {project.supportingDocuments.map((doc, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                      <Link
                        href={getFileUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📄 {doc.split("/").pop()}
                      </Link>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ ml: 2 }}
                        startIcon={<Download />}
                        href={getFileUrl(doc)}
                        download
                      >
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No supporting documents uploaded.</Typography>
              )}
            </Box>

            {/* Timeline */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Event sx={{ mr: 1, color: "primary.main" }} />
                Project Timeline
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography>
                    {formatDate(project.timeline?.startDate ?? project.start_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography>
                    {formatDate(project.timeline?.endDate ?? project.end_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Application Deadline
                  </Typography>
                  <Typography color="error.main" fontWeight="500">
                    {formatDate(
                      project.timeline?.applicationDeadline ??
                        project.application_deadline
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "#f9f9f9" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Project Highlights
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Budget"
                    secondary={
                      project.budget?.amount
                        ? `${currencySymbol} ${project.budget.amount.toLocaleString()} PKR`
                        : "Not specified"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Groups color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Team Size"
                    secondary={project.teamSize ?? "Not specified"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Public color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={
                      project.collaborationPreferences?.remoteAllowed ?? project.isRemote
                        ? "Remote"
                        : "On-site"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="NDA Required"
                    secondary={
                      project.collaborationPreferences?.requiresNDA ?? project.requiresNDA
                        ? "Yes"
                        : "No"
                    }
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Collaboration */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Collaboration Open To
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      project.collaborationPreferences?.openForStudents ??
                      project.openForStudents
                        ? "Students"
                        : "Not open to students"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      project.collaborationPreferences?.openForProfessionals ??
                      project.openForProfessionals
                        ? "Professionals"
                        : "Not open to professionals"
                    }
                  />
                </ListItem>
              </List>
            </Box>

            {/* Apply Button */}
            {localStorage.getItem("role") === "Student" &&
              (() => {
                const deadline =
                  project.timeline?.applicationDeadline ||
                  project.applicationDeadline ||
                  project.application_deadline;
                const isDeadlinePassed =
                  deadline && new Date(deadline) < new Date();

                return !isDeadlinePassed ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<Send />}
                    onClick={() => navigate(`/apply/project/${project._id}`)}
                  >
                    Apply Now
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    fullWidth
                    disabled
                  >
                    Deadline Passed
                  </Button>
                );
              })()}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProjectDetails;
