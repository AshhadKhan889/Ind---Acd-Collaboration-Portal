import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const InternshipUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organization: "",
    type: "summer",
    keywords: [],
    currentKeyword: "",
    target_audience: [],
    requiredSkills: [],
    currentSkill: "",
    education: [],
    stipend: [1000, 3000],
    locationType: "hybrid",
    specificLocation: "",
    benefits: [],
    currentBenefit: "",
    start_date: "",
    end_date: "",
    last_date_to_apply: "",
    supporting_docs: null,
  });

  const [files, setFiles] = useState([]);

  // Fetch internship data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/internships/${id}`);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          organization: data.organization || "",
          type: data.internshipType?.toLowerCase() || "summer",
          keywords: data.keywords || [],
          currentKeyword: "",
          target_audience: data.targetMajors || [],
          requiredSkills: data.requiredSkills || [],
          currentSkill: "",
          education: data.educationRequirements || [],
          stipend: data.stipend
            ? [data.stipend.min, data.stipend.max]
            : [1000, 3000],
          locationType: data.workLocation?.toLowerCase() || "hybrid",
          specificLocation: data.officeLocation || "",
          benefits: data.benefits || [],
          currentBenefit: "",
          start_date: data.startDate ? data.startDate.slice(0, 10) : "",
          end_date: data.endDate ? data.endDate.slice(0, 10) : "",
          last_date_to_apply: data.applicationDeadline
            ? data.applicationDeadline.slice(0, 10)
            : "",
          supporting_docs: null,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      const fd = new FormData();

      // ✅ Simple string fields
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("organization", formData.organization);

      // ✅ Internship type (uppercase matches schema enum)
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

      // ✅ Arrays (schema: targetMajors, keywords, requiredSkills, educationRequirements, benefits)
      formData.target_audience.forEach((m) => fd.append("targetMajors", m));
      formData.keywords.forEach((k) => fd.append("keywords", k));
      formData.requiredSkills.forEach((s) => fd.append("requiredSkills", s));
      formData.education.forEach((e) => fd.append("educationRequirements", e));
      formData.benefits.forEach((b) => fd.append("benefits", b)); // ✅ fixed (was employeeBenefits)

      // ✅ Dates
      if (formData.start_date) fd.append("startDate", formData.start_date);
      if (formData.end_date) fd.append("endDate", formData.end_date);
      if (formData.last_date_to_apply)
        fd.append("applicationDeadline", formData.last_date_to_apply);

      // ✅ Stipend object (schema: stipend.min / stipend.max)
      fd.append("stipend[min]", formData.stipend[0]);
      fd.append("stipend[max]", formData.stipend[1]);

      // ✅ Location (schema: workLocation + officeLocation)
      const locMap = { remote: "REMOTE", hybrid: "HYBRID", onsite: "ON-SITE" };
      fd.append("workLocation", locMap[formData.locationType] || "HYBRID");
      if (formData.specificLocation)
        fd.append("officeLocation", formData.specificLocation);

      // ✅ Supporting documents
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          fd.append("supportingDocuments", files[i]);
        }
      }

      // ✅ Send request
      const { data } = await axios.put(`/api/internships/${id}`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) navigate(`/internship-details/${id}`);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Update Internship
        </Typography>

        {/* Title & Description */}
        <TextField
          label="Internship Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Organization"
          value={formData.organization}
          onChange={(e) =>
            setFormData({ ...formData, organization: e.target.value })
          }
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          multiline
          rows={4}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Internship Type */}
        <Typography variant="h6">Internship Type</Typography>
        <ToggleButtonGroup
          value={formData.type}
          exclusive
          onChange={(e, newVal) => setFormData({ ...formData, type: newVal })}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="summer">Summer</ToggleButton>
          <ToggleButton value="fall">Fall</ToggleButton>
          <ToggleButton value="spring">Spring</ToggleButton>
          <ToggleButton value="year-round">Year-round</ToggleButton>
        </ToggleButtonGroup>

        {/* Target Majors */}
        <Typography variant="h6">Target Majors</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
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
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        target_audience: [...formData.target_audience, major],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        target_audience: formData.target_audience.filter(
                          (m) => m !== major
                        ),
                      });
                    }
                  }}
                />
              }
              label={major}
            />
          ))}
        </Box>

        {/* Keywords */}
        <TextField
          placeholder="Add keyword"
          value={formData.currentKeyword}
          onChange={(e) =>
            setFormData({ ...formData, currentKeyword: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && formData.currentKeyword) {
              e.preventDefault();
              setFormData({
                ...formData,
                keywords: [...formData.keywords, formData.currentKeyword],
                currentKeyword: "",
              });
            }
          }}
          fullWidth
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {formData.keywords.map((k, i) => (
            <Chip
              key={i}
              label={k}
              onDelete={() =>
                setFormData({
                  ...formData,
                  keywords: formData.keywords.filter((_, idx) => idx !== i),
                })
              }
            />
          ))}
        </Box>

        {/* Skills */}
        <TextField
          placeholder="Add skill"
          value={formData.currentSkill}
          onChange={(e) =>
            setFormData({ ...formData, currentSkill: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && formData.currentSkill) {
              e.preventDefault();
              setFormData({
                ...formData,
                requiredSkills: [
                  ...formData.requiredSkills,
                  formData.currentSkill,
                ],
                currentSkill: "",
              });
            }
          }}
          fullWidth
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {formData.requiredSkills.map((s, i) => (
            <Chip
              key={i}
              label={s}
              onDelete={() =>
                setFormData({
                  ...formData,
                  requiredSkills: formData.requiredSkills.filter(
                    (_, idx) => idx !== i
                  ),
                })
              }
            />
          ))}
        </Box>

        {/* Education */}
        <Typography variant="h6">Education Requirements</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
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
                        education: formData.education.filter((d) => d !== deg),
                      });
                  }}
                />
              }
              label={deg}
            />
          ))}
        </Box>

        {/* Dates */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Application Deadline"
              type="date"
              value={formData.last_date_to_apply}
              onChange={(e) =>
                setFormData({ ...formData, last_date_to_apply: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Stipend */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Minimum"
              value={formData.stipend[0]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stipend: [e.target.value, formData.stipend[1]],
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Maximum"
              value={formData.stipend[1]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stipend: [formData.stipend[0], e.target.value],
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Location */}
        <Typography variant="h6">Work Location</Typography>
        <ToggleButtonGroup
          value={formData.locationType}
          exclusive
          onChange={(e, val) => setFormData({ ...formData, locationType: val })}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="remote">Remote</ToggleButton>
          <ToggleButton value="hybrid">Hybrid</ToggleButton>
          <ToggleButton value="onsite">On-site</ToggleButton>
        </ToggleButtonGroup>
        {formData.locationType !== "remote" && (
          <TextField
            label="Office Location"
            value={formData.specificLocation}
            onChange={(e) =>
              setFormData({ ...formData, specificLocation: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
        )}

        {/* Benefits */}
        {/* Benefits */}
        <Typography variant="h6">Benefits</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
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
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        benefits: [...formData.benefits, benefit],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        benefits: formData.benefits.filter(
                          (b) => b !== benefit
                        ),
                      });
                    }
                  }}
                />
              }
              label={benefit}
            />
          ))}
        </Box>

        {/* Supporting Docs */}
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          sx={{ mb: 2 }}
        >
          Upload Supporting Documents
          <input type="file" hidden multiple onChange={handleFileChange} />
        </Button>

        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Internship"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InternshipUpdatePage;
