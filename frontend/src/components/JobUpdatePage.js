// src/pages/JobUpdatePage.jsx
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
} from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const JobUpdatePage = () => {
  const { id } = useParams(); // jobId from route
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    jobTitle: "",
    organization: "",
    jobDescription: "",
    keywords: "",
    targetCandidates: "",
    jobType: "",
    experienceLevel: "",
    expectedStartDate: "",
    applicationDeadline: "",
    requiredSkills: "",
    educationRequirements: "",
    minSalary: "",
    maxSalary: "",
    workLocation: "",
    officeLocation: "",
    employeeBenefits: "",
  });
  const [files, setFiles] = useState([]);

  // ✅ Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(`/api/jobs/${id}`);
        if (data.success) {
          setJob(data.job);

          setFormData({
            jobTitle: data.job.jobTitle || "",
            organization: data.job.organization || "",
            jobDescription: data.job.jobDescription || "",
            keywords: (data.job.keywords || []).join(", "),
            targetCandidates: data.job.targetCandidates || "",
            jobType: data.job.jobType || "",
            experienceLevel: data.job.experienceLevel || "",
            expectedStartDate: data.job.expectedStartDate
              ? data.job.expectedStartDate.slice(0, 10)
              : "",
            applicationDeadline: data.job.applicationDeadline
              ? data.job.applicationDeadline.slice(0, 10)
              : "",
            requiredSkills: (data.job.requiredSkills || []).join(", "),
            educationRequirements: (data.job.educationRequirements || []).join(
              ", "
            ),
            minSalary: data.job.minSalary || "",
            maxSalary: data.job.maxSalary || "",
            workLocation: data.job.workLocation || "",
            officeLocation: data.job.officeLocation || "",
            employeeBenefits: (data.job.employeeBenefits || []).join(", "),
          });
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append("supportingDocuments", files[i]);
        }
      }

      const { data } = await axios.put(`/api/jobs/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔑 Auth
        },
      });

      if (data && data.success) {
        navigate(`/job-details/${id}`);
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
          Update Job Posting
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
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
                label="Job Description"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
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

            <Grid item xs={12} sm={6}>
              <TextField
                label="Target Candidates"
                name="targetCandidates"
                value={formData.targetCandidates}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Job Type"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                fullWidth
              >
                {["FULL-TIME", "PART-TIME", "CONTRACT", "TEMPORARY"].map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Experience Level"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                fullWidth
              >
                {[
                  "ENTRY LEVEL",
                  "MID LEVEL",
                  "SENIOR LEVEL",
                  "EXECUTIVE LEVEL",
                ].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Expected Start Date"
                name="expectedStartDate"
                value={formData.expectedStartDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12}>
              <TextField
                label="Required Skills (comma separated)"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Education Requirements (comma separated)"
                name="educationRequirements"
                value={formData.educationRequirements}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Min Salary"
                name="minSalary"
                value={formData.minSalary}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Max Salary"
                name="maxSalary"
                value={formData.maxSalary}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Work Location"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                fullWidth
              >
                {["REMOTE", "HYBRID", "ON-SITE"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Office Location"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Employee Benefits (comma separated)"
                name="employeeBenefits"
                value={formData.employeeBenefits}
                onChange={handleChange}
                fullWidth
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
                {updating ? "Updating..." : "Update Job"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default JobUpdatePage;
