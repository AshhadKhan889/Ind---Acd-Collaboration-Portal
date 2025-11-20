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
} from "@mui/material";
import axios from "axios";

const AcademiaDashboard = () => {
  const [data, setData] = useState({
    postedOpportunities: { jobs: [], projects: [], internships: [] },
    upcomingDeadlines: { jobs: [], projects: [], internships: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/academia/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Only retain the parts we need
        const payload = res.data || {};
        setData({
          postedOpportunities: payload.postedOpportunities || {
            jobs: [],
            projects: [],
            internships: [],
          },
          upcomingDeadlines: payload.upcomingDeadlines || {
            jobs: [],
            projects: [],
            internships: [],
          },
        });
        setError("");
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            (err?.response?.status === 403
              ? "Access denied: Academia role required"
              : "Failed to load dashboard")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🏫 Academia Dashboard
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Posted Opportunities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📢 Posted Opportunities
              </Typography>
              <List>
                {/* Jobs posted by this academia user */}
                {data.postedOpportunities.jobs?.length > 0 && (
                  <>
                    <Typography variant="subtitle1">Jobs</Typography>
                    {data.postedOpportunities.jobs.map((job) => (
                      <ListItem key={job._id}>
                        <ListItemText
                          primary={job.jobTitle}
                          secondary={`Deadline: ${job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "N/A"}`}
                        />
                      </ListItem>
                    ))}
                  </>
                )}

                {/* Projects posted by this academia user */}
                {data.postedOpportunities.projects?.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>Projects</Typography>
                    {data.postedOpportunities.projects.map((proj) => (
                      <ListItem key={proj._id}>
                        <ListItemText
                          primary={proj.projectTitle}
                          secondary={`Deadline: ${proj?.timeline?.applicationDeadline ? new Date(proj.timeline.applicationDeadline).toLocaleDateString() : "N/A"}`}
                        />
                      </ListItem>
                    ))}
                  </>
                )}

                {/* Internships posted by this academia user */}
                {data.postedOpportunities.internships?.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>Internships</Typography>
                    {data.postedOpportunities.internships.map((intern) => (
                      <ListItem key={intern._id}>
                        <ListItemText
                          primary={intern.title}
                          secondary={`Deadline: ${intern.applicationDeadline ? new Date(intern.applicationDeadline).toLocaleDateString() : "N/A"}`}
                        />
                      </ListItem>
                    ))}
                  </>
                )}

                {(!data.postedOpportunities.jobs?.length &&
                  !data.postedOpportunities.projects?.length &&
                  !data.postedOpportunities.internships?.length) && (
                  <Typography color="text.secondary">No opportunities posted yet</Typography>
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
                          proj.timeline?.applicationDeadline
                        ).toLocaleDateString()}`}
                      />
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
      </Grid>
    </Box>
  );
};

export default AcademiaDashboard;
