import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#192405ff',
        color: 'white',
        pt: { xs: 4, md: 6 },
        pb: 3,
        mt: 'auto',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
      }}
    >
      <Container 
        maxWidth="xl"
        sx={{
          px: { xs: 3, sm: 4, md: 6, lg: 8 },
        }}
      >
        {/* Main Footer Content */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 4 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={4} mr={8}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'lighter',
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                mb: 1,
                fontFamily: "'Kingred Serif', serif",
                letterSpacing: 1,

              }}
            >
              BAGUIO
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                letterSpacing: 3,
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                mb: 2,
                fontFamily: "'Questrial', sans-serif",
              }}
            >
              PINELODGE
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.85rem', md: '0.9rem' },
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
              }}
            >
              Stay Cozy in the City of Pines
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2.5} mr={4}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 2,
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={Link}
                to="/AccomGuest"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                Accommodations
              </MuiLink>
              <MuiLink
                component={Link}
                to="/ServGuest"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                Services
              </MuiLink>
              <MuiLink
                component={Link}
                to="/ExpGuest"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                Experiences
              </MuiLink>
            </Box>
          </Grid>

          {/* Company */}
          <Grid item xs={6} sm={4} md={2.5} mr={4}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 2,
              }}
            >
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={Link}
                to="/about"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                About Us
              </MuiLink>
              <MuiLink
                component={Link}
                to="/faq"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                FAQ Page
              </MuiLink>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 2,
              }}
            >
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.6,
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                123, Brgy. Irisan Transfer Station, Marcos Highway, Baguio City,<br></br> Benguet, Philippines 2600
              </Typography>
              <MuiLink
                href="mailto:baguiopinelodge@gmail.com"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'underline',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  '&:hover': {
                    color: 'white',
                  },
                }}
              >
                baguiopinelodge@gmail.com
              </MuiLink>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            pt: 3,
            mt: 2,
          }}
        >
          {/* Bottom Footer */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8rem', md: '0.85rem' },
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              © 2025 Hallegado Anne Nicole. All rights reserved.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 2, sm: 3 },
              }}
            >
              <MuiLink
                component={Link}
                to="/terms"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.8rem', md: '0.85rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                Use of Terms
              </MuiLink>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', md: '0.85rem' },
                }}
              >
                |
              </Typography>
              <MuiLink
                component={Link}
                to="/privacy"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: { xs: '0.8rem', md: '0.85rem' },
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                Privacy Policy
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
