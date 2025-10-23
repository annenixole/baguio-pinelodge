import React, { useState } from "react";
import { Avatar, Menu, MenuItem, Typography, Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You’ll be logged out of your host account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, log out",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    buttonsStyling: false, // disable default SweetAlert button styles

    didOpen: () => {
      const popup = Swal.getPopup();
      const icon = popup.querySelector(".swal2-icon");
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();
      // Popup styling
      Object.assign(popup.style, {
        borderRadius: "29px",
        padding: "16px",
      });
      if (icon) {
        Object.assign(icon.style, {
          transform: "scale(0.7)", // ✅ shrink the icon
        });
      }
      // Confirm button (green)
      Object.assign(confirmBtn.style, {
        backgroundColor: "#30410D",
        color: "white",
        borderRadius: "6px",
        padding: "8px 16px",
        border: "none",
        fontWeight: "500",
        margin: "8px 8px",
        cursor: "pointer",
      });
      // Cancel button (red)
      Object.assign(cancelBtn.style, {
        backgroundColor: "#d33",
        color: "white",
        borderRadius: "6px",
        padding: "8px 16px",
        border: "none",
        fontWeight: "500",
        margin: "8px 8px",
        cursor: "pointer",
      });
    },
  });
  if (!result.isConfirmed) return;

  try {
    await signOut(auth);
    navigate("/"); // redirect to landing page
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
