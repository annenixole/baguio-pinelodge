import React, { useState } from "react";
import { Avatar, Menu, MenuItem, Typography, Box, IconButton, Badge, Popover, List, ListItem, Button, Divider } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import notificationIcon from "../../elements/BaguioPinelodgelogo.png";

export default function ProfileMenu({ userEmail, onProfileSettingsClick, notifications = [], notificationsCount = 0, onNotificationClick, onRefreshNotifications }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  const hostAcc = "Host Account";

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileSettings = () => {
    console.log('👤 Profile Settings clicked');
    handleClose();
    if (onProfileSettingsClick) {
      console.log('✅ Calling onProfileSettingsClick callback');
      onProfileSettingsClick();
    } else {
      console.warn('⚠️ onProfileSettingsClick callback not provided');
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Notification Icon */}
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

        {/* Profile Menu */}
        <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: 5,
          px: 1,
          py: 0.5,
          transition: "background 0.2s",
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: "#30410D",
            width: 35,
            height: 35,
            fontSize: 16,
          }}
        >
          {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
        </Avatar>

        {/* Email + Dropdown arrow */}
        <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
          {userEmail && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mr: 0.5,
                display: { xs: "none", sm: "inline" }, // hide email on mobile
              }}
            >
              {userEmail}
            </Typography>
          )}
          <ArrowDropDownIcon
            sx={{
              color: "text.secondary",
              fontSize: 22,
            }}
          />
        </Box>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {hostAcc && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {hostAcc}
            </Typography>
          </MenuItem>
        )}
        <MenuItem onClick={handleProfileSettings}>Profile Settings</MenuItem>
        <MenuItem onClick={handleClose}>Account Settings</MenuItem>
      </Menu>
      </Box>

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
                if (onRefreshNotifications) onRefreshNotifications();
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
                    onClick={() => {
                      if (onNotificationClick) onNotificationClick(notification);
                    }}
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
