import React, { useState } from 'react';
import {
  Box, Stepper, Step, StepLabel, Typography, Card, CardContent,
  Button, TextField, Chip, Divider, Checkbox, FormControlLabel,
  ToggleButton, ToggleButtonGroup, InputAdornment, Avatar, Grid, Link
} from '@mui/material';
import {
  Save, ExitToApp, Work, School, Build,
  AttachMoney, LocationOn, CalendarToday,
  CloudUpload, Visibility, LinkedIn, Twitter, CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const JobPostingPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [postType, setPostType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    currentSkill: '',
    education: [],
    compensationType: 'salary',
    salaryRange: [70000, 90000],
    hourlyRate: 45,
    locationType: 'remote',
    deadline: '',
    attachments: []
  });

  const handleNext = () => {
    if (activeStep === 0 && postType) {
      // Navigate to the appropriate page based on postType
      switch(postType) {
        case 'job':
          navigate('/post-job');
          break;
        case 'internship':
          navigate('/post-internship');
          break;
        case 'project':
          navigate('/post-project');
          break;
        default:
          break;
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleAddSkill = () => {
    if (formData.currentSkill && !formData.skills.includes(formData.currentSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.currentSkill],
        currentSkill: ''
      });
    }
  };

  const handleFileUpload = (e) => {
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...Array.from(e.target.files)]
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Friendly header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
      </Box>

      {/* Step 1: Job Type Selection */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
            What would you like to post today?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Choose the option that best fits your needs. Don't worry, you can always edit details later.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[
              { 
                type: 'job', 
                icon: <Work fontSize="large" color="primary" />,
                title: 'Job Opportunity',
                subtext: 'Perfect for hiring full-time or contract employees',
                benefits: [
                  'Reach qualified professionals',
                  'Competitive salary options',
                  'Detailed listing features'
                ]
              },
              { 
                type: 'internship', 
                icon: <School fontSize="large" color="primary" />,
                title: 'Internship Program',
                subtext: 'Great for students and recent graduates',
                benefits: [
                  'Academic credit options',
                  'Flexible duration',
                  'Mentorship opportunities'
                ]
              },
              { 
                type: 'project', 
                icon: <Build fontSize="large" color="primary" />,
                title: 'Collaborative Project',
                subtext: 'Ideal for research partnerships or contract work',
                benefits: [
                  'Connect with specialists',
                  'Fixed-term engagements',
                  'Innovation-focused'
                ]
              }
            ].map((item) => (
              <Grid item xs={12} md={4} key={item.type}>
                <Card 
                  onClick={() => setPostType(item.type)}
                  sx={{ 
                    cursor: 'pointer',
                    border: postType === item.type ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    height: '100%',
                    p: 3,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.lighter', mr: 2, width: 48, height: 48 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {item.subtext}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Great for:
                    </Typography>
                    <ul style={{ 
                      paddingLeft: 20,
                      margin: 0,
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}>
                      {item.benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </Box>
                  {postType === item.type && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: 'primary.main',
                      mt: 2,
                      pt: 2,
                      borderTop: '1px dashed #e0e0e0'
                    }}>
                      <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Selected
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 6,
            pt: 3,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ExitToApp />}
              onClick={() => navigate('/home-page')}
            >
              Maybe later
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!postType}
              size="large"
              sx={{ 
                px: 4,
                borderRadius: 1,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              Continue to details →
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default JobPostingPage;