import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      activateAccount();
    }
  }, [token]);

  const activateAccount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/activate/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setMessage(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        p: 4,
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <CircularProgress size={60} sx={{ mb: 3, color: '#1976d2' }} />
        <Typography variant="h6" color="text.secondary">
          Activating your account...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      p: 4,
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {success ? (
        <>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FaCheckCircle size={60} color="#4CAF50" />
          </Box>
          <Typography variant="h5" component="h1" align="center" sx={{ mb: 2, color: '#4CAF50' }}>
            Account Activated!
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#1976d2',
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              mb: 2,
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Go to Login
          </Button>
        </>
      ) : (
        <>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FaExclamationTriangle size={60} color="#f44336" />
          </Box>
          <Typography variant="h5" component="h1" align="center" sx={{ mb: 2, color: '#f44336' }}>
            Activation Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The activation link may have expired or is invalid.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#1976d2',
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Register Again
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ActivateAccount;
