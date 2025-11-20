import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Work,
  LocationOn,
  AccessTime,
  School,
  CheckCircle,
  CalendarToday,
  MonetizationOn,
  Description,
  Send,
  Download,
} from "@mui/icons-material";

const JobDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();

  const initialJob = state ? state.job ?? state : null;
  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(!initialJob);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!job && id) {
      const fetchJob = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
          setJob(res.data.job ?? res.data);
        } catch (err) {
          console.error("❌ Error fetching job:", err);
          setError("Failed to load job details.");
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, job]);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading job details...</Typography>
      </Box>
    );

  if (error) return <Typography color="error">{error}</Typography>;
  if (!job) return <Typography>No job data found.</Typography>;

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

  // ✅ Corrected document URL helper
  const getDocumentURL = (doc) => {
    if (!doc) return "#";
    const filename = doc.split(/\\|\//).pop(); // just get the filename
    return `http://localhost:5000/uploads/${filename}`;
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            {job.jobTitle ?? "Untitled Job"}
          </Typography>

          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 500, mb: 2 }}
          >
            {job.organization ?? "Organization not specified"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              icon={<Work />}
              label={job.jobType ?? "Not specified"}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<AccessTime />}
              label={job.experienceLevel ?? "Not specified"}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<LocationOn />}
              label={job.workLocation ?? "Not specified"}
              variant="outlined"
              size="small"
            />
          </Box>

          <Typography
            variant="body1"
            sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
          >
            {job.jobDescription ?? "No description provided."}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Left column */}
          <Grid item xs={12} md={8}>
            {/* Skills */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <CheckCircle sx={{ mr: 1, color: "primary.main" }} />
                Required Skills
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {job.requiredSkills?.length ? (
                  job.requiredSkills.map((skill, i) => (
                    <Chip
                      key={i}
                      label={skill}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">Not specified</Typography>
                )}
              </Stack>

              {/* Education */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Education Requirements
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {job.educationRequirements?.length ? (
                  job.educationRequirements.map((edu, i) => (
                    <Chip
                      key={i}
                      label={edu}
                      icon={<School />}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">Not specified</Typography>
                )}
              </Stack>

              {/* Keywords */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Keywords
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {job.keywords?.length ? (
                  job.keywords.map((k, i) => (
                    <Chip
                      key={i}
                      label={k}
                      variant="outlined"
                      color="secondary"
                      sx={{ mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">No keywords</Typography>
                )}
              </Stack>
            </Box>

            {/* Supporting Documents */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <Description sx={{ mr: 1, color: "primary.main" }} />
                Supporting Documents
              </Typography>
              {job.supportingDocuments && job.supportingDocuments.length > 0 ? (
                <List dense>
                  {job.supportingDocuments.map((doc, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                      <Link
                        href={getDocumentURL(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        📄 {doc.split(/\\|\//).pop()}
                      </Link>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ ml: 2 }}
                        startIcon={<Download />}
                        href={getDocumentURL(doc)}
                        download
                      >
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No supporting documents uploaded.
                </Typography>
              )}
            </Box>

            {/* Timeline */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <CalendarToday sx={{ mr: 1, color: "primary.main" }} />
                Important Dates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expected Start Date
                  </Typography>
                  <Typography>{formatDate(job.expectedStartDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Application Deadline
                  </Typography>
                  <Typography color="error.main" fontWeight="500">
                    {formatDate(job.applicationDeadline)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "#f9f9f9" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Job Highlights
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <MonetizationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Salary Range"
                    secondary={
                      job.minSalary && job.maxSalary
                        ? `$${job.minSalary} - $${job.maxSalary}`
                        : "Not specified"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experience Level"
                    secondary={job.experienceLevel ?? "Not specified"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Work color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Job Type"
                    secondary={job.jobType ?? "Not specified"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Work Location"
                    secondary={job.workLocation ?? "Not specified"}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Benefits */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Employee Benefits
              </Typography>
              {job.employeeBenefits?.length ? (
                <List dense>
                  {job.employeeBenefits.map((b, i) => (
                    <ListItem key={i}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={b} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No benefits specified
                </Typography>
              )}
            </Box>

            {/* Buttons */}
            {localStorage.getItem("role") === "Student" &&
              (new Date(job.applicationDeadline) > new Date() ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<Send />}
                  onClick={() => navigate(`/apply/job/${job._id}`)}
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
              ))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default JobDetails;
