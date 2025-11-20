import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

const ApplicantsPage = () => {
  const { type, id } = useParams(); // type = job/project/internship
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`/api/applications/${type}/${id}/applicants`, {
  headers,
});

        setApplicants(res.data || []);
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [type, id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `/api/applications/status/${appId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplicants((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, status: res.data.application.status } : a
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Applicants for {type.charAt(0).toUpperCase() + type.slice(1)}
      </Typography>

      {applicants.length === 0 ? (
        <Typography>No one has applied yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {applicants.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{app.userId.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.userId.email}
                  </Typography>

                  {app.note && (
                    <Typography variant="body2" mt={1}>
                      Note: {app.note}
                    </Typography>
                  )}

                  {app.resumeUrl && (
                    <Typography variant="body2" mt={1}>
                      Resume:{" "}
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </Typography>
                  )}

                  {/* Job-specific */}
                  {app.positionAppliedFor && (
                    <Chip
                      label={`Position: ${app.positionAppliedFor}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.expectedSalary && (
                    <Chip
                      label={`Expected Salary: ${app.expectedSalary}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.experienceLevel && (
                    <Chip
                      label={`Experience: ${app.experienceLevel}`}
                      sx={{ mt: 1 }}
                    />
                  )}

                  {/* Internship-specific */}
                  {app.educationLevel && (
                    <Chip
                      label={`Education: ${app.educationLevel}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.university && (
                    <Chip
                      label={`University: ${app.university}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.graduationDate && (
                    <Chip
                      label={`Graduation: ${new Date(
                        app.graduationDate
                      ).toLocaleDateString()}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.internshipDuration && (
                    <Chip
                      label={`Duration: ${app.internshipDuration}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.learningObjectives && (
                    <Typography variant="body2" mt={1}>
                      Learning Objectives: {app.learningObjectives}
                    </Typography>
                  )}

                  {/* Project-specific */}
                  {app.projectTitle && (
                    <Chip
                      label={`Project Title: ${app.projectTitle}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.projectType && (
                    <Chip
                      label={`Project Type: ${app.projectType}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.areaOfInterest && (
                    <Chip
                      label={`Area of Interest: ${app.areaOfInterest}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {app.proposedContribution && (
                    <Typography variant="body2" mt={1}>
                      Contribution: {app.proposedContribution}
                    </Typography>
                  )}
                  {app.motivation && (
                    <Typography variant="body2" mt={1}>
                      Motivation: {app.motivation}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, width: "100%" }}
                    onClick={() => navigate(`/profile/${app.userId._id}`)}
                  >
                    View Profile
                  </Button>

                  {/* Status dropdown */}
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={app.status || "Pending"}
                      label="Status"
                      onChange={(e) =>
                        handleStatusChange(app._id, e.target.value)
                      }
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Reviewed">Reviewed</MenuItem>
                      <MenuItem value="Accepted">Accepted</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ApplicantsPage;
