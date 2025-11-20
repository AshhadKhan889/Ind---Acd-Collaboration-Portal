// src/components/ApplicationsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Button,
  Chip,
  Stack,
} from "@mui/material";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/applications/my-applications", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (res.data && res.data.success) {
          setApplications(res.data.applications || []);
        } else {
          // If API returns okay structure without `success`, handle both
          setApplications(res.data.applications || res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to fetch applications. See console.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  const handleView = (app) => {
    if (app.opportunityType === "job") {
      navigate(`/jobs/${app.opportunityId}`);
    } else if (app.opportunityType === "project") {
      navigate(`/projects/${app.opportunityId}`);
    } else if (app.opportunityType === "internship") {
      navigate(`/internships/${app.opportunityId}`);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      console.error("Failed to withdraw application:", err);
      alert("Failed to withdraw application. Try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        My Applications
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6">
            You haven't applied to any opportunities yet.
          </Typography>
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            Browse opportunities and apply.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {applications.map((app) => (
            <Paper key={app._id || app.id} sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 240 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {app.opportunityTitle || "Untitled"}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {app.opportunityPostedBy
                      ? `Posted by ${app.opportunityPostedBy}`
                      : "Posted by Unknown"}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Chip
                    label={
                      app.opportunityType?.toUpperCase() ||
                      app.type?.toUpperCase() ||
                      "N/A"
                    }
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Applied:{" "}
                    {new Date(
                      app.appliedAt ||
                        app.createdAt ||
                        app.appliedAt ||
                        Date.now()
                    ).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {app.note || "No note provided."}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  Status:{" "}
                  <span
                    style={{
                      color:
                        app.status === "Accepted"
                          ? "green"
                          : app.status === "Rejected"
                          ? "red"
                          : "#333",
                    }}
                  >
                    {app.status || "Pending"}
                  </span>
                </Typography>

                {/* optional: view details or withdraw */}
                <Box>
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    onClick={() => handleWithdraw(app._id)}
                  >
                    Withdraw
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ApplicationsPage;
