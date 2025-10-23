import { Link } from 'react-router-dom';
import logo from '../elements/BaguioPinelodgelogo.png';
import logoCursor from '../elements/logoCursor.png';
import imgheader from '../elements/landing-header-img.jpg';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Grid, Card, CardContent, CardMedia } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import ListingCard from './hostPage/ListingCard';
import './LandingPage.css';

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate(role === 'host' ? '/Signin' : '/Signup');
  };

  const menuItems = ['Accommodations', 'Experiences', 'Services'];

  // ✅ Simulated listing data (replace with Firestore fetch later)
  useEffect(() => {
    const dummyListings = [
      {
        title: 'Cozy Cabin Near Burnham Park',
        description: 'Perfect for couples looking for a quiet stay.',
        address: { area: 'Near Burnham Park', city: 'Baguio City' },
        price: 2500,
        type: 'accommodation',
        capacity: 4,
        photos: ['https://via.placeholder.com/400x250?text=Cabin'],
      },
      {
        title: 'Local City Tour Experience',
        description: 'Discover Baguio like a local with our guided tours.',
        address: { area: 'Near Session Road', city: 'Baguio City' },
        price: 1200,
        type: 'experience',
        capacity: 10,
        photos: ['https://via.placeholder.com/400x250?text=Tour'],
      },
      {
        title: 'Massage and Spa Service',
        description: 'Relax and unwind with traditional massage packages.',
        address: { area: 'Near SM Baguio', city: 'Baguio City' },
        price: 800,
        type: 'service',
        capacity: 2,
        photos: ['https://via.placeholder.com/400x250?text=Spa'],
      },
    ];
    setListings(dummyListings);
  }, []);

  return (
    <>
      {/* HEADER BAR */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px" }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box display="flex" alignItems="center" gap={1}>
            <Link to="/" style={{ textDecoration: "none" }}>
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
                  color: '#30410D',
                  fontFamily: "'Kingred Serif', serif",
                  cursor: `url(${logoCursor}) 0 0, pointer`
                }}>
                BAGUIO
              </Typography>
              <Typography variant="caption"
                sx={{
                  letterSpacing: 3,
                  fontSize: 13,
                  color: '#30410D',
                  fontFamily: "'Questrial', sans-serif",
                  cursor: `url(${logoCursor}) 0 0, pointer`
                }}>
                PINELODGE
              </Typography>
            </Box>
          </Box>

          {/* Nav Menu */}
          <Box display={{ xs: 'none', md: 'flex' }} gap={6}>
            {menuItems.map((item) => (
              <Button key={item} sx={{ color: '#30410D', textTransform: 'none', fontSize: '1rem', '&:hover': { backgroundColor: '#dceeb46c', borderRadius: '20px' } }}>
                {item}
              </Button>
            ))}
          </Box>

          {/* Right Side */}
          <Box display={{ xs: 'none', md: 'flex' }} alignItems="center" gap={3}>
            <Typography onClick={() => handleRoleSelect('host')} sx={{ color: '#6d7a46', fontWeight: 'bold', cursor: 'pointer', '&:hover': { color: '#30410D' } }}>Become a host</Typography>
            <Button
              variant="outlined"
              onClick={() => handleRoleSelect('customer')}
              sx={{
                borderColor: '#70873F',
                color: '#70873F',
                borderRadius: '30px',
                textTransform: 'none',
                padding: '8px 20px',
                '&:hover': { backgroundColor: '#30410D', color: '#fff' }
              }}
              startIcon={<AccountCircleIcon sx={{ color: '#70873F' }} />}
            >
              Get Started
            </Button>
          </Box>

          {/* Mobile Menu */}
          <IconButton
            sx={{ display: { xs: 'block', md: 'none' }, color: '#30410D' }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 250, padding: 2 }}>
              <List>
                {menuItems.map((text) => (
                  <ListItem button key={text}>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
                <ListItem onClick={() => handleRoleSelect('host')}>
                  <ListItemText primary="Become a host" />
                </ListItem>
              </List>
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
        <Box sx={{ zIndex: 2, maxWidth: '800px' }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Book Easy, Stay Cozy in the City of Pines
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 300 }}>
            Baguio City, Philippines
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
              '&:hover': { backgroundColor: '#DE7001', color: "#1C1C1C" },
            }}
          >
            Explore Now
          </Button>
        </Box>
      </Box>

      {/* 🌿 NEW SECTIONS */}

      {/* 1️⃣ Top Values for You */}
      <Box sx={{ py: 8, textAlign: "center", backgroundColor: "#f8f9f3", mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#30410D" }}>
          Top Values for You
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            { icon: <FavoriteIcon sx={{ fontSize: 40, color: "#70873F" }} />, title: "Comfort & Warmth", text: "Enjoy cozy stays with top amenities and Baguio charm." },
            { icon: <StarIcon sx={{ fontSize: 40, color: "#70873F" }} />, title: "Top-Rated Hosts", text: "Highly rated hosts ensuring quality and care." },
            { icon: <LocalOfferIcon sx={{ fontSize: 40, color: "#70873F" }} />, title: "Best Deals", text: "Affordable stays with exclusive seasonal offers." },
            { icon: <TravelExploreIcon sx={{ fontSize: 40, color: "#70873F" }} />, title: "Perfect Location", text: "Find spots near parks, cafes, and tourist landmarks." },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, py: 3 }}>
                <CardContent>
                  {item.icon}
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{item.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 2️⃣ Tourist Recommendations */}
      <Box sx={{ py: 8, textAlign: "center", backgroundColor: "#fff" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: "#30410D" }}>
          Tourist Recommendations
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {listings.map((listing, i) => (
            <Grid item key={i}>
              <ListingCard listing={listing} onView={() => {}} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
