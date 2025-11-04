import React, { useState, useEffect } from "react";
import { Avatar, Menu, MenuItem, Typography, Box, Divider } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ProfileMenuGuest() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // ✅ Logout confirmation
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      text: "You’ll be logged out of your guest account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false,
      didOpen: () => {
        const popup = Swal.getPopup();
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        Object.assign(popup.style, {
          borderRadius: "20px",
          padding: "12px",
        });

        Object.assign(confirmBtn.style, {
          backgroundColor: "#30410D",
          color: "white",
          borderRadius: "6px",
          padding: "8px 16px",
          fontWeight: "500",
          margin: "12px 8px",
          cursor: "pointer",
        });

        Object.assign(cancelBtn.style, {
          backgroundColor: "#d33",
          color: "white",
          borderRadius: "6px",
          padding: "8px 16px",
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

  return (
    <>
      {/* Avatar + Email */}
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
          "&:hover": { background: "transparent" },
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#30410D",
            width: 35,
            height: 35,
            fontSize: 16,
          }}
        >
          {userEmail ? userEmail.charAt(0).toUpperCase() : "G"}
        </Avatar>

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
        {/* Disabled email display */}
        {userEmail && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Guest Account
            </Typography>
          </MenuItem>
        )}
        <MenuItem onClick={() => navigate("/guest-profile")}>Profile Settings</MenuItem>
        <MenuItem onClick={() => navigate("/guest-account")}>Account Settings</MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate("/MyBookings"); }}>My Bookings</MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate("/Favorites"); }}>Wishlist</MenuItem>
        <MenuItem onClick={() => navigate("/")}>Switch to Hosting</MenuItem>
        <Divider/>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
}
