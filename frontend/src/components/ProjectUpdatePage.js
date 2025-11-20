// src/pages/ProjectUpdatePage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ProjectUpdatePage = () => {
  const { id } = useParams(); // projectId from route
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    projectTitle: "",
    organization: "",
    projectDescription: "",
    projectType: "",
    projectDomain: "",
    targetCollaborators: "",
    keywords: "",
    requiredSkills: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    budgetAmount: "",
    budgetCurrency: "USD",
    teamSize: "",
    remoteAllowed: false,
    requiresNDA: false,
    openForStudents: false,
    openForProfessionals: false,
  });
  const [files, setFiles] = useState([]);

  // ✅ Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await axios.get(`/api/projects/${id}`);
        if (data.success) {
          setProject(data.project);

          setFormData({
            projectTitle: data.project.projectTitle || "",
            organization: data.project.organization || "",
            projectDescription: data.project.projectDescription || "",
            projectType: data.project.projectType || "",
            projectDomain: data.project.projectDomain || "",
            targetCollaborators: data.project.targetCollaborators || "",
            keywords: (data.project.keywords || []).join(", "),
            requiredSkills: (data.project.requiredSkills || []).join(", "),
            startDate: data.project.timeline?.startDate
              ? data.project.timeline.startDate.slice(0, 10)
              : "",
            endDate: data.project.timeline?.endDate
              ? data.project.timeline.endDate.slice(0, 10)
              : "",
            applicationDeadline: data.project.timeline?.applicationDeadline
              ? data.project.timeline.applicationDeadline.slice(0, 10)
              : "",
            budgetAmount: data.project.budget?.amount || "",
            budgetCurrency: data.project.budget?.currency || "USD",
            teamSize: data.project.teamSize || "",
            remoteAllowed:
              data.project.collaborationPreferences?.remoteAllowed || false,
            requiresNDA:
              data.project.collaborationPreferences?.requiresNDA || false,
            openForStudents:
              data.project.collaborationPreferences?.openForStudents || false,
            openForProfessionals:
              data.project.collaborationPreferences?.openForProfessionals ||
              false,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formDataToSend = new FormData();

      // simple fields
      formDataToSend.append("projectTitle", formData.projectTitle);
      formDataToSend.append("organization", formData.organization);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("projectType", formData.projectType);
      formDataToSend.append("projectDomain", formData.projectDomain);
      formDataToSend.append(
        "targetCollaborators",
        formData.targetCollaborators
      );
      formDataToSend.append(
        "keywords",
        JSON.stringify(formData.keywords.split(",").map((k) => k.trim()))
      );
      formDataToSend.append(
        "requiredSkills",
        JSON.stringify(formData.requiredSkills.split(",").map((s) => s.trim()))
      );
      formDataToSend.append(
        "timeline",
        JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          applicationDeadline: formData.applicationDeadline,
        })
      );
      formDataToSend.append(
        "budget",
        JSON.stringify({
          amount: formData.budgetAmount,
          currency: formData.budgetCurrency,
        })
      );
      formDataToSend.append("teamSize", formData.teamSize);
      formDataToSend.append(
        "collaborationPreferences",
        JSON.stringify({
          remoteAllowed: formData.remoteAllowed,
          requiresNDA: formData.requiresNDA,
          openForStudents: formData.openForStudents,
          openForProfessionals: formData.openForProfessionals,
        })
      );

      // files
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append("supportingDocuments", files[i]);
        }
      }

      const { data } = await axios.put(`/api/projects/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔑 Auth
        },
      });

      if (data && data.success) {
        navigate(`/project-details/${id}`);
      } else {
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Update Project
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Project Title"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
                <TextField
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

            <Grid item xs={12}>
              <TextField
                label="Project Description"
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Project Type"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Project Domain"
                name="projectDomain"
                value={formData.projectDomain}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Target Collaborators"
                name="targetCollaborators"
                value={formData.targetCollaborators}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Keywords (comma separated)"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Required Skills (comma separated)"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="End Date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Application Deadline"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Budget Amount"
                name="budgetAmount"
                value={formData.budgetAmount}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Budget Currency"
                name="budgetCurrency"
                value={formData.budgetCurrency}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Team Size"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.remoteAllowed}
                    onChange={handleChange}
                    name="remoteAllowed"
                  />
                }
                label="Remote Allowed"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requiresNDA}
                    onChange={handleChange}
                    name="requiresNDA"
                  />
                }
                label="Requires NDA"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.openForStudents}
                    onChange={handleChange}
                    name="openForStudents"
                  />
                }
                label="Open for Students"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.openForProfessionals}
                    onChange={handleChange}
                    name="openForProfessionals"
                  />
                }
                label="Open for Professionals"
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Upload Supporting Documents
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Project"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectUpdatePage;
