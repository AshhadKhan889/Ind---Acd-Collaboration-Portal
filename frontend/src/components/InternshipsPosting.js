import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const InternshipPosting = ({ currentUserId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_id: currentUserId || "",
    organization: "",
    title: "",
    description: "",
    type: "summer",
    keywords: [],
    currentKeyword: "",
    target_audience: [],
    start_date: "",
    end_date: "",
    last_date_to_apply: "",
    supporting_docs: null,
    skills: [],
    currentSkill: "",
    education: [],
    stipend: [1000, 3000],
    locationType: "hybrid",
    specificLocation: "",
    benefits: [],
  });

  const navigate = useNavigate();

  // ✅ Step validation function
  const validateStep = () => {
    let newErrors = {};

    if (activeStep === 0) {
      if (!formData.organization.trim())
        newErrors.organization = "Organization name is required";
      if (!formData.title.trim())
        newErrors.title = "Internship title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
    }

    if (activeStep === 1) {
      if (formData.target_audience.length === 0)
        newErrors.target_audience = "Select at least one target major";
      if (formData.keywords.length === 0)
        newErrors.keywords = "Add at least one keyword";
      if (formData.skills.length === 0)
        newErrors.skills = "Add at least one required skill";
      if (formData.education.length === 0)
        newErrors.education = "Select at least one education level";
    }

    if (activeStep === 2) {
      if (!formData.start_date) newErrors.start_date = "Start date is required";
      if (!formData.end_date) newErrors.end_date = "End date is required";
      if (!formData.last_date_to_apply)
        newErrors.last_date_to_apply = "Application deadline required";

      if (formData.start_date && formData.end_date) {
        const s = new Date(formData.start_date);
        const e = new Date(formData.end_date);
        if (e <= s)
          newErrors.end_date = "End date must be after the start date";
      }

      if (formData.last_date_to_apply && formData.start_date) {
        const deadline = new Date(formData.last_date_to_apply);
        const start = new Date(formData.start_date);
        if (deadline >= start)
          newErrors.last_date_to_apply =
            "Deadline must be before the internship start date";
      }

      const min = parseFloat(formData.stipend[0]);
      const max = parseFloat(formData.stipend[1]);
      if (isNaN(min)) newErrors.stipendMin = "Minimum stipend must be a number";
      if (isNaN(max)) newErrors.stipendMax = "Maximum stipend must be a number";
      if (!isNaN(min) && !isNaN(max) && max < min)
        newErrors.stipendMax = "Maximum stipend must be greater than minimum";

      if (!formData.locationType)
        newErrors.locationType = "Select a work location type";
      if (
        formData.locationType !== "remote" &&
        !formData.specificLocation.trim()
      )
        newErrors.specificLocation =
          "Office location required for on-site/hybrid roles";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFileUpload = (e) => {
    setFormData({ ...formData, supporting_docs: e.target.files[0] });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return; // ✅ Ensure final validation before submit

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to post an internship.");
        return;
      }

      const fd = new FormData();
      fd.append("organization", formData.organization);
      fd.append("title", formData.title);
      fd.append("description", formData.description);

      const typeMap = {
        summer: "SUMMER",
        fall: "FALL",
        spring: "SPRING",
        "year-round": "YEAR-ROUND",
      };
      fd.append(
        "internshipType",
        typeMap[formData.type] || formData.type.toUpperCase()
      );

      formData.target_audience.forEach((m) => fd.append("targetMajors", m));
      formData.keywords.forEach((k) => fd.append("keywords", k));
      formData.skills.forEach((s) => fd.append("requiredSkills", s));
      formData.education.forEach((e) => fd.append("educationRequirements", e));
      formData.benefits.forEach((b) => fd.append("benefits", b));

      if (formData.start_date) fd.append("startDate", formData.start_date);
      if (formData.end_date) fd.append("endDate", formData.end_date);
      if (formData.last_date_to_apply)
        fd.append("applicationDeadline", formData.last_date_to_apply);

      fd.append("stipend[min]", formData.stipend[0]);
      fd.append("stipend[max]", formData.stipend[1]);

      const locMap = { remote: "REMOTE", hybrid: "HYBRID", onsite: "ON-SITE" };
      fd.append("workLocation", locMap[formData.locationType] || "HYBRID");
      if (formData.specificLocation)
        fd.append("officeLocation", formData.specificLocation);

      if (formData.supporting_docs)
        fd.append("supportingDocuments", formData.supporting_docs);

      const res = await fetch("http://localhost:5000/api/internships", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const result = await res.json();
      if (!res.ok) {
        alert("Failed: " + (result.error || result.message));
        return;
      }

      alert("✅ Internship posted successfully!");
      const internship = result.internship || result;
      navigate(`/internship-details/${internship._id}`, { state: internship });
    } catch (err) {
      console.error("Error creating internship:", err);
      alert("Something went wrong: " + err.message);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Post an Internship
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Requirements</StepLabel>
        </Step>
        <Step>
          <StepLabel>Publish</StepLabel>
        </Step>
      </Stepper>

      {/* ---------------- STEP 0 ---------------- */}
      {activeStep === 0 && (
        <Box>
          <TextField
            fullWidth
            label="Organization Name"
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            error={!!errors.organization}
            helperText={
              errors.organization
            }
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Internship Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={!!errors.title}
            helperText={errors.title}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={6}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            error={!!errors.description}
            helperText={
              errors.description
            }
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Internship Type
          </Typography>
          <ToggleButtonGroup
            value={formData.type}
            exclusive
            onChange={(e, newValue) =>
              setFormData({ ...formData, type: newValue })
            }
            sx={{ mb: 3 }}
          >
            <ToggleButton value="summer">Summer</ToggleButton>
            <ToggleButton value="fall">Fall</ToggleButton>
            <ToggleButton value="spring">Spring</ToggleButton>
            <ToggleButton value="year-round">Year-round</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* ---------------- STEP 1 ---------------- */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Target Majors
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
            {[
              "Computer Science",
              "Engineering",
              "Business",
              "Design",
              "Mathematics",
            ].map((major) => (
              <FormControlLabel
                key={major}
                control={
                  <Checkbox
                    checked={formData.target_audience.includes(major)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setFormData({
                          ...formData,
                          target_audience: [...formData.target_audience, major],
                        });
                      else
                        setFormData({
                          ...formData,
                          target_audience: formData.target_audience.filter(
                            (m) => m !== major
                          ),
                        });
                    }}
                  />
                }
                label={major}
              />
            ))}
          </Box>
          {errors.target_audience && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.target_audience}
            </Typography>
          )}

          <Typography variant="h6" gutterBottom>
            Keywords
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              value={formData.currentKeyword}
              onChange={(e) =>
                setFormData({ ...formData, currentKeyword: e.target.value })
              }
              placeholder="Add keyword"
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (formData.currentKeyword.trim()) {
                  setFormData({
                    ...formData,
                    keywords: [
                      ...formData.keywords,
                      formData.currentKeyword.trim(),
                    ],
                    currentKeyword: "",
                  });
                }
              }}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {formData.keywords.map((k, i) => (
              <Chip
                key={i}
                label={k}
                onDelete={() =>
                  setFormData({
                    ...formData,
                    keywords: formData.keywords.filter(
                      (_, index) => index !== i
                    ),
                  })
                }
              />
            ))}
          </Box>
          {errors.keywords && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.keywords}
            </Typography>
          )}

          <Typography variant="h6" gutterBottom>
            Required Skills
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              value={formData.currentSkill}
              onChange={(e) =>
                setFormData({ ...formData, currentSkill: e.target.value })
              }
              placeholder="Add required skills"
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (formData.currentSkill.trim()) {
                  setFormData({
                    ...formData,
                    skills: [...formData.skills, formData.currentSkill.trim()],
                    currentSkill: "",
                  });
                }
              }}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {formData.skills.map((s, i) => (
              <Chip
                key={i}
                label={s}
                onDelete={() =>
                  setFormData({
                    ...formData,
                    skills: formData.skills.filter((_, index) => index !== i),
                  })
                }
              />
            ))}
          </Box>
          {errors.skills && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.skills}
            </Typography>
          )}

          <Typography variant="h6" gutterBottom>
            Education Requirements
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
            {["High School", "Bachelor's", "Master's", "PhD"].map((deg) => (
              <FormControlLabel
                key={deg}
                control={
                  <Checkbox
                    checked={formData.education.includes(deg)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setFormData({
                          ...formData,
                          education: [...formData.education, deg],
                        });
                      else
                        setFormData({
                          ...formData,
                          education: formData.education.filter(
                            (d) => d !== deg
                          ),
                        });
                    }}
                  />
                }
                label={deg}
              />
            ))}
          </Box>
          {errors.education && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.education}
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

      {/* ---------------- STEP 2 ---------------- */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Timeline
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.start_date}
              helperText={errors.start_date}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.end_date}
              helperText={errors.end_date}
            />
          </Box>
          <TextField
            fullWidth
            label="Application Deadline"
            type="date"
            value={formData.last_date_to_apply}
            onChange={(e) =>
              setFormData({ ...formData, last_date_to_apply: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            error={!!errors.last_date_to_apply}
            helperText={errors.last_date_to_apply}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Stipend
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Minimum"
              value={formData.stipend[0]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stipend: [e.target.value, formData.stipend[1]],
                })
              }
              error={!!errors.stipendMin}
              helperText={errors.stipendMin}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rs</InputAdornment>
                ),
              }}
            />
            <TextField
              label="Maximum"
              value={formData.stipend[1]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stipend: [formData.stipend[0], e.target.value],
                })
              }
              error={!!errors.stipendMax}
              helperText={errors.stipendMax}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rs</InputAdornment>
                ),
              }}
            />
          </Box>

          <Typography variant="h6" gutterBottom>
            Work Location
          </Typography>
          <ToggleButtonGroup
            value={formData.locationType}
            exclusive
            onChange={(e, newValue) =>
              setFormData({ ...formData, locationType: newValue })
            }
            sx={{ mb: 2 }}
          >
            <ToggleButton value="remote">Remote</ToggleButton>
            <ToggleButton value="hybrid">Hybrid</ToggleButton>
            <ToggleButton value="onsite">On-site</ToggleButton>
          </ToggleButtonGroup>
          {errors.locationType && (
            <Typography color="error" sx={{ mb: 1 }}>
              {errors.locationType}
            </Typography>
          )}
          {formData.locationType !== "remote" && (
            <TextField
              fullWidth
              label="Office Location"
              value={formData.specificLocation}
              onChange={(e) =>
                setFormData({ ...formData, specificLocation: e.target.value })
              }
              error={!!errors.specificLocation}
              helperText={errors.specificLocation}
              sx={{ mb: 3 }}
            />
          )}

          <Typography variant="h6" gutterBottom>
            Benefits
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {[
              "Housing Stipend",
              "Transportation",
              "Meal Allowance",
              "Flexible Hours",
              "Mentorship",
              "Networking Opportunities",
              "Potential Full-time Offer",
            ].map((benefit) => (
              <FormControlLabel
                key={benefit}
                control={
                  <Checkbox
                    checked={formData.benefits.includes(benefit)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setFormData({
                          ...formData,
                          benefits: [...formData.benefits, benefit],
                        });
                      else
                        setFormData({
                          ...formData,
                          benefits: formData.benefits.filter(
                            (b) => b !== benefit
                          ),
                        });
                    }}
                  />
                }
                label={benefit}
              />
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            Supporting Documents
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mb: 2 }}
          >
            Upload Additional Information
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          {formData.supporting_docs && (
            <Typography sx={{ mb: 2 }}>
              Selected file: {formData.supporting_docs.name}
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
              Publish Internship
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default InternshipPosting;
