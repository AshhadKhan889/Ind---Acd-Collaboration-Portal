import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
} from "@mui/material";
import { CloudUpload, Add, Remove } from "@mui/icons-material";
import axios from "axios";

const ProjectPosting = ({ currentUserId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_id: currentUserId || "",
    organization: "",
    projectTitle: "",
    projectDescription: "",
    projectType: "Research & Development",
    projectDomain: "",
    keywords: [],
    currentKeyword: "",
    targetCollaborators: "",
    timeline: {
      startDate: "",
      endDate: "",
      applicationDeadline: "",
    },
    supportingDocuments: null,
    requiredSkills: [],
    currentSkill: "",
    budget: {
      currency: "PKR",
      amount: 5000,
    },
    teamSize: 3,
    collaborationPreferences: {
      remoteAllowed: true,
      requiresNDA: false,
      openForStudents: true,
      openForProfessionals: true,
    },
  });

  useEffect(() => {
    if (currentUserId) {
      setFormData((prev) => ({ ...prev, user_id: currentUserId }));
    }
  }, [currentUserId]);

  const projectTypes = [
    "Research & Development",
    "Academic Collaboration",
    "Consulting",
    "Open Source",
    "Product Development",
  ];

  const domains = [
    // Core Computer Science & AI
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Data Science",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Internet of Things (IoT)",
    "Cybersecurity",
    "Cloud Computing",
    "Blockchain Technology",
    "Big Data Analytics",
    "Software Engineering",
    "Web Development",
    "Mobile Application Development",
    "Human-Computer Interaction",
    "Computer Networks",
    "Information Systems",
    "Database Systems",

    // Emerging Technologies & Research
    "Quantum Computing",
    "Augmented Reality (AR)",
    "Virtual Reality (VR)",
    "Metaverse Development",
    "Edge Computing",
    "Digital Twin Technology",
    "5G and Wireless Communication",
    "Embedded Systems",
    "Autonomous Systems",

    // Engineering & Physical Sciences
    "Electrical Engineering",
    "Electronics Engineering",
    "Mechanical Engineering",
    "Mechatronics Engineering",
    "Civil Engineering",
    "Renewable Energy",
    "Power Systems",
    "Aerospace Engineering",
    "Industrial Automation",

    // Life Sciences & Environmental Fields
    "Biotechnology",
    "Bioinformatics",
    "Genetic Engineering",
    "Pharmaceutical Sciences",
    "Environmental Science",
    "Climate Change Research",
    "Agricultural Technology (AgriTech)",
    "Food Technology",
    "Water Resource Management",

    // Social, Business & Policy-Oriented Domains
    "Economics and Finance",
    "E-Governance",
    "Digital Transformation",
    "Education Technology (EdTech)",
    "Health Informatics (HealthTech)",
    "Entrepreneurship and Innovation",
    "Public Policy and Sustainable Development",
    "Smart Cities",
    "Transport and Urban Planning",

    // Creative & Interdisciplinary Fields
    "Game Development",
    "Graphic Design and Multimedia",
    "Digital Marketing",
    "Media and Communication Studies",
    "Cultural and Heritage Preservation using Technology",
  ];

  const validateStep = () => {
    let newErrors = {};

    if (activeStep === 0) {
      if (!formData.organization.trim())
        newErrors.organization = "Organization name is required";
      if (!formData.projectTitle.trim())
        newErrors.projectTitle = "Project title is required";
      if (!formData.projectDescription.trim())
        newErrors.projectDescription = "Project description is required";
      if (!formData.projectDomain)
        newErrors.projectDomain = "Please select a domain";
    }

    if (activeStep === 1) {
      if (!formData.timeline.startDate)
        newErrors.startDate = "Start date required";
      if (!formData.timeline.endDate) newErrors.endDate = "End date required";
      if (!formData.timeline.applicationDeadline)
        newErrors.applicationDeadline = "Deadline required";

      if (
        formData.timeline.startDate &&
        formData.timeline.endDate &&
        new Date(formData.timeline.startDate) >
          new Date(formData.timeline.endDate)
      ) {
        newErrors.endDate = "End date must be after start date";
      }

      if (
        formData.timeline.applicationDeadline &&
        formData.timeline.startDate &&
        new Date(formData.timeline.applicationDeadline) >
          new Date(formData.timeline.startDate)
      ) {
        newErrors.applicationDeadline = "Deadline must be before project start";
      }
    }

    if (activeStep === 2) {
      if (!formData.budget.amount || formData.budget.amount <= 0) {
        newErrors.amount = "Budget must be greater than 0";
      }
      if (formData.teamSize < 1) {
        newErrors.teamSize = "Team size must be at least 1";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFileUpload = (e) => {
    setFormData({ ...formData, supportingDocuments: e.target.files[0] });
  };

  const handleAddKeyword = () => {
    if (formData.currentKeyword.trim()) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, formData.currentKeyword.trim()],
        currentKeyword: "",
      });
    }
  };

  const handleRemoveKeyword = (index) => {
    const updatedKeywords = [...formData.keywords];
    updatedKeywords.splice(index, 1);
    setFormData({ ...formData, keywords: updatedKeywords });
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim()) {
      setFormData({
        ...formData,
        requiredSkills: [
          ...formData.requiredSkills,
          formData.currentSkill.trim(),
        ],
        currentSkill: "",
      });
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.requiredSkills];
    updatedSkills.splice(index, 1);
    setFormData({ ...formData, requiredSkills: updatedSkills });
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("organization", formData.organization);
      formDataToSend.append("user_id", formData.user_id);
      formDataToSend.append("projectTitle", formData.projectTitle);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("projectType", formData.projectType);
      formDataToSend.append("projectDomain", formData.projectDomain);
      formDataToSend.append(
        "targetCollaborators",
        formData.targetCollaborators
      );

      formDataToSend.append("keywords", JSON.stringify(formData.keywords));
      formDataToSend.append(
        "requiredSkills",
        JSON.stringify(formData.requiredSkills)
      );
      formDataToSend.append("timeline", JSON.stringify(formData.timeline));
      formDataToSend.append("budget", JSON.stringify(formData.budget));
      formDataToSend.append("teamSize", formData.teamSize);
      formDataToSend.append(
        "collaborationPreferences",
        JSON.stringify(formData.collaborationPreferences)
      );

      if (formData.supportingDocuments) {
        formDataToSend.append(
          "supportingDocuments",
          formData.supportingDocuments
        );
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/projects",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Project posted successfully!");
      navigate(`/project-details/${res.data.project._id}`);
    } catch (err) {
      console.error(
        "❌ Error saving project:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Post a Project
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Project Overview</StepLabel>
        </Step>
        <Step>
          <StepLabel>Technical Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Finalize</StepLabel>
        </Step>
      </Stepper>

      {/* Step 1 */}
      {activeStep === 0 && (
        <Box>
          <TextField
            fullWidth
            label="Organization"
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            sx={{ mb: 2 }}
            error={!!errors.organization}
            helperText={
              errors.organization
            }
            required
          />
          <TextField
            fullWidth
            label="Project Title"
            value={formData.projectTitle}
            onChange={(e) =>
              setFormData({ ...formData, projectTitle: e.target.value })
            }
            sx={{ mb: 2 }}
            error={!!errors.projectTitle}
            helperText={
              errors.projectTitle
            }
            required
          />

          <TextField
            fullWidth
            label="Project Description"
            multiline
            rows={6}
            value={formData.projectDescription}
            onChange={(e) =>
              setFormData({ ...formData, projectDescription: e.target.value })
            }
            sx={{ mb: 2 }}
            error={!!errors.projectDescription}
            helperText={
              errors.projectDescription
            }
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.projectDomain}>
            <InputLabel>Project Domain</InputLabel>
            <Select
              value={formData.projectDomain}
              label="Project Domain"
              onChange={(e) =>
                setFormData({ ...formData, projectDomain: e.target.value })
              }
            >
              {domains.map((domain) => (
                <MenuItem key={domain} value={domain}>
                  {domain}
                </MenuItem>
              ))}
            </Select>
            {errors.projectDomain && (
              <Typography variant="caption" color="error">
                {errors.projectDomain}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2 */}
      {activeStep === 1 && (
        <Box>
          <TextField
            fullWidth
            label="Target Collaborators"
            value={formData.targetCollaborators}
            onChange={(e) =>
              setFormData({ ...formData, targetCollaborators: e.target.value })
            }
            sx={{ mb: 3 }}
            helperText="Describe the ideal collaborators for this project"
          />

          {/* Keywords */}
          <Typography variant="h6" gutterBottom>
            Keywords
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              value={formData.currentKeyword}
              onChange={(e) =>
                setFormData({ ...formData, currentKeyword: e.target.value })
              }
              placeholder="Add keywords"
              onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
            />
            <Button variant="outlined" onClick={handleAddKeyword}>
              <Add />
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {formData.keywords.map((keyword, i) => (
              <Chip
                key={i}
                label={keyword}
                onDelete={() => handleRemoveKeyword(i)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>

          {/* Skills */}
          <Typography variant="h6" gutterBottom>
            Required Skills
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              value={formData.currentSkill}
              onChange={(e) =>
                setFormData({ ...formData, currentSkill: e.target.value })
              }
              placeholder="Add required skills"
              onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button variant="outlined" onClick={handleAddSkill}>
              <Add />
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {formData.requiredSkills.map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                onDelete={() => handleRemoveSkill(i)}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>

          {/* Timeline */}
          <Typography variant="h6" gutterBottom>
            Project Timeline
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={formData.timeline.startDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeline: {
                      ...formData.timeline,
                      startDate: e.target.value,
                    },
                  })
                }
                error={!!errors.startDate}
                helperText={errors.startDate}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={formData.timeline.endDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeline: { ...formData.timeline, endDate: e.target.value },
                  })
                }
                error={!!errors.endDate}
                helperText={errors.endDate}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Application Deadline"
                InputLabelProps={{ shrink: true }}
                value={formData.timeline.applicationDeadline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeline: {
                      ...formData.timeline,
                      applicationDeadline: e.target.value,
                    },
                  })
                }
                error={!!errors.applicationDeadline}
                helperText={errors.applicationDeadline}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3 */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Budget & Team
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Budget"
                value={formData.budget.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: { ...formData.budget, amount: e.target.value },
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Rs</InputAdornment>
                  ),
                }}
                error={!!errors.amount}
                helperText={errors.amount}
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Team Size
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={() =>
                    setFormData({
                      ...formData,
                      teamSize: Math.max(1, formData.teamSize - 1),
                    })
                  }
                >
                  <Remove />
                </IconButton>
                <Typography color={errors.teamSize ? "error" : "inherit"}>
                  {formData.teamSize}
                </Typography>
                <IconButton
                  onClick={() =>
                    setFormData({
                      ...formData,
                      teamSize: formData.teamSize + 1,
                    })
                  }
                >
                  <Add />
                </IconButton>
              </Box>
              {errors.teamSize && (
                <Typography variant="caption" color="error">
                  {errors.teamSize}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Collaboration Preferences */}
          <Typography variant="h6" gutterBottom>
            Collaboration Preferences
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.collaborationPreferences.remoteAllowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaborationPreferences: {
                        ...formData.collaborationPreferences,
                        remoteAllowed: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Remote collaboration allowed"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.collaborationPreferences.requiresNDA}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaborationPreferences: {
                        ...formData.collaborationPreferences,
                        requiresNDA: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Requires NDA"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.collaborationPreferences.openForStudents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaborationPreferences: {
                        ...formData.collaborationPreferences,
                        openForStudents: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Open for student collaborations"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    formData.collaborationPreferences.openForProfessionals
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaborationPreferences: {
                        ...formData.collaborationPreferences,
                        openForProfessionals: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Open for professional collaborations"
            />
          </Box>

          {/* Supporting Docs */}
          <Typography variant="h6" gutterBottom>
            Supporting Documents
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mb: 3 }}
          >
            Upload Project Brief
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          {formData.supportingDocuments && (
            <Typography sx={{ mb: 2 }}>
              Selected file: {formData.supportingDocuments.name}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleBack}>Back</Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleSubmit}
            >
              Publish Project
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProjectPosting;
