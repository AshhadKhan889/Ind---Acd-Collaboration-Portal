import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const ProfessionalHistory = () => {
  const [history, setHistory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    organization: "",
    designation: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
  });

  // Fetch all histories from backend
  const fetchHistories = async () => {
    try {
      const res = await axios.get("/api/professional-history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setFormData({
        organization: history[index].organization,
        designation: history[index].designation,
        startDate: history[index].startDate.split("T")[0],
        endDate: history[index].endDate
          ? history[index].endDate.split("T")[0]
          : "",
        currentlyWorking: history[index].currentlyWorking || false,
      });
    } else {
      setEditingIndex(null);
      setFormData({
        organization: "",
        designation: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      if (editingIndex !== null) {
        // Update existing
        const res = await axios.put(
          `/api/professional-history/${history[editingIndex]._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedHistory = [...history];
        updatedHistory[editingIndex] = res.data;
        setHistory(updatedHistory);
      } else {
        // Add new
        const res = await axios.post("/api/professional-history", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHistory([...history, res.data]);
      }
      handleCloseDialog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`/api/professional-history/${history[index]._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedHistory = history.filter((_, i) => i !== index);
      setHistory(updatedHistory);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Professional History
      </Typography>

      <Button variant="contained" onClick={() => handleOpenDialog()}>
        + Add Experience
      </Button>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {history.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6">{item.designation}</Typography>
                    <Typography color="textSecondary">
                      {item.organization}
                    </Typography>
                    <Typography color="textSecondary">
                      {item.startDate.split("T")[0]} -{" "}
                      {item.endDate ? item.endDate.split("T")[0] : "Present"}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(index)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingIndex !== null ? "Edit Experience" : "Add Experience"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Designation"
            name="designation"
            fullWidth
            margin="normal"
            value={formData.designation}
            onChange={handleChange}
          />
          <TextField
            label="Organization"
            name="organization"
            fullWidth
            margin="normal"
            value={formData.organization}
            onChange={handleChange}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.currentlyWorking} // disable when currently working
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.currentlyWorking}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentlyWorking: e.target.checked,
                      })
                    }
                  />
                }
                label="Currently Working Here"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessionalHistory;
