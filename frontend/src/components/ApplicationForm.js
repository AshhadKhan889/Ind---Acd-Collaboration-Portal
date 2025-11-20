import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ApplicationPage = () => {
  const { type, id } = useParams(); // type = job/project/internship
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    opportunityType: type,
    note: "",
    resumeUrl: "",
    expectedSalary: "",
    experienceLevel: "",
    educationLevel: "",
    university: "",
    graduationDate: "",
    learningObjectives: "",
    areaOfInterest: "",
    proposedContribution: "",
    motivation: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await axios.get(`/api/${type}s/${id}`);
        const data = res.data;
        const opp = data.job || data.project || data.internship || data;

        let poster = "Unknown";
        if (typeof opp.postedBy === "string") {
          const email = opp.postedBy;
          const localPart = email.includes("@") ? email.split("@")[0] : email;
          poster = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        } else if (opp.postedBy) {
          poster =
            opp.postedBy.fullName ||
            opp.postedBy.username ||
            opp.postedBy.email ||
            "Unknown";
        }

        const title =
          opp.jobTitle || opp.projectTitle || opp.title || "Untitled";

        setOpportunity({ ...opp, poster, title });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching opportunity:", err);
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.note.trim()) newErrors.note = "Note is required";
    if (!formData.resumeUrl.trim())
      newErrors.resumeUrl = "Resume URL is required";
    else {
      const urlPattern = /^(https?:\/\/)/;
      if (!urlPattern.test(formData.resumeUrl))
        newErrors.resumeUrl = "Resume URL must start with http:// or https://";
    }

    if (type === "job") {
      if (!formData.expectedSalary.trim())
        newErrors.expectedSalary = "Expected Salary is required";
      if (!formData.experienceLevel.trim())
        newErrors.experienceLevel = "Experience Level is required";
    }

    if (type === "internship") {
      if (!formData.educationLevel.trim())
        newErrors.educationLevel = "Education Level is required";
      if (!formData.university.trim())
        newErrors.university = "University is required";
      if (!formData.graduationDate.trim())
        newErrors.graduationDate = "Graduation Date is required";
      if (!formData.learningObjectives.trim())
        newErrors.learningObjectives = "Learning Objectives are required";
    }

    if (type === "project") {
      if (!formData.areaOfInterest.trim())
        newErrors.areaOfInterest = "Area of Interest is required";
      if (!formData.proposedContribution.trim())
        newErrors.proposedContribution = "Proposed Contribution is required";
      if (!formData.motivation.trim())
        newErrors.motivation = "Motivation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");

      let payload = {
        opportunityType: type,
        note: formData.note,
        resumeUrl: formData.resumeUrl,
      };

      if (type === "job") {
        payload = {
          ...payload,
          expectedSalary: formData.expectedSalary,
          experienceLevel: formData.experienceLevel,
        };
      } else if (type === "internship") {
        payload = {
          ...payload,
          educationLevel: formData.educationLevel,
          university: formData.university,
          graduationDate: formData.graduationDate,
          learningObjectives: formData.learningObjectives,
        };
      } else if (type === "project") {
        payload = {
          ...payload,
          areaOfInterest: formData.areaOfInterest,
          proposedContribution: formData.proposedContribution,
          motivation: formData.motivation,
        };
      }

      await axios.post(
        `http://localhost:5000/api/applications/${type}/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Application submitted successfully!");
      navigate("/view");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        alert(`You have already applied for this ${type}.`);
      } else if (err.response && err.response.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to submit application");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!opportunity) {
    return <Typography align="center">Opportunity not found.</Typography>;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto", p: 3 }}
    >
      <Typography variant="h5" gutterBottom>
        Apply for {type}: {opportunity.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Posted by {opportunity.poster}
      </Typography>

      {/* Common fields */}
      <TextField
        fullWidth
        required
        label="Note"
        name="note"
        value={formData.note}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={3}
        error={!!errors.note}
        helperText={errors.note}
      />
      <TextField
        fullWidth
        required
        label="Resume URL"
        name="resumeUrl"
        value={formData.resumeUrl}
        onChange={handleChange}
        margin="normal"
        error={!!errors.resumeUrl}
        helperText={errors.resumeUrl}
      />

      {/* Job-specific fields */}
      {type === "job" && (
        <>
          <TextField
            fullWidth
            label="Expected Salary"
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            margin="normal"
            error={!!errors.expectedSalary}
            helperText={errors.expectedSalary}
          />
          <TextField
            select
            fullWidth
            label="Experience Level"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            margin="normal"
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.experienceLevel}
            helperText={errors.experienceLevel}
          >
            <option value="">Select</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </TextField>
        </>
      )}

      {/* Internship-specific fields */}
      {type === "internship" && (
        <>
          <TextField
            fullWidth
            label="Education Level"
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            margin="normal"
            error={!!errors.educationLevel}
            helperText={errors.educationLevel}
          />
          <TextField
            fullWidth
            label="University"
            name="university"
            value={formData.university}
            onChange={handleChange}
            margin="normal"
            error={!!errors.university}
            helperText={errors.university}
          />
          <TextField
            fullWidth
            label="Graduation Date"
            name="graduationDate"
            type="date"
            value={formData.graduationDate}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={!!errors.graduationDate}
            helperText={errors.graduationDate}
          />
          <TextField
            fullWidth
            label="Learning Objectives"
            name="learningObjectives"
            value={formData.learningObjectives}
            onChange={handleChange}
            margin="normal"
            error={!!errors.learningObjectives}
            helperText={errors.learningObjectives}
          />
        </>
      )}

      {/* Project-specific fields */}
      {type === "project" && (
        <>
          <TextField
            fullWidth
            label="Area of Interest"
            name="areaOfInterest"
            value={formData.areaOfInterest}
            onChange={handleChange}
            margin="normal"
            error={!!errors.areaOfInterest}
            helperText={errors.areaOfInterest}
          />
          <TextField
            fullWidth
            label="Proposed Contribution"
            name="proposedContribution"
            value={formData.proposedContribution}
            onChange={handleChange}
            margin="normal"
            error={!!errors.proposedContribution}
            helperText={errors.proposedContribution}
          />
          <TextField
            fullWidth
            label="Motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            error={!!errors.motivation}
            helperText={errors.motivation}
          />
        </>
      )}

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Submit Application
      </Button>
    </Box>
  );
};

export default ApplicationPage;
