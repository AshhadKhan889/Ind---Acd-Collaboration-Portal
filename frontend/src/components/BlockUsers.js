import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Exclude current admin from list
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const filteredUsers = res.data.filter(u => u._id !== currentUser._id);
      setUsers(filteredUsers);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUnblock = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      const url = `/api/admin/${action}/${userId}`;
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers(); // Refresh list after action
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} user.`);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Admin User Management</Typography>
        <Button variant="outlined" onClick={fetchUsers}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {users.length === 0 ? (
        <Typography>No users to display.</Typography>
      ) : (
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} md={6} key={user._id}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6">{user.fullName}</Typography>
                  <Typography>{user.email}</Typography>
                  <Typography>Role: {user.roleID}</Typography>
                  <Typography>Status: {user.status}</Typography>

                  {user.roleID !== "Admin" && (
                    <Button
                      variant="contained"
                      color={user.status === "active" ? "error" : "success"}
                      sx={{ mt: 2 }}
                      onClick={() =>
                        handleBlockUnblock(
                          user._id,
                          user.status === "active" ? "block" : "unblock"
                        )
                      }
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminUserManagement;
