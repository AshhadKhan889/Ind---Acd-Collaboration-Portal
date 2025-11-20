import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';

const VerifyEmail = () => {
  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      p: 4,
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <FaCheckCircle style={{ 
        fontSize: '4rem', 
        color: '#4CAF50',
        marginBottom: '1rem'
      }} />
      
      <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'medium' }}>
        Verify Your Email
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <FaEnvelope style={{ marginRight: '0.5rem' }} />
        If you don't see the email, please check your spam folder.
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        The link will expire in 24 hours.
      </Typography>
      
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#388E3C'
          }
        }}
      >
        Resend Verification Email
      </Button>
      
      <Box sx={{ mt: 3 }}>
        <Button 
          component={Link}
          to="/login"
          sx={{ 
            textTransform: 'none', 
            color: '#4CAF50'
          }}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default VerifyEmail;