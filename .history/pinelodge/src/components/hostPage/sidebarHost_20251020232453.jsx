import React from "react";
import {Drawer,List,ListItemButton,ListItemIcon,ListItemText,Toolbar,Box,IconButton,Divider,useMediaQuery,Typography} from "@mui/material";
import { Dashboard, Home, Menu, Payments } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

export default function SidebarHost({ selectedIndex, onSelect }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(!isMobile);

  //Navigation items
  const navItems = [
    { text: "Dashboard", icon: <Dashboard /> },
    { text: "Listings", icon: <Home /> },
    { text: "Payments", icon: <Payments /> },

  ];

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar sx={{ display: "flex", alignItems: "center", p: 2 }}>
        {/* Left Logo */}
        <Box display="flex" alignItems="center" gap={1}>
          <Link to=" " style={{ textDecoration: "none" }}>
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
      </Toolbar>
      <Divider />

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
