import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to track user inactivity and logout after 1 hour of inactivity
 * @param {number} inactivityTimeout - Time in milliseconds (default: 1 hour)
 */
const useInactivityLogout = (inactivityTimeout = 60 * 60 * 1000) => {
  const navigate = useNavigate();
  const checkIntervalRef = useRef(null);
  const STORAGE_KEY = 'lastActivityTime';

  // Get storage based on where token is stored
  const getStorage = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (localStorage.getItem('token')) {
      return localStorage;
    }
    return sessionStorage;
  };

  // Function to get last activity time from storage
  const getLastActivityTime = () => {
    const storage = getStorage();
    const stored = storage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  };

  // Function to update last activity time in storage
  const updateActivity = () => {
    const storage = getStorage();
    storage.setItem(STORAGE_KEY, Date.now().toString());
  };

  // Function to logout user
  const logout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem(STORAGE_KEY);
    
    // Navigate to login
    navigate('/login', { replace: true });
  };

  // Function to check if user should be logged out
  const checkInactivity = () => {
    const lastActivity = getLastActivityTime();
    if (!lastActivity) {
      // No stored activity time, initialize it
      updateActivity();
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    
    // Check if user has been inactive for more than the timeout period
    if (timeSinceLastActivity >= inactivityTimeout) {
      logout();
    }
  };

  useEffect(() => {
    // Only track inactivity if user is logged in
    const checkToken = () => {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    if (!checkToken()) {
      // Clear activity time if not logged in
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Check inactivity immediately on mount (in case user was inactive while page was closed)
    checkInactivity();

    // Initialize last activity time if not set
    if (!getLastActivityTime()) {
      updateActivity();
    }

    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check inactivity every minute
    checkIntervalRef.current = setInterval(() => {
      // Double-check token is still present before checking inactivity
      if (!checkToken()) {
        // Token was removed, clean up
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        return;
      }
      checkInactivity();
    }, 60 * 1000);

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [inactivityTimeout, navigate]);

  return { updateActivity };
};

export default useInactivityLogout;

