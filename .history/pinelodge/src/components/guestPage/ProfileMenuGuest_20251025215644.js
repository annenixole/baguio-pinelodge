import React, { useState } from "react";
import { Avatar, Menu, MenuItem, Typography, Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";

export default function ProfileMenuGuest() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
          "&:hover": { background: "transparent" },
        }}
      >
        <Avatar sx={{ bgcolor: "#70873F", width: 35, height: 35 }}>G</Avatar>
        <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            Guest
          </Typography>
          <ArrowDropDownIcon sx={{ color: "text.secondary", fontSize: 22 }} />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => navigate("/guest-profile")}>My Profile</MenuItem>
        <MenuItem onClick={() => navigate("/bookings")}>My Bookings</MenuItem>
        <MenuItem onClick={() => navigate("/favorites")}>Wishlist</MenuItem>
        <MenuItem onClick={() => navigate("/support")}>Support</MenuItem>
        <MenuItem onClick={() => navigate("/signin")}>Login</MenuItem>
      </Menu>
    </>
  );
}
