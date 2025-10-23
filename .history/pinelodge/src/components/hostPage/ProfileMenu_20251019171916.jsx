import React, { useState } from "react";
import { Avatar, Menu, MenuItem, Typography, Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ userEmail }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const hostAcc = "Host Account";
  const navigate = useNavigate();


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
  try {
    await signOut(auth); //Firebase logout
    handleClose(); //close the dropdown
    navigate("./LandingPage"); // redirect to login page
  } catch (error) {
    console.error("Logout failed:", error);
  }
};


  return (
    <>
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
            background: "transparent", // no hover color
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
        <MenuItem onClick={handleClose}>Profile Settings</MenuItem>
        <MenuItem onClick={handleClose}>Account Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
}
