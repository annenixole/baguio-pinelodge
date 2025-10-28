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
  const [filterType, setFilterType] = useState("-");
  const [filterLocation, setFilterLocation] = useState("-");
  const [filterDates, setFilterDates] = useState("-");
  const [filterGuests, setFilterGuests] = useState("-");

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
        <Box sx={{ zIndex: 2, textAlign: "center", width: "100%", px: 2 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }
            }}
          >
            Book Easy, Stay Cozy in the <br /> City of Pines
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4, 
              fontWeight: 300,
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}
          >
            Baguio City Philippines
          </Typography>

          {/* Search and Filter Card */}
          <Paper
            elevation={3}
            sx={{
              maxWidth: 1200,
              mx: "auto",
              borderRadius: "24px",
              backgroundColor: "rgba(211, 216, 207, 0.5)",
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
                textAlign: "left",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#ffffffff", display: "block", mb: 0.5, textAlign: "left" }}
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
                    color: "#ffffffff",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#ffffffff",
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
                textAlign: "left",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#ffffffff", display: "block", mb: 0.5, textAlign: "left" }}
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
                    color: "#ffffffff",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#ffffffff",
                    },
                  }}
                >
                  <MenuItem value="All Areas">All Areas</MenuItem>
                  <MenuItem value="Near Session Road">Near Session Road</MenuItem>
                  <MenuItem value="Near Burnham Park">Near Burnham Park</MenuItem>
                  <MenuItem value="Near Camp John Hay">Near Camp John Hay</MenuItem>
                  <MenuItem value="Near Mines View Park">Near Mines View Park</MenuItem>
                  <MenuItem value="Near Loakan">Near Loakan</MenuItem>
                  <MenuItem value="Near SM City Baguio">Near SM City Baguio</MenuItem>
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
                textAlign: "left",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#ffffffff", display: "block", mb: 0.5, textAlign: "left" }}
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
                    color: "#ffffffff",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#ffffffff",
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
                textAlign: "left",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#ffffffff", display: "block", mb: 0.5, textAlign: "left" }}
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
                    color: "#ffffffff",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#ffffffff",
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
                  px: 6,
                  py: 1.5,
                  borderRadius: "18px",
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
