import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Badge, Popover, Divider, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../../elements/BaguioPinelodgelogo.png";
import logoCursor from "../../elements/logoCursor.png";
import notificationIcon from "../../elements/BaguioPinelodgelogo.png";
import { collectionGroup, getDocs, doc, getDoc, collection, query, orderBy, limit, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import ProfileMenuGuest from "./ProfileMenuGuest";

export default function NavbarGuest() {
  const [open, setOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
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
      if (user) {
        updateFavoritesCount(user.uid);
        loadNotifications(user.uid);
      } else {
        setFavoritesCount(0);
        setNotifications([]);
        setNotificationsCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for booking completion events to reload notifications
  useEffect(() => {
    const handleBookingComplete = () => {
      const user = auth.currentUser;
      if (user) {
        console.log('🎉 Booking completed, reloading notifications...');
        // Add a small delay to ensure Firestore write is complete
        setTimeout(() => {
          loadNotifications(user.uid);
        }, 1000);
      }
    };

    window.addEventListener('bookingComplete', handleBookingComplete);
    return () => window.removeEventListener('bookingComplete', handleBookingComplete);
  }, []);

  // Load notifications from Firestore
  const loadNotifications = async (userId) => {
    try {
      console.log('🔍 Loading notifications for user:', userId);
      const notificationsRef = collection(db, "users", userId, "notifications");
      
      // Try with orderBy first
      let querySnapshot;
      try {
        const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(10));
        querySnapshot = await getDocs(q);
        console.log('✅ Query with orderBy succeeded');
      } catch (orderError) {
        console.warn('⚠️ orderBy failed, trying without:', orderError.message);
        // If orderBy fails (missing index), try without it
        const q = query(notificationsRef, limit(10));
        querySnapshot = await getDocs(q);
      }
      
      const notificationsList = [];
      querySnapshot.forEach((doc) => {
        console.log('📧 Notification found:', doc.id, doc.data());
        notificationsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually if we didn't use orderBy
      notificationsList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      
      console.log('📋 Total notifications loaded:', notificationsList.length);
      setNotifications(notificationsList);
      // Count unread notifications
      const unreadCount = notificationsList.filter(n => !n.read).length;
      setNotificationsCount(unreadCount);
      console.log('🔔 Unread count:', unreadCount);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      console.error("Error details:", error.code, error.message);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      const user = auth.currentUser;
      if (user && !notification.read) {
        // Mark notification as read
        const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
        
        // Reload notifications to update count
        await loadNotifications(user.uid);
      }
      
      // Notification clicked - description will show user can go to My Bookings page
      // No automatic navigation
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Handle notification popover
  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const notificationOpen = Boolean(notificationAnchorEl);

  // Update favorites count from Firestore
  const updateFavoritesCount = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const favorites = userData.favorites || [];
        setFavoritesCount(favorites.length);
      }
    } catch (error) {
      console.error("Error loading favorites count:", error);
    }
  };

  // Listen for favorites updates
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      const user = auth.currentUser;
      if (user) {
        updateFavoritesCount(user.uid);
      }
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
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
                  onClick={handleNotificationOpen}
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

      {/* Notification Popover */}
      <Popover
        open={notificationOpen}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 360, maxHeight: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#30410D' }}>
              Notifications
            </Typography>
            <Button
              size="small"
              onClick={() => {
                const user = auth.currentUser;
                if (user) loadNotifications(user.uid);
              }}
              sx={{ textTransform: 'none', color: '#6B7A4D' }}
            >
              Refresh
            </Button>
          </Box>
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      py: 2,
                      px: 2,
                      backgroundColor: notification.read ? 'transparent' : '#f5f7f0',
                      '&:hover': {
                        backgroundColor: notification.read ? '#f9f9f9' : '#eef3e3',
                      },
                      cursor: 'pointer',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#f5f7f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <img 
                        src={notificationIcon} 
                        alt="notification" 
                        style={{ 
                          width: '28px', 
                          height: '28px',
                          objectFit: 'contain'
                        }} 
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 500 : 700,
                            color: '#30410D',
                            fontSize: '0.95rem',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#DE7001',
                              flexShrink: 0,
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: notification.read ? '#666' : '#333',
                          fontSize: '0.85rem',
                          mb: 0.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="body2"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent ListItem click
                          handleNotificationClose(); // Close the popover
                          navigate('/MyBookings'); // Navigate to My Bookings
                        }}
                        sx={{
                          color: '#6B7A4D',
                          fontSize: '0.8rem',
                          fontStyle: 'italic',
                          mb: 0.5,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': {
                            color: '#30410D',
                            fontWeight: 600,
                          },
                        }}
                      >
                        View your booking details in My Bookings page
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          fontSize: '0.75rem',
                        }}
                      >
                        {notification.createdAt?.toDate ? 
                          new Date(notification.createdAt.toDate()).toLocaleString() : 
                          'Just now'
                        }
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
