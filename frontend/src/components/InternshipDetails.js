import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Button,
  Stack,
  Paper,
  Grid,
  Link,
  List,
  ListItem,
} from "@mui/material";
import {
  Work,
  LocationOn,
  Schedule,
  School,
  AttachMoney,
  Groups,
  Event,
  CheckCircle,
  Send,
  Description,
  Download,
} from "@mui/icons-material";
import axios from "axios";

const InternshipDetails = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/internships/${id}`
        );
        const data = res.data?.internship ?? res.data;
        setInternship(data);
      } catch (err) {
        console.error("Error fetching internship:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInternship();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http")) return filePath;

    const fileName = filePath.includes("uploads/")
      ? filePath.split("uploads/").pop()
      : filePath.split("\\").pop();

    return `http://localhost:5000/uploads/${fileName}`;
  };

  if (loading) return <Typography>Loading internship details...</Typography>;
  if (!internship) return <Typography>No internship data found.</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 500, mb: 2 }}
          >
            {internship.organization ?? "Organization not specified"}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            {internship.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              icon={<Work />}
              label={internship.internshipType}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<LocationOn />}
              label={`${internship.workLocation} (${
                internship.officeLocation || "N/A"
              })`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<Schedule />}
              label={`Posted on ${formatDate(internship.createdAt)}`}
              variant="outlined"
              size="small"
            />
          </Box>

          <Typography
            variant="body1"
            sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
          >
            {internship.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Target Candidates */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <Groups sx={{ mr: 1, color: "primary.main" }} />
                Target Candidates
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", mb: 2 }}
              >
                {internship.targetMajors?.map((major, i) => (
                  <Chip
                    key={i}
                    label={major}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>

              {/* Skills */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Required Skills
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {internship.requiredSkills?.map((skill, i) => (
                  <Chip key={i} label={skill} color="primary" sx={{ mb: 1 }} />
                ))}
              </Stack>

              {/* Education */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Education
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {internship.educationRequirements?.map((edu, i) => (
                  <Chip
                    key={i}
                    label={edu}
                    icon={<School />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
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
              {internship.supportingDocuments?.length ? (
                <List dense>
                  {internship.supportingDocuments.map((doc, i) => (
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
                <Event sx={{ mr: 1, color: "primary.main" }} />
                Internship Timeline
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography>{formatDate(internship.startDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography>{formatDate(internship.endDate)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Application Deadline
                  </Typography>
                  <Typography color="error.main" fontWeight="500">
                    {formatDate(internship.applicationDeadline)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "#f9f9f9" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Internship Highlights
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Stipend Range
                </Typography>
                <Typography display="flex" alignItems="center">
                  <AttachMoney color="primary" sx={{ mr: 0.5 }} />
                  Rs {internship.stipend?.min || 0} - Rs{" "}
                  {internship.stipend?.max || 0} PKR per month
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Work Location
                </Typography>
                <Typography display="flex" alignItems="center">
                  <LocationOn
                    color="primary"
                    sx={{ mr: 1, fontSize: "1rem" }}
                  />
                  {internship.officeLocation || "Not specified"} (
                  {internship.workLocation})
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Internship Benefits
              </Typography>
              <Stack spacing={1}>
                {internship.benefits?.map((benefit, i) => (
                  <Box key={i} display="flex" alignItems="center">
                    <CheckCircle
                      color="primary"
                      sx={{ mr: 1, fontSize: "1rem" }}
                    />
                    <Typography>{benefit}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Apply Button */}
            {localStorage.getItem("role") === "Student" &&
              (() => {
                const deadline =
                  internship.applicationDeadline || internship.deadline;
                const isDeadlinePassed =
                  deadline && new Date(deadline) < new Date();

                return !isDeadlinePassed ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<Send />}
                    onClick={() =>
                      navigate(`/apply/internship/${internship._id}`)
                    }
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

export default InternshipDetails;
