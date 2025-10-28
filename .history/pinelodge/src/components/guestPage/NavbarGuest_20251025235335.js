import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../../elements/BaguioPinelodgelogo.png";
import logoCursor from "../../elements/logoCursor.png";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import ProfileMenuGuest from "./ProfileMenuGuest";

export default function NavbarGuest() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (state) => () => setOpen(state);

  const menuItems = ["Accommodations", "Experiences", "Services"];

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px" }}>
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
                key={item}
                sx={{ color: "#30410D", textTransform: "none", fontSize: "1rem", "&:hover": { backgroundColor: "#dceeb46c", borderRadius: "20px" } }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* ✅ Profile Menu for Guests */}
          <Box display={{ xs: "none", md: "flex" }} alignItems="center" gap={3}>
            <ProfileMenuGuest />
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
              </List>

              <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                <ProfileMenuGuest />
              </Box>
            </Box>
          </Drawer>
        </Toolbar>
      </AppBar>
    </>
  );
}
