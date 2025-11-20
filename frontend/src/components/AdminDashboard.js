// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  TextField,
  Grid,
} from "@mui/material";
import {
  PeopleAlt,
  AdminPanelSettings,
  Business,
  School,
  Work,
  Assignment,
  TrendingUp,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");
const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";

const COLORS = ["#1976d2", "#2e7d32", "#ff9800", "#d32f2f"];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: apiBase,
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [uRes, jRes, pRes, iRes] = await Promise.all([
          axiosInstance.get("/api/admin/users"),
          axiosInstance.get("/api/admin/jobs"),
          axiosInstance.get("/api/admin/projects"),
          axiosInstance.get("/api/admin/internships"),
        ]);
        setUsers(uRes.data);
        setJobs(jRes.data);
        setProjects(pRes.data);
        setInternships(iRes.data);
      } catch (err) {
        console.error("Admin fetch error", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getRoleIcon = (roleID) => {
    switch (roleID) {
      case "Admin":
        return <AdminPanelSettings fontSize="small" />;
      case "Industry Official":
        return <Business fontSize="small" />;
      case "Academia":
        return <School fontSize="small" />;
      default:
        return <PeopleAlt fontSize="small" />;
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job permanently?")) return;
    try {
      await axiosInstance.delete(`/api/admin/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      await axiosInstance.delete(`/api/admin/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const deleteInternship = async (id) => {
    if (!window.confirm("Delete this internship permanently?")) return;
    try {
      await axiosInstance.delete(`/api/admin/internships/${id}`);
      setInternships(internships.filter((i) => i._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  // ----- Analytics Data -----
  const roleData = [
    { role: "Admin", count: users.filter((u) => u.roleID === "Admin").length },
    {
      role: "Industry",
      count: users.filter((u) => u.roleID === "Industry Official").length,
    },
    {
      role: "Academia",
      count: users.filter((u) => u.roleID === "Academia").length,
    },
    {
      role: "Student",
      count: users.filter((u) => u.roleID === "Student").length,
    },
  ];

  const postData = [
    { name: "Jobs", value: jobs.length },
    { name: "Projects", value: projects.length },
    { name: "Internships", value: internships.length },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Admin Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Last updated: {new Date().toLocaleString()}
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* ====== Summary Cards ====== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <PeopleAlt sx={{ mr: 1 }} /> Users
            </Typography>
            <Typography variant="h5" color="primary">
              {users.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Work sx={{ mr: 1 }} /> Jobs
            </Typography>
            <Typography variant="h5" color="primary">
              {jobs.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Assignment sx={{ mr: 1 }} /> Projects
            </Typography>
            <Typography variant="h5" color="primary">
              {projects.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <TrendingUp sx={{ mr: 1 }} /> Internships
            </Typography>
            <Typography variant="h5" color="primary">
              {internships.length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ====== Analytics Charts ====== */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Users by Role
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Posts Overview
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={postData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#1976d2"
                  label
                >
                  {postData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ====== User Management ====== */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, display: "flex", alignItems: "center" }}
        >
          <PeopleAlt sx={{ mr: 1, color: "primary.main" }} /> User Management
          <Chip label={`${users.length} users`} sx={{ ml: 2 }} />
        </Typography>

        <TextField
          label="Search users..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Card variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                        {(user.fullName || user.username || user.email)?.charAt(
                          0
                        )}
                      </Avatar>
                      <Box>
                        <Typography>
                          {user.fullName || user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.roleID)}
                      label={user.roleID}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === "active" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => navigate("/admin/block-user")}
                    >
                      Take Action
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Box>

      {/* ====== Jobs ====== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Jobs ({jobs.length})</Typography>
        <Card variant="outlined">
          {jobs.map((j) => (
            <Box
              key={j._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              <Box>
                <Typography fontWeight={600}>
                  {j.title || j.jobTitle || "Untitled Job"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted by:{" "}
                  {j.postedBy?.fullName ||
                    j.postedBy?.username ||
                    j.company ||
                    "Unknown"}
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteJob(j._id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Card>
      </Box>

      {/* ====== Projects ====== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Projects ({projects.length})</Typography>
        <Card variant="outlined">
          {projects.map((p) => (
            <Box
              key={p._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              <Box>
                <Typography fontWeight={600}>
                  {p.title || p.projectTitle || "Untitled Project"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted by:{" "}
                  {p.postedBy?.fullName ||
                    p.postedBy?.username ||
                    p.postedBy?.email ||
                    "Unknown"}
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteProject(p._id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Card>
      </Box>

      {/* ====== Internships ====== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Internships ({internships.length})</Typography>
        <Card variant="outlined">
          {internships.map((i) => (
            <Box
              key={i._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              <Box>
                <Typography fontWeight={600}>
                  {i.title || i.position || "Untitled Internship"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted by:{" "}
                  {i.postedBy?.fullName ||
                    i.postedBy?.username ||
                    i.company ||
                    "Unknown"}
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteInternship(i._id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
