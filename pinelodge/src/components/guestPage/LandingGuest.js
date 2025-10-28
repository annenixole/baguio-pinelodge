import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Button, Grid, Paper, MenuItem, Select, FormControl, Popover } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import imgheader from "../../elements/landing-header-img.jpg";
import ListingCardGuest from "./ListingCardGuest";
import ListingModal from "../hostPage/ListingModal.js";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export default function LandingGuest() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDates, setFilterDates] = useState("");
  const [filterGuests, setFilterGuests] = useState("");
  
  // Date picker states
  const [dateRange, setDateRange] = useState([null, null]);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const dateButtonRef = useRef(null);
  
  const navigate = useNavigate();

  // ✅ Function to open modal
  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  // Handle date picker
  const handleDateClick = () => {
    setDateAnchorEl(dateButtonRef.current);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateChange = (value) => {
    setDateRange(value);
    
    // Format the date range for display
    const formatDate = (date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    if (Array.isArray(value)) {
      const [start, end] = value;
      if (start && end) {
        // Check if both dates are the same (single date selected)
        if (start.toDateString() === end.toDateString()) {
          setFilterDates(formatDate(start));
        } else {
          // Different dates - show range
          setFilterDates(`${formatDate(start)} - ${formatDate(end)}`);
        }
      } else if (start) {
        // Only start date selected
        setFilterDates(formatDate(start));
      }
    }
    handleDateClose();
  };

  const handleClearDates = () => {
    setDateRange([null, null]);
    setFilterDates("");
    handleDateClose();
  };

  // Handle filter changes - toggle selection
  const handleFilterChange = (setter, currentValue) => (event) => {
    const newValue = event.target.value;
    // If clicking the same value, unselect and go back to ""
    if (newValue === currentValue) {
      setter("");
    } else {
      setter(newValue);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    // Determine which page to navigate to based on filterType
    let targetPage = "/AccomGuest"; // Default to accommodations
    
    if (filterType === "Service") {
      targetPage = "/ServGuest";
    } else if (filterType === "Experience") {
      targetPage = "/ExpGuest";
    } else if (filterType === "Accommodation") {
      targetPage = "/AccomGuest";
    } else {
      // If no type selected, default to accommodations
      targetPage = "/AccomGuest";
    }

    // Navigate with search criteria as state
    navigate(targetPage, {
      state: {
        searchFilters: {
          type: filterType,
          location: filterLocation,
          dates: filterDates,
          dateRange: dateRange,
          guests: filterGuests
        }
      }
    });
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
              backgroundColor: "rgba(252, 249, 232, 0.81)",
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5, textAlign: "left" }}
              >
                Type
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterType}
                  onChange={handleFilterChange(setFilterType, filterType)}
                  displayEmpty
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  renderValue={(selected) => selected || "Select type"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#30410D",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#30410D",
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5, textAlign: "left" }}
              >
                Where
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterLocation}
                  onChange={handleFilterChange(setFilterLocation, filterLocation)}
                  displayEmpty
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  renderValue={(selected) => selected || "All Areas"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#30410D",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#30410D",
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5, textAlign: "left" }}
              >
                Dates
              </Typography>
              <Box
                ref={dateButtonRef}
                onClick={handleDateClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#30410D",
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#30410D" }}>
                  {filterDates || "Any date"}
                </Typography>
                <KeyboardArrowDownIcon sx={{ color: "#30410D" }} />
              </Box>
              
              {/* Date Picker Popover */}
              <Popover
                open={Boolean(dateAnchorEl)}
                anchorEl={dateAnchorEl}
                onClose={handleDateClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Calendar
                    onChange={handleDateChange}
                    value={dateRange}
                    selectRange={true}
                    minDate={new Date()}
                  />
                  <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={handleClearDates}
                      sx={{ textTransform: "none", color: "#666" }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Box>
              </Popover>
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5, textAlign: "left" }}
              >
                Who
              </Typography>
              <FormControl fullWidth variant="standard">
                <Select
                  value={filterGuests}
                  onChange={handleFilterChange(setFilterGuests, filterGuests)}
                  displayEmpty
                  disableUnderline
                  IconComponent={KeyboardArrowDownIcon}
                  renderValue={(selected) => selected || "Any guests"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#30410D",
                    "& .MuiSelect-select": {
                      padding: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#30410D",
                    },
                  }}
                >
                  <MenuItem value="">Any guests</MenuItem>
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
                onClick={handleSearch}
                sx={{
                  backgroundColor: "#30410D",
                  color: "#f9f9f9ff",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 6,
                  py: 1.5,
                  borderRadius: "18px",
                  fontSize: "1rem",
                  minWidth: { xs: "100%", md: "120px" },
                  "&:hover": { 
                    backgroundColor: "#70873F", 
                    color: "#f9f9f9ff" 
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
