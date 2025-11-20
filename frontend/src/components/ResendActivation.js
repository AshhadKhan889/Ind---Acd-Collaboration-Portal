import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { FaEnvelope } from 'react-icons/fa';

const ResendActivation = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
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

  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      p: 4,
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <FaEnvelope size={50} color="#1976d2" />
      </Box>
      
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 3, fontWeight: 'medium' }}>
        Resend Activation Email
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your email address to receive a new activation link.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <FaEnvelope color="action.active" />
              </Box>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          disabled={loading}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Activation Email'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="body2">
          Remember your account?{' '}
          <Button
            component={Link}
            to="/login"
            sx={{
              textTransform: 'none',
              color: '#4CAF50',
              fontSize: '0.875rem',
              p: 0,
              minWidth: 'auto'
            }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default ResendActivation;
