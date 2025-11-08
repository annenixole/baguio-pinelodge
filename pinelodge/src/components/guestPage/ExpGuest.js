import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Button, Grid, Paper, MenuItem, Select, FormControl, Popover, Container } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import NavbarGuest from "./NavbarGuest";
import ListingCardGuest from "./ListingCardGuest";
import ListingModal from "../hostPage/ListingModal.js";
import Footer from "../Footer";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { useNavigate, useLocation } from "react-router-dom";

export default function ExpGuest() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("Experience");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDates, setFilterDates] = useState("");
  const [filterGuests, setFilterGuests] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isSearchResult, setIsSearchResult] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ location: "", guests: "" });
  
  // Date picker states
  const [dateRange, setDateRange] = useState([null, null]);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const dateButtonRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, "experiences"));

        const allExperiences = querySnapshot.docs.map((doc) => {
          const pathSegments = doc.ref.path.split('/');
          const hostEmail = pathSegments[1];
          return { id: doc.id, hostEmail, ...doc.data() };
        });

        // Filter only published experiences
        const publishedExperiences = allExperiences.filter(
          (listing) => listing && listing.status === "published"
        );
        
        setListings(publishedExperiences);
        
        // Load search filters from navigation state after listings are loaded
        if (location.state?.searchFilters) {
          const { location: searchLocation, guests, dates, dateRange: searchDateRange } = location.state.searchFilters;
          
          if (searchLocation) setFilterLocation(searchLocation);
          if (guests) setFilterGuests(guests);
          if (dates) setFilterDates(dates);
          if (searchDateRange) setDateRange(searchDateRange);
          
          // Apply filters immediately when coming from search
          setAppliedFilters({ 
            location: searchLocation || "", 
            guests: guests || "" 
          });
          
          // Mark as search result
          setIsSearchResult(true);
        } else {
          // If no search filters, show all listings
          setFilteredListings(publishedExperiences);
          setIsSearchResult(false);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    };

    fetchExperiences();
  }, [location]);

  // Apply filters only when appliedFilters change
  useEffect(() => {
    console.log("ExpGuest - Applying filters:", { appliedFilters, listingsCount: listings.length });
    let filtered = [...listings];

    // Filter by location (skip if "All Areas" or empty)
    if (appliedFilters.location && appliedFilters.location !== "All Areas") {
      console.log("ExpGuest - Filtering by location:", appliedFilters.location);
      filtered = filtered.filter((listing) => {
        const listingArea = listing.address?.area || listing.location || "";
        const matches = listingArea === appliedFilters.location || listingArea.includes(appliedFilters.location.replace("Near ", ""));
        console.log("ExpGuest - Listing:", listing.title, "Area:", listingArea, "Matches:", matches);
        return matches;
      });
      console.log("ExpGuest - After location filter:", filtered.length);
    }

    // Filter by guests (skip if empty - "Any guests")
    if (appliedFilters.guests && appliedFilters.guests !== "") {
      console.log("ExpGuest - Filtering by guests:", appliedFilters.guests);
      // Extract number from "1 guest", "2 guests", "5+ guests", etc.
      const guestCount = parseInt(appliedFilters.guests.match(/\d+/)?.[0] || appliedFilters.guests);
      filtered = filtered.filter((listing) => {
        const listingCapacity = listing.capacity || listing.maxGuests || listing.groupSize || 0;
        const matches = listingCapacity >= guestCount;
        console.log("ExpGuest - Listing:", listing.title, "Capacity:", listingCapacity, "Required:", guestCount, "Matches:", matches);
        return matches;
      });
      console.log("ExpGuest - After guests filter:", filtered.length);
    }

    // Note: Date filtering is not applied here as we don't filter by dates
    // Dates are used for booking purposes only

    console.log("ExpGuest - Final filtered count:", filtered.length);
    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [appliedFilters, listings]);

  // Handle date picker
  const handleDateClick = () => {
    setDateAnchorEl(dateButtonRef.current);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateChange = (value) => {
    setDateRange(value);
    
    const formatDate = (date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    if (Array.isArray(value)) {
      const [start, end] = value;
      if (start && end) {
        if (start.toDateString() === end.toDateString()) {
          setFilterDates(formatDate(start));
        } else {
          setFilterDates(`${formatDate(start)} - ${formatDate(end)}`);
        }
      } else if (start) {
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

  const handleFilterChange = (setter, currentValue) => (event) => {
    const newValue = event.target.value;
    if (newValue === currentValue) {
      setter("");
    } else {
      setter(newValue);
    }
  };

  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  const handleSearch = () => {
    // Apply the current filter values
    setAppliedFilters({
      location: filterLocation,
      guests: filterGuests
    });
    setIsSearchResult(true);
    console.log("Search triggered with filters:", {
      type: filterType,
      location: filterLocation,
      dates: filterDates,
      guests: filterGuests
    });
  };

  const handleBackToAllListings = () => {
    // Clear filters and search result state
    setFilterLocation("");
    setFilterGuests("");
    setFilterDates("");
    setDateRange([null, null]);
    setAppliedFilters({ location: "", guests: "" });
    setIsSearchResult(false);
    setCurrentPage(1);
    
    // Navigate to the same page without state to clear search
    navigate('/ExpGuest', { replace: true });
  };

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, endIndex);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fffdf3ff" }}>
      {/* Navbar */}
      <NavbarGuest />

      {/* Search and Filter Bar */}
      <Box
        sx={{
          backgroundColor: "#70873F",
          py: 4,
          px: 3,
        }}
      >
        <Container maxWidth="xl">
          <Paper
            elevation={3}
            sx={{
              borderRadius: "24px",
              backgroundColor: "rgba(252, 249, 232, 0.95)",
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5 }}
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
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#30410D",
                    "& .MuiSelect-select": { padding: 0 },
                    "& .MuiSvgIcon-root": { color: "#30410D" },
                  }}
                >
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5 }}
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
                    "& .MuiSelect-select": { padding: 0 },
                    "& .MuiSvgIcon-root": { color: "#30410D" },
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5 }}
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
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#30410D" }}>
                  {filterDates || "Any date"}
                </Typography>
                <KeyboardArrowDownIcon sx={{ color: "#30410D" }} />
              </Box>
              
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
                sx={{ fontWeight: 600, color: "#676767ff", display: "block", mb: 0.5 }}
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
                    "& .MuiSelect-select": { padding: 0 },
                    "& .MuiSvgIcon-root": { color: "#30410D" },
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
                  color: "#fff",
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: "50%",
                  p: 0,
                  "&:hover": { backgroundColor: "#70873F" },
                }}
              >
                <SearchIcon />
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Experiences Grid */}
      <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
          {isSearchResult ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                onClick={handleBackToAllListings}
                sx={{
                  minWidth: "auto",
                  p: 1,
                  color: "#30410D",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <KeyboardArrowDownIcon sx={{ transform: "rotate(90deg)", fontSize: "28px" }} />
              </Button>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1C1C1C",
                  fontSize: { xs: "24px", md: "32px" },
                }}
              >
                Search Results
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                fontSize: { xs: "24px", md: "32px" },
              }}
            >
              Experiences
            </Typography>
          )}
          
          {filteredListings.length > 0 && (
            <Typography
              variant="body1"
              sx={{
                color: "#6B6B6B",
                fontSize: "16px",
              }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
          )}
        </Box>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {currentListings.map((listing) => (
                <Grid item key={listing.id} xs={12} sm={6} md={4}>
                  <ListingCardGuest
                    listing={listing}
                    onView={handleViewListing}
                    hideTypeLabel={true}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 6, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  sx={{
                    color: "#30410D",
                    borderColor: "#30410D",
                    textTransform: "none",
                    "&:hover": { borderColor: "#70873F", backgroundColor: "#dceeb46c" },
                    "&.Mui-disabled": { borderColor: "#e0e0e0", color: "#999" }
                  }}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "contained" : "outlined"}
                    onClick={() => setCurrentPage(index + 1)}
                    sx={{
                      minWidth: "40px",
                      color: currentPage === index + 1 ? "#fff" : "#30410D",
                      backgroundColor: currentPage === index + 1 ? "#30410D" : "transparent",
                      borderColor: "#30410D",
                      "&:hover": {
                        backgroundColor: currentPage === index + 1 ? "#70873F" : "#dceeb46c",
                        borderColor: "#70873F"
                      }
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  sx={{
                    color: "#30410D",
                    borderColor: "#30410D",
                    textTransform: "none",
                    "&:hover": { borderColor: "#70873F", backgroundColor: "#dceeb46c" },
                    "&.Mui-disabled": { borderColor: "#e0e0e0", color: "#999" }
                  }}
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        ) : (
          // Empty State
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#666",
                mb: 2,
              }}
            >
              No Experiences Found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#999",
                mb: 4,
              }}
            >
              Try adjusting your filters to see more results.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Listing Modal */}
      <ListingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        listing={selectedListing}
      />

      {/* Footer */}
      <Footer />
    </Box>
  );
}
