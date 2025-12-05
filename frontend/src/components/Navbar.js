import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  InputBase,
  Box,
} from "@mui/material";
import {
  Notifications,
  Dashboard,
  Work,
  Search as SearchIcon,
  Home,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifAnchor, setNotifAnchor] = React.useState(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState([]);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // ✅ Get logged-in user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || "student";

  // ✅ Normalize role
  const role = userRole.toLowerCase().trim();

  // ✅ Roles allowed to POST
  const allowedToPost = ["admin", "academia", "industry official"];

  // ✅ Function to decide dashboard route
  const getDashboardPath = () => {
    switch (role) {
      case "admin":
        return "/dashboard/admin";
      case "student":
        return "/dashboard/student";
      case "industry":
      case "industry-official":
      case "industry official":
        return "/dashboard/industry-official";
      case "academia":
        return "/dashboard/academia";
      default:
        return "/home-page";
    }
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleOpenNotifications = async (event) => {
    setNotifAnchor(event.currentTarget);
    try {
      const token = localStorage.getItem("token");
      const [listRes, countRes] = await Promise.all([
        axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setNotifications(listRes.data.notifications || []);
      setUnreadCount(countRes.data.count || 0);
    } catch (e) {
      // silent
    }
  };

  const handleCloseNotifications = () => setNotifAnchor(null);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/notifications/mark-all-read",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(0);
      // Clear all notifications from the display when marked as read
      setNotifications([]);
    } catch {}
  };

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(() => {});
  }, []);

  // ✅ Logout clears storage and redirects
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#4CAF50",
        boxShadow: "none",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            fontSize: "1.5rem",
            letterSpacing: "0.5px",
            color: "white",
            display: { xs: "none", sm: "block" },
          }}
        >
          Ind-Acd Collaboration Portal
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          {/* Common Navigation for all roles */}
          <Button
            component={Link}
            to="/home-page"
            color="inherit"
            startIcon={<Home />}
            sx={{ mx: 1 }}
          >
            Home
          </Button>

          {/* ✅ Role-based Dashboard */}
          <Button
            component={Link}
            to={getDashboardPath()}
            color="inherit"
            startIcon={<Dashboard />}
            sx={{ mx: 1 }}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/view"
            startIcon={<Work />}
            sx={{ mx: 1 }}
          >
            Opportunities
          </Button>

          {/* ✅ Show Post only if role is allowed */}
          {allowedToPost.includes(role) && (
            <Button
              color="inherit"
              component={Link}
              to="/post"
              startIcon={<Work />}
              sx={{ mx: 1 }}
            >
              Post
            </Button>
          )}
        </Box>

        {/* Notification Icon */}
        <IconButton
          color="inherit"
          sx={{ mx: 1 }}
          onClick={handleOpenNotifications}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleCloseNotifications}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={markAllRead}>Mark all as read</MenuItem>
          {notifications.filter((n) => !n.read).length === 0 && (
            <MenuItem disabled>No notifications</MenuItem>
          )}
          {notifications.filter((n) => !n.read).map((n) => (
            <MenuItem
              key={n._id}
              onClick={() => {
                handleCloseNotifications();
                if (n.link) navigate(n.link);
              }}
              sx={{ opacity: n.read ? 0.7 : 1 }}
            >
              <Box>
                <Typography variant="subtitle2">{n.title}</Typography>
                <Typography variant="body2">{n.message}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* User Profile */}
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: "white", color: "#4CAF50" }}
          >
            {role.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={open}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              navigate(`/profile/${user?.id}`);
            }}
          >
            My Profile
          </MenuItem>
          {allowedToPost.includes(role) && (
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/my-jobs");
              }}
            >
              My Jobs
            </MenuItem>
          )}
          {(role === "industry official" || role === "Industry Official") && (
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/industry-submissions");
              }}
            >
              Student Submissions
            </MenuItem>
          )}
          {role === "student" && (
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/applications");
              }}
            >
              My Applications
            </MenuItem>
          )}

          {role === "student" && (
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/history");
              }}
            >
              Professional History
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/forum");
            }}
          >
            Forums
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
