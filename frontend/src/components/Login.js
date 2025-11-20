import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
  Alert,
  Autocomplete,
} from "@mui/material";
import { FaUser, FaLock, FaUniversity, FaCog } from "react-icons/fa";

const Login = () => {
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [institute, setInstitute] = useState("");
  const [role, setRole] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const instituteOptions = [
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
  ];

  useEffect(() => {
    const savedLogin = localStorage.getItem("rememberedLogin");
    if (savedLogin) {
      try {
        const parsed = JSON.parse(savedLogin);
        setEnrollment(parsed.enrollment || "");
        setPassword(parsed.password || "");
        setInstitute(parsed.institute || "");
        setRole(parsed.role || "");
        setRememberMe(true);
      } catch {
        localStorage.removeItem("rememberedLogin");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: enrollment,
          password,
          institute,
          roleID: role,
          rememberMe,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Request failed`);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("lastActivityTime", Date.now().toString());

      if (rememberMe) {
        localStorage.setItem(
          "rememberedLogin",
          JSON.stringify({
            enrollment,
            password,
            institute,
            role,
          })
        );
      } else {
        localStorage.removeItem("rememberedLogin");
      }

      const userRole = data.user?.roleID || data.user?.role;
      const profileCompleted = data.user?.profileCompleted || false;

      if (!profileCompleted) {
        navigate("/complete-profile", { replace: true });
      } else {
        switch (userRole) {
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
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "24px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "white",
      }}
    >
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Username */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        Username:
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter Your Username"
        value={enrollment}
        onChange={(e) => setEnrollment(e.target.value)}
        sx={{ mb: "16px" }}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaUser style={{ color: "#555" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Password */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        Password:
      </Typography>
      <TextField
        fullWidth
        type="password"
        variant="outlined"
        placeholder="**********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: "16px" }}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaLock style={{ color: "#555" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Institute */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        Institute:
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: "16px" }}>
        <FaUniversity style={{ marginRight: "8px", color: "#555" }} />
        <Autocomplete
          options={instituteOptions}
          value={institute}
          onChange={(e, newValue) => setInstitute(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search or Select Institute"
              fullWidth
            />
          )}
          freeSolo
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Role */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        Role:
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: "16px" }}>
        <FaCog style={{ marginRight: "8px", color: "#555" }} />
        <Autocomplete
          options={["Student", "Academia", "Industry Official", "Admin"]}
          value={role}
          onChange={(e, newValue) => setRole(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Role" fullWidth />
          )}
          sx={{ flex: 1 }}
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            color="primary"
          />
        }
        label="Remember me"
        sx={{ mb: "16px" }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{
          backgroundColor: "#1976d2",
          py: "10px",
          mb: "8px",
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": { backgroundColor: "#1565c0" },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.875rem",
        }}
      >
        <Button
          component={Link}
          to="/register"
          sx={{ textTransform: "none", color: "#1976d2" }}
        >
          New User?
        </Button>
        <Button
          component={Link}
          to="/forgot-password"
          sx={{ textTransform: "none", color: "#1976d2" }}
        >
          Forgot Password?
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
