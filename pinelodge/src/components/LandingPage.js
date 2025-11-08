import React from "react";
import { Box } from "@mui/material";
import NavbarGuest from "./guestPage/NavbarGuest";
import LandingGuest from "./guestPage/LandingGuest";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <Box sx={{ backgroundColor: "#fffdf3ff", minHeight: "100vh" }}>
      <NavbarGuest />
      <LandingGuest />
      <Footer />
    </Box>
  );
}

