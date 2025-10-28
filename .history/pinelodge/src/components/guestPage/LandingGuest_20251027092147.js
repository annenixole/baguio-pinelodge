import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid, Paper, MenuItem, Select, FormControl } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import imgheader from "../../elements/landing-header-img.jpg";
import ListingCardGuest from "./ListingCardGuest";
import ListingModal from "../hostPage/ListingModal.js";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export default function LandingGuest() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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
        <Box sx={{ zIndex: 2, width: "100%", px: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              textAlign: "left"
            }}
          >
            Book Easy, Stay Cozy in the <br /> City of Pines
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4, 
              fontWeight: 300,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              textAlign: "left"
            }}
          >
            Baguio City Philippines
          </Typography>

          {/* Search and Filter Card */}
          <Paper
            elevation={3}
            sx={{
              maxWidth: 1200,
              borderRadius: "50px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 2, md: 1 },
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
            }}
          >
            {/* Type Filter */}
            <Box
              sx={{
                flex: 1,
                px: 3,
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "rgba(102, 102, 102, 0.5)", display: "block", mb: 0.5 }}
              >
                Type
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#000",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                  }}
                >
                  <MenuItem value="Accommodation">Accommodation</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="Experience">Experience</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Where Filter */}
            <Box
              sx={{
                flex: 1,
                px: 3,
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#666", display: "block", mb: 0.5 }}
              >
                Where
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#000",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                  }}
                >
                  <MenuItem value="Near Baguio City">Near Baguio City</MenuItem>
                  <MenuItem value="Baguio City Center">Baguio City Center</MenuItem>
                  <MenuItem value="Session Road">Session Road</MenuItem>
                  <MenuItem value="Burnham Park">Burnham Park</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Dates Filter */}
            <Box
              sx={{
                flex: 1,
                px: 3,
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#666", display: "block", mb: 0.5 }}
              >
                Dates
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterDates}
                  onChange={(e) => setFilterDates(e.target.value)}
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#000",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                  }}
                >
                  <MenuItem value="Nov 12 - Nov 13">Nov 12 - Nov 13</MenuItem>
                  <MenuItem value="Nov 14 - Nov 15">Nov 14 - Nov 15</MenuItem>
                  <MenuItem value="Nov 16 - Nov 17">Nov 16 - Nov 17</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Who Filter */}
            <Box
              sx={{
                flex: 1,
                px: 3,
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#666", display: "block", mb: 0.5 }}
              >
                Who
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterGuests}
                  onChange={(e) => setFilterGuests(e.target.value)}
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#000",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                  }}
                >
                  <MenuItem value="1 guest">1 guest</MenuItem>
                  <MenuItem value="2 guests">2 guests</MenuItem>
                  <MenuItem value="3 guests">3 guests</MenuItem>
                  <MenuItem value="4 guests">4 guests</MenuItem>
                  <MenuItem value="5+ guests">5+ guests</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Search Button */}
            <Box sx={{ px: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#000",
                  color: "#DE7001",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 4,
                  py: 1.5,
                  borderRadius: "30px",
                  fontSize: "1rem",
                  minWidth: { xs: "100%", md: "120px" },
                  "&:hover": { 
                    backgroundColor: "#DE7001", 
                    color: "#000" 
                  },
                }}
              >
                Search
              </Button>
            </Box>
          </Paper>
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
