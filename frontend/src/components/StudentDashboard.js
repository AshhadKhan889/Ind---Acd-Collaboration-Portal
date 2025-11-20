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

const StudentDashboard = () => {
  const [data, setData] = useState({
    myApplications: [],
    upcomingDeadlines: { jobs: [], projects: [], internships: [] },
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/student/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data) {
          setData({
            myApplications: res.data.myApplications || [],
            upcomingDeadlines: res.data.upcomingDeadlines || { jobs: [], projects: [], internships: [] },
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchDashboard();
  }, []);

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
                    <ListItem key={app._id}>
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

export default StudentDashboard;
