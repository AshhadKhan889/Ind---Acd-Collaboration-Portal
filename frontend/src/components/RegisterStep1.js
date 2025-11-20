import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import {
  FaEnvelope,
  FaUser,
  FaLock,
  FaCog,
  FaUniversity,
} from "react-icons/fa";

const RegisterStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    roleID: "",
    institute: "",
    isRemembered: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.roleID) newErrors.roleID = "Role is required";
    if (!formData.institute) newErrors.institute = "Institute is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          roleID: formData.roleID,
          institute: formData.institute,
          isRemembered: formData.isRemembered,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      // Show success message and redirect to resend activation page
      alert(data.message);
      navigate("/resend-activation", {
        state: { email: formData.email },
        replace: true,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        p: 4,
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 3, fontWeight: "medium" }}
      >
        Create Your Account
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Username *
        </Typography>
        <TextField
          fullWidth
          name="username"
          placeholder="Enter Your Username"
          value={formData.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ color: "action.active", mr: 1 }}
              >
                <FaUser />
              </InputAdornment>
            ),
          }}
        />

        {/* Email */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Email Address *
        </Typography>
        <TextField
          fullWidth
          name="email"
          type="email"
          placeholder="Enter Your Email Address"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ color: "action.active", mr: 1 }}
              >
                <FaEnvelope />
              </InputAdornment>
            ),
          }}
        />

        {/* Full Name */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Full Name *
        </Typography>
        <TextField
          fullWidth
          name="fullName"
          placeholder="Enter Your Name"
          value={formData.fullName}
          onChange={handleChange}
          error={!!errors.fullName}
          helperText={errors.fullName}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ color: "action.active", mr: 1 }}
              >
                <FaUser />
              </InputAdornment>
            ),
          }}
        />

        {/* Password */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Password * (min 8 characters)
        </Typography>
        <TextField
          fullWidth
          name="password"
          type="password"
          placeholder="Enter Your Password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ color: "action.active", mr: 1 }}
              >
                <FaLock />
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Confirm Password *
        </Typography>
        <TextField
          fullWidth
          name="confirmPassword"
          type="password"
          placeholder="Confirm Your Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ color: "action.active", mr: 1 }}
              >
                <FaLock />
              </InputAdornment>
            ),
          }}
        />

        {/* Role */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
          Role:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: "16px" }}>
          <Autocomplete
            options={["Student", "Academia", "Industry Official", "Admin"]}
            value={formData.roleID || ""}
            onChange={(e, newValue) =>
              handleChange({ target: { name: "roleID", value: newValue } })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Role"
                fullWidth
                error={!!errors.roleID}
                helperText={errors.roleID}
              />
            )}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* Institute */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Institute *
        </Typography>
        <Autocomplete
          options={[
            "Karachi Campus",
            "Islamabad Campus",
            // 🎓 Universities
            "National University of Sciences and Technology (Islamabad)",
            "Bahria University (Islamabad)",
            "Bahria University (Karachi)",
            "Bahria University (Lahore)",
            "COMSATS University (Islamabad)",
            "FAST National University of Computer and Emerging Sciences (Lahore)",
            "FAST National University of Computer and Emerging Sciences (Karachi)",
            "FAST National University of Computer and Emerging Sciences (Islamabad)",
            "FAST National University of Computer and Emerging Sciences (Peshawar)",
            "University of the Punjab (Lahore)",
            "Lahore University of Management Sciences (Lahore)",
            "Institute of Business Administration (Karachi)",
            "NED University of Engineering and Technology (Karachi)",
            "University of Karachi (Karachi)",
            "Ghulam Ishaq Khan Institute (Topi)",
            "Air University (Islamabad)",
            "Quaid-e-Azam University (Islamabad)",
            "University of Engineering and Technology (Lahore)",
            "Riphah International University (Islamabad)",
            "Sindh Madressatul Islam University (Karachi)",
            "University of Central Punjab (Lahore)",
            "Superior University (Lahore)",
            "Hamdard University (Karachi)",
            "Islamia University of Bahawalpur (Bahawalpur)",
            "University of Management and Technology (Lahore)",
            "Karachi Institute of Economics and Technology (Karachi)",
            "Muhammad Ali Jinnah University (Karachi)",
            "Institute of Space Technology (Islamabad)",
            "National Textile University (Faisalabad)",
            "University of Peshawar (Peshawar)",
            "Balochistan University of IT, Engineering and Management Sciences (Quetta)",
            "Sukkur IBA University (Sukkur)",
            "Virtual University of Pakistan (Lahore)",
            "Preston University (Islamabad)",
            "SZABIST (Karachi)",
            "SZABIST (Islamabad)",
            "SZABIST (Larkana)",

            // 💻 Tech & Software Companies
            "Systems Limited (Lahore)",
            "NETSOL Technologies (Lahore)",
            "10Pearls (Karachi)",
            "Arbisoft (Lahore)",
            "TRG Pakistan (Karachi)",
            "CureMD (Lahore)",
            "TPS Pakistan (Karachi)",
            "Techlogix (Lahore)",
            "Afiniti (Islamabad)",
            "Folio3 (Karachi)",
            "VentureDive (Karachi)",
            "Cubix (Karachi)",
            "Ibex Global (Karachi)",
            "Qbatch (Faisalabad)",
            "DevBatch (Lahore)",
            "Ovex Technologies (Islamabad)",
            "KalSoft (Karachi)",
            "Gaditek (Karachi)",
            "Tkxel (Lahore)",
            "NorthBay Solutions (Lahore)",
            "Conrad Labs (Lahore)",
            "Tintash (Lahore)",
            "Mindstorm Studios (Lahore)",
            "Emumba (Islamabad)",
            "Codematics (Abbottabad)",
            "Sofizar (Lahore)",

            // 🏢 Government & Public Sector
            "Pakistan Software Export Board (Islamabad)",
            "Ignite National Technology Fund (Islamabad)",
            "Higher Education Commission (Islamabad)",
            "Pakistan Telecommunication Authority (Islamabad)",
            "National IT Board (Islamabad)",
            "Ministry of IT and Telecommunication (Islamabad)",
            "Pakistan Atomic Energy Commission (Islamabad)",
            "Pakistan Council of Scientific and Industrial Research (Islamabad)",
            "National Engineering and Scientific Commission (Islamabad)",
            "National Incubation Center (Islamabad)",
            "National Incubation Center (Lahore)",
            "National Incubation Center (Karachi)",
            "National Incubation Center (Peshawar)",
            "National Incubation Center (Quetta)",
            "SUPARCO (Karachi)",
            "Pakistan Agricultural Research Council (Islamabad)",
            "Pakistan Council of Renewable Energy Technologies (Islamabad)",
            "Ministry of Science and Technology (Islamabad)",
            "Pakistan Standards and Quality Control Authority (Karachi)",

            // 🔬 Research & Innovation Centers
            "National Center for Artificial Intelligence (Islamabad)",
            "National Center for Robotics and Automation (Islamabad)",
            "National Center for Cyber Security (Islamabad)",
            "National Center for Big Data and Cloud Computing (Lahore)",
            "Plan9 Incubator – PITB (Lahore)",
            "NIC Karachi (Karachi)",
            "NIC Lahore (Lahore)",
            "NIC Islamabad (Islamabad)",
            "Center for Advanced Research in Engineering (Islamabad)",
            "Pak-Austria Fachhochschule Institute of Applied Sciences and Technology (Haripur)",

            // 🏭 Industrial & Corporate Sector
            "Engro Corporation (Karachi)",
            "Lucky Cement (Karachi)",
            "Fauji Fertilizer Company (Rawalpindi)",
            "Descon Engineering (Lahore)",
            "Telenor Pakistan (Islamabad)",
            "Jazz (Islamabad)",
            "Zong 4G (Islamabad)",
            "Ufone (Islamabad)",
            "PTCL (Islamabad)",
            "Unilever Pakistan (Karachi)",
            "Nestlé Pakistan (Lahore)",
            "Packages Ltd. (Lahore)",
            "Millat Tractors (Lahore)",
            "Atlas Honda (Karachi)",
            "Pakistan Petroleum Limited (Karachi)",
            "Pakistan State Oil (Karachi)",
            "Habib Bank Limited (Karachi)",
            "Meezan Bank (Karachi)",
            "Allied Bank Limited (Lahore)",
            "MCB Bank (Lahore)",
            "Askari Bank (Rawalpindi)",
            "Engro Foods (Karachi)",
            "K-Electric (Karachi)",
            "Dawlance (Karachi)",
            "Toyota Indus Motors (Karachi)",
            "Honda Atlas Cars (Lahore)",
            "Nishat Mills Limited (Lahore)",
            "Gul Ahmed Textile Mills (Karachi)",
            "Sapphire Group (Lahore)",
            "Coca-Cola Beverages Pakistan (Lahore)",
            "PepsiCo Pakistan (Lahore)",

            // ➕ Other
            "Other",
          ]}
          value={formData.institute || ""}
          onChange={(e, newValue) =>
            handleChange({ target: { name: "institute", value: newValue } })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search or Select Institute"
              error={!!errors.institute}
              helperText={errors.institute}
              fullWidth
            />
          )}
          sx={{ mb: 2 }}
          freeSolo
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          disabled={loading}
          sx={{
            backgroundColor: "#1976d2",
            py: 1.5,
            fontSize: "1rem",
            textTransform: "none",
            mb: 2,
            "&:hover": {
              backgroundColor: "#388E3C",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Register"
          )}
        </Button>
      </form>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Typography variant="body2">
          Already have an account?{" "}
          <Button
            component={Link}
            to="/Login"
            sx={{
              textTransform: "none",
              color: "#4CAF50",
              fontSize: "0.875rem",
              p: 0,
              minWidth: "auto",
            }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterStep1;
