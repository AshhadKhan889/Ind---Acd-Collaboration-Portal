import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaLock } from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
console.log("Reset Password API URL:", API_BASE_URL);

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password/${token}`,
        { newPassword }
      );

      setMessage(response.data.message || "Password reset successful!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleResetPassword}
      sx={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "24px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "white",
      }}
    >

      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 3,
          color: "#03080cff",
        }}
      >
        Reset Password
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        New Password:
      </Typography>
      <TextField
        label=""
        type="password"
        fullWidth
        margin="normal"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        sx={{ mb: "16px" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaLock style={{ color: "#555" }} />
            </InputAdornment>
          ),
        }}
      />

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        Confirm Password:
      </Typography>
      <TextField
        label=""
        type="password"
        fullWidth
        margin="normal"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        sx={{ mb: "16px" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaLock style={{ color: "#555" }} />
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        disabled={loading}
        sx={{
          mt: 2,
          py: "10px",
          mb: 2,
          textTransform: "none",
          fontSize: "1rem",
          backgroundColor: "#1976d2",
          "&:hover": { backgroundColor: "#1565c0" },
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Reset Password"
        )}
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          fontSize: "0.875rem",
        }}
      >
        <Button
          component={Link}
          to="/login"
          sx={{ textTransform: "none", color: "#1976d2" }}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
