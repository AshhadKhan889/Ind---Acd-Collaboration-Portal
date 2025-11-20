import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Chip,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel,
} from "@mui/material";
import { FaCheckCircle } from "react-icons/fa";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: "",
    birthMonth: "",
    birthYear: "",
    postalAddress: "",
    city: "",
    province: "",
    cellPhone: "",
    description: "",
    organization: "",
    expertise: "",
    skills: [],
    currentSkill: "",
    degree: "",
    institute: "",
    country: "",
    cgpa: "",
    graduationYear: "",
  });

  const months = [
    "January","February","March","April","May","June","July",
    "August","September","October","November","December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const cities = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"];
  const provinces = ["Sindh", "Punjab", "KPK", "Balochistan", "Gilgit-Baltistan"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    const trimmedSkill = formData.currentSkill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmedSkill],
        currentSkill: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return alert("You are not logged in. Please log in first.");

      const payload = {
        gender: formData.gender === "male" ? "Male" : "Female",
        dateOfBirth: { month: formData.birthMonth, year: formData.birthYear },
        postalAddress: formData.postalAddress,
        city: formData.city,
        province: formData.province,
        cellPhone: formData.cellPhone,
        currentOrganization: formData.organization,
        professionalSummary: formData.description,
        areaOfExpertise: formData.expertise,
        skills: formData.skills,
        academicQualification: {
          degree: formData.degree,
          institute: formData.institute,
          country: formData.country,
          cgpa: formData.cgpa,
          yearOfCompletion: formData.graduationYear,
        },
      };

      const res = await axios.post(
        "http://localhost:5000/api/profile",
        payload,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );

      alert("Profile saved successfully!");

      // 1️⃣ Update stored user
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      user.profileCompleted = true;

      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // 2️⃣ Redirect to role-based dashboard
      switch (user.role) {
        case "Admin":
          navigate("/dashboard/admin", { replace: true });
          break;
        case "Industry Official":
          navigate("/dashboard/industry-official", { replace: true });
          break;
        case "Academia":
          navigate("/dashboard/academia", { replace: true });
          break;
        case "Student":
          navigate("/dashboard/student", { replace: true });
          break;
        default:
          navigate("/unauthorized", { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to save profile.");
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "2rem auto", padding: "2rem", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        <FaCheckCircle style={{ color: "#4CAF50", marginRight: "0.5rem" }} />
        Complete Your Profile
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <Typography variant="h5" sx={{ mb: 3, color: "#1976d2" }}>Personal Information</Typography>
        <FormControl component="fieldset" sx={{ mb: 3 }} required>
          <FormLabel>Gender</FormLabel>
          <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="female" control={<Radio />} label="Female" />
          </RadioGroup>
        </FormControl>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Month</InputLabel>
            <Select name="birthMonth" value={formData.birthMonth} onChange={handleChange} label="Month">
              {months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Year</InputLabel>
            <Select name="birthYear" value={formData.birthYear} onChange={handleChange} label="Year">
              {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TextField fullWidth label="Postal Address" name="postalAddress" value={formData.postalAddress} onChange={handleChange} sx={{ mb: 3 }} required multiline rows={3} />
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>City</InputLabel>
            <Select name="city" value={formData.city} onChange={handleChange} label="City">
              {cities.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Province</InputLabel>
            <Select name="province" value={formData.province} onChange={handleChange} label="Province">
              {provinces.map((province) => <MenuItem key={province} value={province}>{province}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TextField fullWidth label="Cell Phone" name="cellPhone" value={formData.cellPhone} onChange={handleChange} sx={{ mb: 3 }} required placeholder="9234511122247" inputProps={{ pattern: "^92[0-9]{10}$" }} helperText="Format: 9234511122247" />
        <TextField fullWidth label="Current Organization" name="organization" value={formData.organization} onChange={handleChange} sx={{ mb: 3 }} required />
        <TextField fullWidth label="Professional Summary" name="description" value={formData.description} onChange={handleChange} sx={{ mb: 3 }} required multiline rows={4} />
        <TextField fullWidth label="Area of Expertise and Interest" name="expertise" value={formData.expertise} onChange={handleChange} sx={{ mb: 3 }} required multiline rows={3} />

        <Typography variant="h6" sx={{ mb: 2 }}>Skill Set</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField fullWidth value={formData.currentSkill} onChange={(e) => setFormData({ ...formData, currentSkill: e.target.value })} placeholder="Add skill" />
          <Button variant="outlined" onClick={handleAddSkill} sx={{ whiteSpace: "nowrap" }}>Add Skill</Button>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {formData.skills.map((skill, i) => (
            <Chip key={i} label={skill} onDelete={() => setFormData({ ...formData, skills: formData.skills.filter((_, index) => index !== i) })} />
          ))}
        </Box>

        <Typography variant="h5" sx={{ mb: 3, color: "#1976d2" }}>Academic Qualification</Typography>
        <TextField fullWidth label="Degree" name="degree" value={formData.degree} onChange={handleChange} sx={{ mb: 3 }} required />
        <TextField fullWidth label="Institute" name="institute" value={formData.institute} onChange={handleChange} sx={{ mb: 3 }} required />
        <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} sx={{ mb: 3 }} required />
        <TextField fullWidth label="CGPA / Percentage" name="cgpa" value={formData.cgpa} onChange={handleChange} sx={{ mb: 3 }} required />
        <FormControl fullWidth sx={{ mb: 3 }} required>
          <InputLabel>Year of Completion</InputLabel>
          <Select name="graduationYear" value={formData.graduationYear} onChange={handleChange} label="Year of Completion">
            {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </Select>
        </FormControl>

        <Divider sx={{ my: 3 }} />
        <Button fullWidth variant="contained" type="submit" size="large" sx={{ backgroundColor: "#1976d2", py: 1.5, fontSize: "1rem", "&:hover": { backgroundColor: "#1565c0" } }}>
          Complete Profile
        </Button>
      </form>
    </Box>
  );
};

export default ProfileCompletion;
