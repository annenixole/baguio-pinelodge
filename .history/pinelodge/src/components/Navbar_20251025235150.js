import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../elements/BaguioPinelodgelogo.png";
import logoCursor from "../elements/logoCursor.png";
import './LandingPage.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (state) => () => setOpen(state);
  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate(role === "host" ? "/Signin" : "/Signup");
  };

  const menuItems = ["Accommodations", "Experiences", "Services"];

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <img src={logo} alt="Baguio PineLodge Logo" style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }} />
          </Link>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "lighter", fontSize: 28, mb: -1, color: "#30410D", fontFamily: "'Kingred Serif', serif" }}>
              BAGUIO
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: 3, fontSize: 13, color: "#30410D", fontFamily: "'Questrial', sans-serif" }}>
              PINELODGE
            </Typography>
          </Box>
        </Box>

        {/* Nav Menu */}
        <Box display={{ xs: "none", md: "flex" }} gap={6}>
          {menuItems.map((item) => (
            <Button key={item} sx={{ color: "#30410D", textTransform: "none", fontSize: "1rem", "&:hover": { backgroundColor: "#dceeb46c", borderRadius: "20px" } }}>
              {item}
            </Button>
          ))}
        </Box>

        {/* Right Side */}
        <Box display={{ xs: "none", md: "flex" }} alignItems="center" gap={3}>
          <Typography onClick={() => handleRoleSelect("host")} sx={{ color: "#6d7a46", fontWeight: "bold", cursor: "pointer", "&:hover": { color: "#30410D" } }}>
            Become a host
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleRoleSelect("customer")}
            sx={{
              borderColor: "#70873F",
              color: "#70873F",
              borderRadius: "30px",
              textTransform: "none",
              padding: "8px 20px",
              "&:hover": { backgroundColor: "#30410D", color: "#fff" },
            }}
            startIcon={<AccountCircleIcon sx={{ color: "#70873F" }} />}
          >
            Get Started
          </Button>
        </Box>

        {/* Mobile Drawer */}
        <IconButton sx={{ display: { xs: "block", md: "none" }, color: "#30410D" }} onClick={toggleDrawer(true)}>
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
              <ListItem onClick={() => handleRoleSelect("host")}>
                <ListItemText primary="Become a host" />
              </ListItem>
            </List>
            <Button
              variant="outlined"
              onClick={() => handleRoleSelect("customer")}
              fullWidth
              sx={{
                borderColor: "#70873F",
                color: "#70873F",
                borderRadius: "30px",
                textTransform: "none",
                "&:hover": { backgroundColor: "#30410D", color: "#fff" },
              }}
              startIcon={<AccountCircleIcon sx={{ color: "#70873F" }} />}
            >
              Get Started
            </Button>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
