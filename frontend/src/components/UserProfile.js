import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Divider,
  Grid,
  Chip,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";

const UserProfile = () => {
  const { id } = useParams(); // User ID from route
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    gender: "",
    city: "",
    province: "",
    cellPhone: "",
    postalAddress: "",
    currentOrganization: "",
    professionalSummary: "",
    areaOfExpertise: "",
    skills: "",
    degree: "",
    institute: "",
    cgpa: "",
    yearOfCompletion: "",
    birthMonth: "",
    birthYear: "",
  });

  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch profile info
        const profileRes = await axios.get(`/api/users/profile/${id}`, { headers });
        setProfile(profileRes.data);

        // Fetch professional history
        const historyRes = await axios.get(`/api/professional-history/user/${id}`, { headers });
        setHistory(historyRes.data || []);
      } catch (err) {
        console.error("Error fetching profile or history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, [id]);

  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  const isOwner = loggedInUser?.id === id;

  const startEditing = () => {
    const details = profile?.profile || {};
    setForm({
      gender: details.gender || "",
      city: details.city || "",
      province: details.province || "",
      cellPhone: details.cellPhone || "",
      postalAddress: details.postalAddress || "",
      currentOrganization: details.currentOrganization || "",
      professionalSummary: details.professionalSummary || "",
      areaOfExpertise: details.areaOfExpertise || "",
      skills: Array.isArray(details.skills) ? details.skills.join(", ") : "",
      degree: details.academicQualification?.degree || "",
      institute: details.academicQualification?.institute || "",
      cgpa: details.academicQualification?.cgpa || "",
      yearOfCompletion: details.academicQualification?.yearOfCompletion || "",
      birthMonth: details.dateOfBirth?.month || "",
      birthYear: details.dateOfBirth?.year || "",
    });
    setEditMode(true);
  };

  const cancelEditing = () => setEditMode(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitUpdate = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        gender: form.gender,
        dateOfBirth: { month: form.birthMonth, year: form.birthYear },
        postalAddress: form.postalAddress,
        city: form.city,
        province: form.province,
        cellPhone: form.cellPhone,
        currentOrganization: form.currentOrganization,
        professionalSummary: form.professionalSummary,
        areaOfExpertise: form.areaOfExpertise,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        academicQualification: {
          degree: form.degree,
          institute: form.institute,
          cgpa: form.cgpa,
          yearOfCompletion: form.yearOfCompletion,
        },
      };

      await axios.post(
        "/api/profile",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh view data
      const headers = { Authorization: `Bearer ${token}` };
      const profileRes = await axios.get(`/api/users/profile/${id}`, { headers });
      setProfile(profileRes.data);
      setEditMode(false);
    } catch (e) {
      console.error("Failed to update profile", e);
      alert(e.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );

  if (!profile)
    return (
      <Typography textAlign="center" mt={5} variant="h6">
        Profile not found
      </Typography>
    );

  const { fullName, email, roleID, institute, profile: details } = profile;

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Box sx={{ width: "70%" }}>
        {/* Profile Info */}
        <Card sx={{ p: 3, mb: 5, boxShadow: 6, borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
              <Box>
              <Typography variant="h4" fontWeight="bold">{fullName}</Typography>
              <Typography color="text.secondary">{email}</Typography>
              <Typography color="text.secondary">{roleID} — {institute}</Typography>
              </Box>
              {isOwner && !editMode && (
                <Button variant="contained" onClick={startEditing}>Edit</Button>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>Profile Information</Typography>
            {!editMode ? (
              details ? (
                <Stack spacing={1}>
                  <Typography><strong>Gender:</strong> {details.gender || "N/A"}</Typography>
                  <Typography><strong>City:</strong> {details.city || "N/A"}</Typography>
                  <Typography><strong>Province:</strong> {details.province || "N/A"}</Typography>
                  <Typography><strong>Phone:</strong> {details.cellPhone || "N/A"}</Typography>
                  <Typography><strong>Organization:</strong> {details.currentOrganization || "N/A"}</Typography>
                  <Typography><strong>Summary:</strong> {details.professionalSummary || "N/A"}</Typography>
                  <Typography><strong>Area of Expertise:</strong> {details.areaOfExpertise || "N/A"}</Typography>

                  {details.skills?.length > 0 && (
                    <Box mt={1}>
                      <Typography fontWeight="bold">Skills:</Typography>
                      <Stack direction="row" flexWrap="wrap" spacing={1} mt={0.5}>
                        {details.skills.map((skill, idx) => (
                          <Chip key={idx} label={skill} color="primary" variant="outlined" sx={{ mb: 1 }} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {details.academicQualification && (
                    <Box mt={3} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>Academic Qualification</Typography>
                      <Typography><strong>Degree:</strong> {details.academicQualification.degree}</Typography>
                      <Typography><strong>Institute:</strong> {details.academicQualification.institute}</Typography>
                      <Typography><strong>CGPA:</strong> {details.academicQualification.cgpa}</Typography>
                      <Typography><strong>Year of Completion:</strong> {details.academicQualification.yearOfCompletion}</Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography>No detailed profile information available.</Typography>
              )
            ) : (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Gender" value={form.gender} onChange={handleChange("gender")} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Birth Month" value={form.birthMonth} onChange={handleChange("birthMonth")} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Birth Year" value={form.birthYear} onChange={handleChange("birthYear")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Postal Address" value={form.postalAddress} onChange={handleChange("postalAddress")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="City" value={form.city} onChange={handleChange("city")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Province" value={form.province} onChange={handleChange("province")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" value={form.cellPhone} onChange={handleChange("cellPhone")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Organization" value={form.currentOrganization} onChange={handleChange("currentOrganization")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={3} label="Professional Summary" value={form.professionalSummary} onChange={handleChange("professionalSummary")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Area of Expertise" value={form.areaOfExpertise} onChange={handleChange("areaOfExpertise")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Skills (comma separated)" value={form.skills} onChange={handleChange("skills")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Degree" value={form.degree} onChange={handleChange("degree")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Institute" value={form.institute} onChange={handleChange("institute")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="CGPA" value={form.cgpa} onChange={handleChange("cgpa")} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Year of Completion" value={form.yearOfCompletion} onChange={handleChange("yearOfCompletion")} />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={submitUpdate}>Save</Button>
                  <Button variant="text" onClick={cancelEditing}>Cancel</Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Professional History */}
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={2}>Professional History</Typography>
          {history.length > 0 ? (
            <Grid container spacing={2}>
              {history.map((item, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{item.designation}</Typography>
                      <Typography color="text.secondary">{item.organization}</Typography>
                      <Typography color="text.secondary">
                        {new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : "Present"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No professional history available.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
