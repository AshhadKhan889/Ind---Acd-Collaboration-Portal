import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const JobPosting = ({ currentUserId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    postedBy: currentUserId || "",

    organization: "",
    jobTitle: "",
    jobDescription: "",
    keywords: [],
    currentKeyword: "",

    targetCandidates: "",
    jobType: "",
    experienceLevel: "",

    expectedStartDate: "",
    applicationDeadline: "",

    requiredSkills: [],
    currentSkill: "",
    educationRequirements: [],

    supportingDocuments: [],

    minSalary: 70000,
    maxSalary: 90000,

    workLocation: "",
    officeLocation: "",

    employeeBenefits: [],
  });

  useEffect(() => {
    if (currentUserId) {
      setFormData((prev) => ({ ...prev, postedBy: currentUserId }));
    }
  }, [currentUserId]);

  // helper to update a simple field and clear that field's error
  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const addKeyword = () => {
    const kw = formData.currentKeyword?.trim();
    if (!kw) return;
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, kw],
      currentKeyword: "",
    }));
    setErrors((prev) => ({ ...prev, keywords: undefined }));
  };

  const removeKeyword = (index) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    const s = formData.currentSkill?.trim();
    if (!s) return;
    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, s],
      currentSkill: "",
    }));
    setErrors((prev) => ({ ...prev, requiredSkills: undefined }));
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index),
    }));
  };

  const toggleEducation = (degree) => {
    setFormData((prev) => {
      const has = prev.educationRequirements.includes(degree);
      const next = has
        ? prev.educationRequirements.filter((d) => d !== degree)
        : [...prev.educationRequirements, degree];
      return { ...prev, educationRequirements: next };
    });
    setErrors((prev) => ({ ...prev, educationRequirements: undefined }));
  };

  const handleFileUpload = (e) => {
    setFormData((prev) => ({
      ...prev,
      supportingDocuments: Array.from(e.target.files),
    }));
    // no specific error for files
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.organization || !formData.organization.trim()) {
        newErrors.organization = "Organization name is required";
      }
      if (!formData.jobTitle || !formData.jobTitle.trim()) {
        newErrors.jobTitle = "Job title is required";
      }
      if (!formData.jobDescription || !formData.jobDescription.trim()) {
        newErrors.jobDescription = "Description is required";
      }
      if (!formData.keywords || formData.keywords.length === 0) {
        newErrors.keywords = "At least one keyword is required";
      }
    }

    if (activeStep === 1) {
      if (!formData.targetCandidates || !formData.targetCandidates.trim()) {
        newErrors.targetCandidates = "Target candidates required";
      }
      if (!formData.jobType) newErrors.jobType = "Select a job type";
      if (!formData.experienceLevel)
        newErrors.experienceLevel = "Select experience level";
      if (!formData.expectedStartDate)
        newErrors.expectedStartDate = "Start date required";
      if (!formData.applicationDeadline)
        newErrors.applicationDeadline = "Deadline required";

      // If both dates present, ensure start <= deadline
      if (formData.expectedStartDate && formData.applicationDeadline) {
        const s = new Date(formData.expectedStartDate);
        const d = new Date(formData.applicationDeadline);
        if (s < d)
          newErrors.applicationDeadline =
            "Application deadline must be before start date";
      }

      if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
        newErrors.requiredSkills = "Add at least one skill";
      }
      if (
        !formData.educationRequirements ||
        formData.educationRequirements.length === 0
      ) {
        newErrors.educationRequirements = "Select at least one degree";
      }
    }

    if (activeStep === 2) {
      if (
        formData.minSalary === "" ||
        formData.minSalary === null ||
        isNaN(Number(formData.minSalary))
      ) {
        newErrors.minSalary = "Minimum salary required (number)";
      }
      if (
        formData.maxSalary === "" ||
        formData.maxSalary === null ||
        isNaN(Number(formData.maxSalary))
      ) {
        newErrors.maxSalary = "Maximum salary required (number)";
      }
      if (
        !(formData.minSalary === "" || formData.minSalary === null) &&
        !(formData.maxSalary === "" || formData.maxSalary === null) &&
        !isNaN(Number(formData.minSalary)) &&
        !isNaN(Number(formData.maxSalary))
      ) {
        if (Number(formData.minSalary) > Number(formData.maxSalary)) {
          newErrors.maxSalary =
            "Max salary must be greater than or equal to Min salary";
        }
      }

      if (!formData.workLocation)
        newErrors.workLocation = "Select work location";
      if (
        formData.workLocation !== "REMOTE" &&
        (!formData.officeLocation || !formData.officeLocation.trim())
      ) {
        newErrors.officeLocation =
          "Office location required for on-site/hybrid roles";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    // validate final step before submitting
    if (!validateStep()) return;

    try {
      const token = localStorage.getItem("token");

      const jobPayload = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        // Files already handled by supportingDocuments
        if (key === "supportingDocuments") return;

        if (Array.isArray(value)) {
          // append each array value
          value.forEach((v) => jobPayload.append(key, v));
        } else if (value !== null && value !== "") {
          jobPayload.append(key, value);
        }
      });

      // append files
      if (
        formData.supportingDocuments &&
        formData.supportingDocuments.length > 0
      ) {
        formData.supportingDocuments.forEach((file) =>
          jobPayload.append("supportingDocuments", file)
        );
      }

      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // don't set Content-Type for multipart
        },
        body: jobPayload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Job posting failed");

      const job = data.job;

      alert("✅ Job posted successfully!");
      navigate(`/job-details/${job._id}`, { state: { job } });
    } catch (err) {
      alert("❌ " + err.message);
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Post a Job
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Job Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Requirements</StepLabel>
        </Step>
        <Step>
          <StepLabel>Publish</StepLabel>
        </Step>
      </Stepper>

      {/* Step 0: Job Details */}
      {activeStep === 0 && (
        <Box>
          <TextField
            fullWidth
            label="Organization"
            value={formData.organization}
            error={!!errors.organization}
            helperText={errors.organization}
            onChange={(e) => updateField("organization", e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Job Title"
            value={formData.jobTitle}
            error={!!errors.jobTitle}
            helperText={errors.jobTitle}
            onChange={(e) => updateField("jobTitle", e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Job Description"
            multiline
            rows={6}
            value={formData.jobDescription}
            error={!!errors.jobDescription}
            helperText={errors.jobDescription}
            onChange={(e) => updateField("jobDescription", e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6">Keywords</Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              value={formData.currentKeyword}
              onChange={(e) => updateField("currentKeyword", e.target.value)}
              placeholder="Add keywords"
            />
            <Button variant="outlined" onClick={addKeyword}>
              Add
            </Button>
          </Box>
          {errors.keywords && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.keywords}
            </Typography>
          )}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {(formData.keywords || []).map((keyword, i) => (
              <Chip key={i} label={keyword} onDelete={() => removeKeyword(i)} />
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 1: Requirements */}
      {activeStep === 1 && (
        <Box>
          <TextField
            fullWidth
            label="Target Candidates"
            value={formData.targetCandidates}
            error={!!errors.targetCandidates}
            helperText={errors.targetCandidates}
            onChange={(e) => updateField("targetCandidates", e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6">Job Type</Typography>
          <ToggleButtonGroup
            value={formData.jobType}
            exclusive
            onChange={(e, newValue) => updateField("jobType", newValue)}
            sx={{ mb: 1 }}
          >
            <ToggleButton value="FULL-TIME">Full-time</ToggleButton>
            <ToggleButton value="PART-TIME">Part-time</ToggleButton>
            <ToggleButton value="CONTRACT">Contract</ToggleButton>
            <ToggleButton value="TEMPORARY">Temporary</ToggleButton>
          </ToggleButtonGroup>
          {errors.jobType && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.jobType}
            </Typography>
          )}

          <Typography variant="h6">Experience Level</Typography>
          <ToggleButtonGroup
            value={formData.experienceLevel}
            exclusive
            onChange={(e, newValue) => updateField("experienceLevel", newValue)}
            sx={{ mb: 1 }}
          >
            <ToggleButton value="ENTRY LEVEL">Entry Level</ToggleButton>
            <ToggleButton value="MID LEVEL">Mid Level</ToggleButton>
            <ToggleButton value="SENIOR LEVEL">Senior Level</ToggleButton>
            <ToggleButton value="EXECUTIVE LEVEL">Executive Level</ToggleButton>
          </ToggleButtonGroup>
          {errors.experienceLevel && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.experienceLevel}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Expected Start Date"
              type="date"
              value={formData.expectedStartDate}
              error={!!errors.expectedStartDate}
              helperText={errors.expectedStartDate}
              onChange={(e) => updateField("expectedStartDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Application Deadline"
              type="date"
              value={formData.applicationDeadline}
              error={!!errors.applicationDeadline}
              helperText={errors.applicationDeadline}
              onChange={(e) =>
                updateField("applicationDeadline", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Typography variant="h6">Required Skills</Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              value={formData.currentSkill}
              onChange={(e) => updateField("currentSkill", e.target.value)}
              placeholder="Add skill"
            />
            <Button variant="outlined" onClick={addSkill}>
              Add
            </Button>
          </Box>
          {errors.requiredSkills && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.requiredSkills}
            </Typography>
          )}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {(formData.requiredSkills || []).map((skill, i) => (
              <Chip key={i} label={skill} onDelete={() => removeSkill(i)} />
            ))}
          </Box>

          <Typography variant="h6">Education Requirements</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
            {["High School", "Bachelor's", "Master's", "PhD"].map((degree) => (
              <FormControlLabel
                key={degree}
                control={
                  <Checkbox
                    checked={formData.educationRequirements.includes(degree)}
                    onChange={() => toggleEducation(degree)}
                  />
                }
                label={degree}
              />
            ))}
          </Box>
          {errors.educationRequirements && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.educationRequirements}
            </Typography>
          )}

          <Typography variant="h6" sx={{ mt: 2 }}>
            Supporting Documents
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mb: 2 }}
          >
            Upload
            <input type="file" hidden multiple onChange={handleFileUpload} />
          </Button>
          {formData.supportingDocuments.length > 0 && (
            <Typography sx={{ mb: 2 }}>
              {formData.supportingDocuments.length} file(s) selected
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Publish */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h6">Compensation</Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              label="Min Salary"
              value={formData.minSalary}
              error={!!errors.minSalary}
              helperText={errors.minSalary}
              onChange={(e) => updateField("minSalary", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rs</InputAdornment>
                ),
              }}
            />
            <TextField
              label="Max Salary"
              value={formData.maxSalary}
              error={!!errors.maxSalary}
              helperText={errors.maxSalary}
              onChange={(e) => updateField("maxSalary", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rs</InputAdornment>
                ),
              }}
            />
          </Box>

          <Typography variant="h6">Work Location</Typography>
          <ToggleButtonGroup
            value={formData.workLocation}
            exclusive
            onChange={(e, newValue) => updateField("workLocation", newValue)}
            sx={{ mb: 1 }}
          >
            <ToggleButton value="REMOTE">Remote</ToggleButton>
            <ToggleButton value="HYBRID">Hybrid</ToggleButton>
            <ToggleButton value="ON-SITE">On-site</ToggleButton>
          </ToggleButtonGroup>
          {errors.workLocation && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.workLocation}
            </Typography>
          )}

          {formData.workLocation !== "REMOTE" && (
            <TextField
              fullWidth
              label="Office Location"
              value={formData.officeLocation}
              error={!!errors.officeLocation}
              helperText={errors.officeLocation}
              onChange={(e) => updateField("officeLocation", e.target.value)}
              sx={{ mb: 3 }}
            />
          )}

          <Typography variant="h6">Employee Benefits</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {[
              "Health Insurance",
              "401(k) Matching",
              "Flexible Hours",
              "Stock Options",
              "Paid Time Off",
              "Remote Work Options",
              "Professional Development",
              "Wellness Program",
            ].map((benefit) => (
              <FormControlLabel
                key={benefit}
                control={
                  <Checkbox
                    checked={formData.employeeBenefits.includes(benefit)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        employeeBenefits: checked
                          ? [...prev.employeeBenefits, benefit]
                          : prev.employeeBenefits.filter((b) => b !== benefit),
                      }));
                    }}
                  />
                }
                label={benefit}
              />
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleBack}>Back</Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleSubmit}
            >
              Publish Job
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default JobPosting;
