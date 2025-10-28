// src/components/HomeGuest.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import imgheader from "../../elements/landing-header-img.jpg";
import ListingCard from "./hostPage/ListingCard";
import { collectionGroup, getDocs } from "../firebase/firestore";
import { db } from "./firebase";

export default function LandingGuests() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, "accommodations"));
        const serviceSnapshot = await getDocs(collectionGroup(db, "services"));
        const expSnapshot = await getDocs(collectionGroup(db, "experiences"));

        const allListings = [
          ...querySnapshot.docs.map((doc) => doc.data()),
          ...serviceSnapshot.docs.map((doc) => doc.data()),
          ...expSnapshot.docs.map((doc) => doc.data()),
        ];
        setListings(allListings.filter((listing) => listing.status === "published"));
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "100vh", md: "80vh" },
          backgroundImage: `url(${imgheader})`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          borderRadius: { xs: 0, md: "54px" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          mt: 2,
          mx: { xs: 0, md: 3 },
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: { xs: 0, md: "54px" } }} />
        <Box sx={{ zIndex: 2, textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Book Easy, Stay Cozy in the City of Pines
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 300 }}>
            Baguio City, Philippines
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1C1C1C",
              color: "#DE7001",
              fontWeight: 600,
              textTransform: "none",
              px: 4,
              py: 1.2,
              borderRadius: "25px",
              "&:hover": { backgroundColor: "#DE7001", color: "#1C1C1C" },
            }}
          >
            Explore Now
          </Button>
        </Box>
      </Box>

      {/* Recommendations */}
      <Box sx={{ py: 8, textAlign: "center", backgroundColor: "#fff" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 5, color: "#30410D" }}>
          Tourist Recommendations
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {listings.map((listing, i) => (
            <Grid item key={i}>
              <ListingCard listing={listing} onView={() => {}} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
