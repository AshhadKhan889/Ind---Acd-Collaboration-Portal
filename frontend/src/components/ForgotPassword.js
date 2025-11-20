import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { FaEnvelope } from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });
      setMessage(
        res.data.message ||
          "Password reset link sent to your email! Please check your inbox."
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to connect to server. Please try again.";
      setMessage(errorMessage);
      setIsError(true);
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

      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 3,
          color: "#03080cff",
        }}
      >
        Forgot Password
      </Typography>

      {message && (
        <Alert
          severity={isError ? "error" : "success"}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          {message}
        </Alert>
      )}

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: "8px" }}>
        Email Address:
      </Typography>
      <TextField
        fullWidth
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email"
        sx={{ mb: "16px" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaEnvelope style={{ color: "#555" }} />
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={loading}
        sx={{
          backgroundColor: "#1976d2",
          py: "10px",
          mb: 2,
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": { backgroundColor: "#1565c0" },
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Send Reset Link"
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

export default ForgotPassword;
