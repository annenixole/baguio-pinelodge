import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  IconButton,
  Divider,
  useMediaQuery,
  Typography,
  Button
} from "@mui/material";
import {
  Dashboard,
  People,
  Menu,
  Business,
  Assessment,
  Settings,
  Logout,
  VerifiedUser
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Swal from "sweetalert2";

const drawerWidth = 240;

export default function SidebarAdmin({ selectedIndex, onSelect }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(!isMobile);
  const navigate = useNavigate();

  // Navigation items for admin
  const navItems = [
    { text: "Dashboard", icon: <Dashboard /> },
    { text: "Users", icon: <People /> },
    { text: "Listings", icon: <Business /> },
    { text: "Verifications", icon: <VerifiedUser /> },
    { text: "Reports", icon: <Assessment /> },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You'll be logged out of your admin account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false,

      didOpen: () => {
        const popup = Swal.getPopup();
        const icon = popup.querySelector(".swal2-icon");
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        Object.assign(popup.style, {
          borderRadius: "29px",
          padding: "8px",
        });

        Object.assign(confirmBtn.style, {
          backgroundColor: "#30410D",
          color: "white",
          borderRadius: "6px",
          padding: "8px 16px",
          border: "none",
          fontWeight: "500",
          margin: "12px 8px",
          cursor: "pointer",
        });

        Object.assign(cancelBtn.style, {
          backgroundColor: "#d33",
          color: "white",
          borderRadius: "6px",
          padding: "8px 16px",
          border: "none",
          fontWeight: "500",
          margin: "12px 8px",
          cursor: "pointer",
        });
      },
    });
    if (!result.isConfirmed) return;

    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar sx={{ display: "flex", alignItems: "center", p: 2 }}>
        {/* Left Logo */}
        <Box display="flex" alignItems="center" gap={1}>
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <img
              src={logo}
              alt="Baguio PineLodge Logo"
              style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }}
            />
          </Link>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'lighter',
                fontSize: 28,
                mb: -1,
                color: '#30410D',
                fontFamily: "'Kingred Serif', serif",
                cursor: `url(${logoCursor}) 0 0, pointer`
              }}
            >
              BAGUIO
            </Typography>

            <Typography
              variant="caption"
              sx={{
                letterSpacing: 3,
                fontSize: 13,
                color: '#30410D',
                fontFamily: "'Questrial', sans-serif",
                cursor: `url(${logoCursor}) 0 0, pointer`
              }}
            >
              PINELODGE
            </Typography>

          </Box>
        </Box>
      </Toolbar>

      {/* Navigation List */}
      <List>
        {navItems.map((item, index) => (
          <ListItemButton
            key={index}
            selected={selectedIndex === index}
            onClick={() => onSelect(index)}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "#E8F5E9",
                color: "#30410D",
                fontWeight: 600,
              },
              "&:hover": {
                backgroundColor: "#F1F8E9",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      {/* Logout Button at Bottom */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            "&:hover": {
              backgroundColor: "#F1F8E9",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile toggle button */}
      {isMobile && (
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: "white",
            boxShadow: 2,
          }}
        >
          <Menu />
        </IconButton>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#FAFAF9",
            overflowX: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
