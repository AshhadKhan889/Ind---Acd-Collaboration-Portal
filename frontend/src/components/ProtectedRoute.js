import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [shouldLogout, setShouldLogout] = useState(false);
  const location = useLocation();
  const STORAGE_KEY = 'lastActivityTime';
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    // Check inactivity on mount
    const checkInactivity = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      // Get storage based on where token is stored
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const lastActivity = storage.getItem(STORAGE_KEY);
      
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          // User has been inactive, clear everything
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem(STORAGE_KEY);
          setShouldLogout(true);
        }
      }
    };

    checkInactivity();
  }, []);

  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Not logged in or should logout due to inactivity → redirect to login
  if (!token || !user || shouldLogout) return <Navigate to="/login" replace />;

  // Redirect to complete-profile if profile not completed, but only if not already on /complete-profile
  if (!user.profileCompleted && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // Role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
