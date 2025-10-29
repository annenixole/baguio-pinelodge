import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../../elements/BaguioPinelodgelogo.png";
import logoCursor from "../../elements/logoCursor.png";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import ProfileMenuGuest from "./ProfileMenuGuest";

export default function NavbarGuest() {
  const [open, setOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(3); // Default to 3 for demo
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (state) => () => setOpen(state);

  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/SignIn");
  };

  const menuItems = [
    { name: "Accommodations", path: "/AccomGuest" },
    { name: "Experiences", path: "/ExpGuest" },
    { name: "Services", path: "/ServGuest" }
  ];

  // Check if user is signed in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Update favorites count
  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();

    // Listen for storage changes
    window.addEventListener('storage', updateFavoritesCount);
    window.addEventListener('focus', updateFavoritesCount);

    // Set up interval to check for updates
    const interval = setInterval(updateFavoritesCount, 1000);

    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('focus', updateFavoritesCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "14px", paddingBottom: "14px" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
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
          <Box display={{ xs: "none", md: "flex" }} gap={6}>
            {menuItems.map((item) => (
              <Button
                key={item.name}
                onClick={() => navigate(item.path)}
                sx={{ color: "#30410D", textTransform: "none", fontSize: "1rem", "&:hover": { backgroundColor: "#dceeb46c", borderRadius: "20px" } }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* ✅ Right side - Conditional based on sign-in status */}
          <Box display={{ xs: "none", md: "flex" }} alignItems="center" gap={2}>
            {isUserSignedIn ? (
              <>
                {/* Signed-in user: Show favorites, notifications, profile */}
                <IconButton
                  onClick={() => navigate('/Favorites')}
                  sx={{
                    color: "#30410D",
                    "&:hover": { backgroundColor: "#dceeb46c" }
                  }}
                >
                  <Badge badgeContent={favoritesCount} color="error">
                    <FavoriteIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  onClick={() => {
                    // TODO: Add notification navigation/modal
                    console.log('Notifications clicked');
                  }}
                  sx={{
                    color: "#30410D",
                    "&:hover": { backgroundColor: "#dceeb46c" }
                  }}
                >
                  <Badge badgeContent={notificationsCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <ProfileMenuGuest />
              </>
            ) : (
              <>
                {/* Not signed in: Show Become a host (text) and Get Started (button with icon) */}
                <Typography
                  onClick={() => handleRoleSelect("host")}
                  sx={{
                    color: "#6B7A4D",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { color: "#30410D" }
                  }}
                >
                  Become a host
                </Typography>
                <Button
                  onClick={() => handleRoleSelect("customer")}
                  startIcon={<AccountCircleIcon />}
                  variant="outlined"
                  sx={{
                    color: "#6B7A4D",
                    borderColor: "#6B7A4D",
                    fontSize: "1.1rem",
                    padding: "8px 20px",
                    backgroundColor: "#fff",
                    textTransform: "none",
                    borderRadius: "25px",
                    "&:hover": {
                      backgroundColor: "#30410D",
                      borderColor: "#30410D",
                      color: "#ffffffff"
                    }
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Drawer */}
          <IconButton sx={{ display: { xs: "block", md: "none" }, color: "#30410D" }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 250, padding: 2 }}>
              <List>
                {menuItems.map((item) => (
                  <ListItem button key={item.name} onClick={() => { navigate(item.path); setOpen(false); }}>
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>

              {/* Mobile: Conditional rendering based on sign-in status */}
              {isUserSignedIn ? (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                  <ProfileMenuGuest />
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2, px: 2 }}>
                  <Typography
                    onClick={() => { handleRoleSelect("host"); setOpen(false); }}
                    sx={{
                      color: "#6B7A4D",
                      fontSize: "1rem",
                      fontWeight: 500,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": { color: "#30410D" }
                    }}
                  >
                    Become a host
                  </Typography>
                  <Button
                    onClick={() => { handleRoleSelect("customer"); setOpen(false); }}
                    startIcon={<AccountCircleIcon />}
                    variant="outlined"
                    sx={{
                      color: "#6B7A4D",
                      borderColor: "#6B7A4D",
                      backgroundColor: "#fff",
                      textTransform: "none",
                      borderRadius: "25px",
                      "&:hover": {
                        backgroundColor: "#F5F7F0",
                        borderColor: "#30410D",
                        color: "#30410D"
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              )}
            </Box>
          </Drawer>
        </Toolbar>
      </AppBar>
    </>
  );
}
