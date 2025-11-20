import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, Container, Chip, Avatar, Divider
} from '@mui/material';
import {
  Handshake, RocketLaunch, School, Business, Person, Star, Insights
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ collaborations: 0, partners: 0, opportunities: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats');
        const data = await res.json();
        const target = {
          collaborations: data.collaborations || 0,
          partners: data.partners || 0,
          opportunities: data.opportunities || 0,
        };
        const duration = 1200;
        const tick = 40;
        const steps = duration / tick;
        let step = 0;
        const start = { collaborations: 0, partners: 0, opportunities: 0 };
        const timer = setInterval(() => {
          step += 1;
          setStats({
            collaborations: Math.round((target.collaborations * step) / steps),
            partners: Math.round((target.partners * step) / steps),
            opportunities: Math.round((target.opportunities * step) / steps),
          });
          if (step >= steps) clearInterval(timer);
        }, tick);
      } catch (e) {
        // fallback: keep zeros
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      {/* New Hero */}
      <Box sx={{
        bgcolor: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
        background: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
        color: 'white',
        py: { xs: 10, md: 14 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip icon={<Handshake />} label="Industry–Academia Collaboration" color="default" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
                Build partnerships. Fund research. Launch careers.
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                One platform for jobs, projects, internships, and meaningful collaboration.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/view')}>
                  Explore Opportunities
                </Button>
                <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }} onClick={() => navigate('/post')}>
                  Post an Opportunity
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Grid container spacing={2}>
                  {[{ label: 'Collaborations', value: stats.collaborations }, { label: 'Partners', value: stats.partners }, { label: 'Open Opportunities', value: stats.opportunities }].map((s, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{loadingStats ? '—' : s.value.toLocaleString()}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Value Props */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {[{
            icon: <Business sx={{ color: theme.palette.primary.main }} />, title: 'For Industry', copy: 'Source talent, co-develop research, and accelerate product innovation.'
          }, {
            icon: <School sx={{ color: theme.palette.primary.main }} />, title: 'For Academia', copy: 'Find funding partners, place students, and translate research into impact.'
          }, {
            icon: <Person sx={{ color: theme.palette.primary.main }} />, title: 'For Students', copy: 'Discover internships, projects, and mentors to launch your career.'
          }].map((card, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {card.icon}
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.title}</Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">{card.copy}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Highlights */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={3}>
          {[{
            title: 'Trusted & Verified', copy: 'Poster identities and roles are verified to keep collaboration safe.', icon: <Star sx={{ color: theme.palette.warning.main }} />
          }, {
            title: 'Outcomes that Matter', copy: 'Track progress, applicants, and deliverables with clarity.', icon: <Insights color="primary" />
          }].map((h, i) => (
            <Grid key={i} item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {h.icon}
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{h.title}</Typography>
                  </Box>
                  <Typography color="text.secondary">{h.copy}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trending Topics */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Trending topics</Typography>
        <Grid container spacing={1}>
          {['AI/ML', 'Cybersecurity', 'FinTech', 'Healthcare', 'Sustainability', 'IoT', 'Cloud', 'Data Engineering', 'AR/VR']
            .map((tag) => (
              <Grid key={tag} item>
                <Chip label={tag} clickable onClick={() => navigate('/view')} />
              </Grid>
            ))}
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body1" color="text.secondary">
          Discover opportunities across domains. Filter by skills, role, or organization on the opportunities page.
        </Typography>
      </Container>
    </Box>
  );
};

export default HomePage;