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

  const [resumeFile, setResumeFile] = useState(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const allowedExtensions = [".pdf", ".doc", ".docx"];
      const fileExt = "." + file.name.split(".").pop().toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
        setErrors((prev) => ({
          ...prev,
          resumeFile: "Only PDF, DOC, and DOCX files are allowed",
        }));
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          resumeFile: "File size must be less than 10MB",
        }));
        return;
      }
      
      setResumeFile(file);
      setErrors((prev) => ({ ...prev, resumeFile: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.note.trim()) newErrors.note = "Note is required";
    if (!resumeFile) {
      newErrors.resumeFile = "Resume file is required";
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

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("resume", resumeFile);
      formDataToSend.append("note", formData.note);
      formDataToSend.append("opportunityType", type);

      if (type === "job") {
        formDataToSend.append("expectedSalary", formData.expectedSalary);
        formDataToSend.append("experienceLevel", formData.experienceLevel);
      } else if (type === "internship") {
        formDataToSend.append("educationLevel", formData.educationLevel);
        formDataToSend.append("university", formData.university);
        formDataToSend.append("graduationDate", formData.graduationDate);
        formDataToSend.append("learningObjectives", formData.learningObjectives);
      } else if (type === "project") {
        formDataToSend.append("areaOfInterest", formData.areaOfInterest);
        formDataToSend.append("proposedContribution", formData.proposedContribution);
        formDataToSend.append("motivation", formData.motivation);
      }

      await axios.post(
        `http://localhost:5000/api/applications/${type}/${id}`,
        formDataToSend,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
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
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="body2" gutterBottom>
          Resume Document (PDF, DOC, DOCX) *
        </Typography>
        <input
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          id="resume-file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="resume-file-input">
          <Button
            variant="outlined"
            component="span"
            fullWidth
            sx={{ mb: 1 }}
          >
            {resumeFile ? resumeFile.name : "Choose Resume File"}
          </Button>
        </label>
        {errors.resumeFile && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
            {errors.resumeFile}
          </Typography>
        )}
        {resumeFile && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(2)} KB)
          </Typography>
        )}
      </Box>

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
