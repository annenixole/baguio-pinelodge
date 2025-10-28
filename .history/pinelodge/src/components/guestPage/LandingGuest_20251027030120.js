import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid, Paper, MenuItem, Select, FormControl } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import imgheader from "../../elements/landing-header-img.jpg";
import ListingCardGuest from "./ListingCardGuest";
import ListingModal from "../hostPage/ListingModal.js";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export default function LandingGuest() {
  // ✅ Define state FIRST
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Search and filter states
  const [filterType, setFilterType] = useState("Accommodation");
  const [filterLocation, setFilterLocation] = useState("Near Baguio City");
  const [filterDates, setFilterDates] = useState("Nov 12 - Nov 13");
  const [filterGuests, setFilterGuests] = useState("2 guests");

  // ✅ Function to open modal
  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, "accommodations"));
        const serviceSnapshot = await getDocs(collectionGroup(db, "services"));
        const expSnapshot = await getDocs(collectionGroup(db, "experiences"));

        // ✅ Include ID, hostEmail from ref path, and ensure promotion data is passed
        const allListings = [
          ...querySnapshot.docs.map((doc) => {
            const pathSegments = doc.ref.path.split('/');
            const hostEmail = pathSegments[1]; // users/{hostEmail}/accommodations/{id}
            return { id: doc.id, hostEmail, ...doc.data() };
          }),
          ...serviceSnapshot.docs.map((doc) => {
            const pathSegments = doc.ref.path.split('/');
            const hostEmail = pathSegments[1]; // users/{hostEmail}/services/{id}
            return { id: doc.id, hostEmail, ...doc.data() };
          }),
          ...expSnapshot.docs.map((doc) => {
            const pathSegments = doc.ref.path.split('/');
            const hostEmail = pathSegments[1]; // users/{hostEmail}/experiences/{id}
            return { id: doc.id, hostEmail, ...doc.data() };
          }),
        ];

        // ✅ Filter published listings
        setListings(
          allListings.filter(
            (listing) => listing && listing.status === "published"
          )
        );
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: { xs: 0, md: "54px" },
          }}
        />
        <Box sx={{ zIndex: 2, textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Book Easy, Stay Cozy in the <br /> City of Pines
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
              <ListingCardGuest listing={listing} onView={handleViewListing} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Listing Modal */}
      <ListingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        listing={selectedListing}
      />
    </>
  );
}
