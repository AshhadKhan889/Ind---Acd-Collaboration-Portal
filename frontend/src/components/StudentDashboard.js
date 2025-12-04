import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentDashboard = () => {
  const [data, setData] = useState({
    myApplications: [],
    upcomingDeadlines: { jobs: [], projects: [], internships: [] },
    recommended: [],
  });
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch main dashboard
        const resDashboard = await axios.get(
          "http://localhost:5000/api/student/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resDashboard.data) {
          setData((prev) => ({
            ...prev,
            myApplications: resDashboard.data.myApplications || [],
            upcomingDeadlines: resDashboard.data.upcomingDeadlines || {
              jobs: [],
              projects: [],
              internships: [],
            },
          }));
        }

        // Fetch recommended opportunities
        const resRecommended = await axios.get(
          "http://localhost:5000/api/recommendations/my-recommendations",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setData((prev) => ({
          ...prev,
          recommended: resRecommended.data || [],
        }));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleNotInterested = async (recId) => {
    try {
      const token = localStorage.getItem("token");

      // Optional: API call to mark as not interested
      await axios.post(
        "http://localhost:5000/api/recommendations/not-interested",
        { recommendationId: recId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from local state
      setData((prev) => ({
        ...prev,
        recommended: prev.recommended.filter((r) => r._id !== recId),
      }));
    } catch (err) {
      console.error("Error marking recommendation as not interested:", err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🎓 Student Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* My Applications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📌 My Applications
              </Typography>
              <List>
                {data.myApplications.length > 0 ? (
                  data.myApplications.map((app) => (
                    <ListItem 
                      key={app._id}
                      secondaryAction={
                        app.status === "Accepted" && app.opportunityType === "project" ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              const userId = localStorage.getItem("user") || sessionStorage.getItem("user");
                              const user = userId ? JSON.parse(userId) : null;
                              navigate(`/profile/${user?.id || user?._id || "me"}`);
                            }}
                          >
                            Update Progress
                          </Button>
                        ) : null
                      }
                    >
                      <ListItemText
                        primary={`${app.opportunityType.toUpperCase()} - ${
                          app.opportunityTitle || "No title"
                        }`}
                        secondary={`Status: ${app.status} • Applied: ${new Date(
                          app.appliedAt
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No applications yet
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⏳ Upcoming Deadlines
              </Typography>

              {/* Jobs */}
              <Typography variant="subtitle1">Jobs</Typography>
              <List>
                {data.upcomingDeadlines.jobs.length > 0 ? (
                  data.upcomingDeadlines.jobs.map((job) => (
                    <ListItem key={job._id}>
                      <ListItemText
                        primary={job.jobTitle}
                        secondary={`Deadline: ${new Date(
                          job.applicationDeadline
                        ).toLocaleDateString()}`}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/job-details/${job._id}`)}
                      >
                        View Details
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No upcoming job deadlines
                  </Typography>
                )}
              </List>

              {/* Projects */}
              <Typography variant="subtitle1">Projects</Typography>
              <List>
                {data.upcomingDeadlines.projects.length > 0 ? (
                  data.upcomingDeadlines.projects.map((proj) => (
                    <ListItem key={proj._id}>
                      <ListItemText
                        primary={proj.projectTitle}
                        secondary={`Deadline: ${new Date(
                          proj.timeline.applicationDeadline
                        ).toLocaleDateString()}`}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/project-details/${proj._id}`)}
                      >
                        View Details
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No upcoming project deadlines
                  </Typography>
                )}
              </List>

              {/* Internships */}
              <Typography variant="subtitle1">Internships</Typography>
              <List>
                {data.upcomingDeadlines.internships.length > 0 ? (
                  data.upcomingDeadlines.internships.map((intern) => (
                    <ListItem key={intern._id}>
                      <ListItemText
                        primary={intern.title}
                        secondary={`Deadline: ${new Date(
                          intern.applicationDeadline
                        ).toLocaleDateString()}`}
                      />
                      <Button
                        variant="outlined"
                        onClick={() =>
                          navigate(`/internship-details/${intern._id}`)
                        }
                      >
                        View Details
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No upcoming internship deadlines
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended Opportunities */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Recommended Opportunities
              </Typography>

              {loadingRecommended ? (
                <CircularProgress />
              ) : data.recommended.length > 0 ? (
                <List>
                  {data.recommended.map((rec) => (
                    <ListItem
                      key={rec._id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
                        borderBottom: "1px solid #ddd",
                        pb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          rec.opportunityId?.jobTitle ||
                          rec.opportunityId?.projectTitle ||
                          rec.opportunityId?.title ||
                          "No title"
                        }
                        secondary={`Recommended by: ${
                          rec.recommendedBy.fullName
                        } • Note: ${rec.note || "No note"}`}
                      />

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            navigate(
                              `/${rec.type.toLowerCase()}-details/${
                                rec.opportunityId._id
                              }`
                            )
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => {
                            // Optimistically remove from UI first
                            setData((prev) => ({
                              ...prev,
                              recommended: prev.recommended.filter(
                                (r) => r._id !== rec._id
                              ),
                            }));

                            // Then call API (optional)
                            const token = localStorage.getItem("token");
                            axios
                              .post(
                                "http://localhost:5000/api/recommendations/not-interested",
                                { recommendationId: rec._id },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              )
                              .catch((err) =>
                                console.error(
                                  "Failed to mark as not interested",
                                  err
                                )
                              );
                          }}
                        >
                          Not Interested
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No recommended opportunities yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
