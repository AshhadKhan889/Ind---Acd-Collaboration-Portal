// src/components/RecommendDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const RecommendDialog = ({ open, handleClose, opportunity }) => {
  const [note, setNote] = useState("");
  const [type, setType] = useState(opportunity?.type || "job");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(opportunity?.type || "job");
  }, [opportunity]);

  const handleRecommend = async () => {
    if (!opportunity) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/recommendations/recommend/${opportunity.id}`,
        { type, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Opportunity recommended!");
      handleClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to recommend opportunity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Recommend Opportunity</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {opportunity?.title}
        </Typography>

        <TextField
          fullWidth
          label="Note (optional)"
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
        >
          <MenuItem value="job">Job</MenuItem>
          <MenuItem value="internship">Internship</MenuItem>
          <MenuItem value="project">Project</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleRecommend}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={20} /> : "Recommend"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecommendDialog;
