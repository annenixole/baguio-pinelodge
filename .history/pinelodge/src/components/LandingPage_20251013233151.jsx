import { Link } from 'react-router-dom';
import logo from '../elements/BaguioPinelodgelogo.png';
import logoCursor from '../elements/logoCursor.png';
import imgheader from '../elements/landing-header-img.jpg';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import './LandingPage.css'


export default function LandingPage() {

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

   const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate(role === 'host' ? '/Signin' : '/Signup');
  };


  const menuItems = ['Accomodations', 'Experiences', 'Services'];


  return (
    <>

      <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px",}}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Logo */}
          <Box display="flex" alignItems="center" gap={1}>
            <Link to = "/" style={{textDecoration:"none"}}>
            <img
              src={logo}
              alt="Baguio PineLodge Logo"
              style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }}
            />
            </Link>
            <Box>
              <Typography variant="h6"
                sx={{
                  fontWeight: 'lighter',
                  fontSize: 28,
                  mb: -1,
                  color: '#30410D;',
                  fontFamily: "'Kingred Serif', serif",
                  cursor: `url(${logoCursor}) 0 0, pointer`
                }}>
                BAGUIO
              </Typography>

              <Typography variant="caption"
                sx={{
                  letterSpacing: 3,
                  fontSize: 13,
                  color: '#30410D;',
                  fontFamily: "'Questrial', sans-serif",
                  cursor: `url(${logoCursor}) 0 0, pointer`
                }}>
                PINELODGE
              </Typography>
            </Box>
          </Box>

          {/* hide nav mobile view*/}
          <Box display={{ xs: 'none', md: 'flex' }} gap={6}>
            {menuItems.map((item) => (
              <Button key={item} sx={{ padding: '0px 14px', color: '#30410D;', textTransform: 'none', fontSize: '1rem', '&:hover': { backgroundColor: '#dceeb46c', padding: '6px 14px', borderRadius: '20px' } }}>
                {item}
              </Button>
            ))}
          </Box>

          {/* side bar */}
          <Box display={{ xs: 'none', md: 'flex' }} alignItems="center" gap={3}>
            <Typography onClick ={() => handleRoleSelect('host')} sx={{ color: '#6d7a46', fontWeight: 'bold', cursor: 'pointer', '&:hover': { color: '#30410D;' } }}>Become a host</Typography>
            <Button
              variant="outlined"
              onClick={() => handleRoleSelect('customer')}
              sx={{
                borderColor: '#70873F;',
                color: '#70873F;',
                borderRadius: '30px',
                textTransform: 'none',
                padding: '8px 20px',
                fontWeight: 'semi-bold',
                '&:hover': { backgroundColor: '#30410D;', borderColor: '#30410D; color: #ffff' }
              }}
              startIcon={<AccountCircleIcon sx={{ color: '#70873F', }} />}
            >
              Get Started
            </Button>
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            sx={{ display: { xs: 'block', md: 'none' }, color: '#30410D;' }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Drawer for Mobile View */}
          <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
            <Box
              sx={{ width: 250, padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)}
            >
              <List>
                {menuItems.map((text) => (
                  <ListItem button key={text} sx={{ cursor: 'pointer', color: "#30410D" }}>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
                <ListItem onClick = {() => handleRoleSelect('host')}>
                  <ListItemText primary="Become a host" sx={{ cursor: 'pointer', color: "#30410D;", }} />
                </ListItem>
              </List>
              <Button
                variant="outlined"
                onClick = {() => handleRoleSelect('customer')}
                fullWidth
                sx={{
                  borderColor: '#70873F',
                  color: '#70873F',
                  borderRadius: '30px',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#30410D;', borderColor: '#30410D; color: #ffff' }
                }}
                startIcon={<AccountCircleIcon sx={{ color: '#70873F' }} />}
              >
                Get Started
              </Button>
            </Box>
          </Drawer>
        </Toolbar>
      </AppBar>

      {/* HEADER SECTION */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '100vh', md: '80vh' },
          backgroundImage: `url(${imgheader})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          borderRadius: { xs: 0, md: '54px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          px: 2,
          mt: 2,
          mx: { xs: 0, md: 3 },
        }}
      >
        {/* Overlay for readability */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: { xs: 0, md: '54px' },
            zIndex: 1,
          }}
        />

        {/* Text content */}
        <Box sx={{ zIndex: 2, maxWidth: '800px' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Book Easy, Stay Cozy in the City of Pines
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              fontWeight: 300,
            }}
          >
            Baguio City Philippines
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#1C1C1C',
              color: '#DE7001',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1.2,
              borderRadius: '25px',
              cursor: "pointer",
              '&:hover': {
                backgroundColor: '#DE7001', color: "#1C1C1C",
              },
            }}
          >
            Explore Now
          </Button>
        </Box>
      </Box>
    </>
  );
}
