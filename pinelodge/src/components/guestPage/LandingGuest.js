import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Button, Grid, Paper, MenuItem, Select, FormControl, Popover, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import imgheader from "../../elements/landing-header-img.jpg";
import section2Image1 from "../../elements/section2Image1.jpg";
import section2Image2 from "../../elements/section2Image2.jpg";
import section2Image3 from "../../elements/section2Image3.jpg";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import ExploreIcon from "@mui/icons-material/Explore";
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
    <Box sx={{ backgroundColor: "#fffdf3ff", minHeight: "100vh", width: "100%" }}>
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
          color: "#fffdf3ff",
          mt: 0,
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

      {/* About Us Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 8, lg: 10 },
          backgroundColor: "#fffdf3ff",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 4, md: 6, lg: 8 },
          alignItems: "flex-start",
        }}
      >
        {/* LEFT CONTAINER - Content */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { md: "50%", lg: "48%" },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "#70873F",
              fontSize: { xs: "0.75rem", md: "0.85rem" },
              fontWeight: 600,
              letterSpacing: 2,
              mb: 2,
              display: "block",
            }}
          >
            ABOUT US
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              color: "#30410D",
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            The Highest Level of Comfort, Convenience and Service
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.95rem", md: "1.2rem" },
              lineHeight: 1.8,
              mb: 5,
            }}
          >
            Experience the perfect blend of comfort and convenience in the heart of Baguio City.
            Our carefully curated accommodations and services are designed to make your stay
            memorable, whether you're here for relaxation or adventure. From prime locations
            near top attractions to exceptional hospitality, we ensure every moment of your
            Baguio experience exceeds expectations.
          </Typography>
          {/* FEATURE GRID */}
          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, // 👈 2 columns on sm+
              rowGap: { xs: 3, md: 4 },
              columnGap: { xs: 2, md: 4 },
            }}
          >
            {[
              {
                icon: <LocationOnIcon sx={{ color: "#70873F", fontSize: { xs: 40, md: 48 } }} />,
                title: "Prime Location",
                desc: "Strategically located near Baguio's top attractions and landmarks",
              },
              {
                icon: <VerifiedUserIcon sx={{ color: "#70873F", fontSize: { xs: 40, md: 48 } }} />,
                title: "Trusted & Safe",
                desc: "Your safety and comfort are our top priorities with 24/7 support",
              },
              {
                icon: <RoomServiceIcon sx={{ color: "#70873F", fontSize: { xs: 40, md: 48 } }} />,
                title: "Quality Service",
                desc: "Consistently high-rated accommodations and exceptional hospitality",
              },
              {
                icon: <ExploreIcon sx={{ color: "#70873F", fontSize: { xs: 40, md: 48 } }} />,
                title: "Local Expertise",
                desc: "Insider knowledge to help you discover Baguio's hidden gems",
              },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  width: "100%",
                }}
              >
                {/* Icon */}
                <Box sx={{ flexShrink: 0 }}>{item.icon}</Box>

                {/* Text beside the icon */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "#30410D",
                      mb: 0.5,
                      fontSize: { xs: "0.95rem", md: "1rem" },
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* RIGHT CONTAINER - Images */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { md: "50%", lg: "48%" },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "auto auto",
              gap: 2,
              width: "100%",
            }}
          >
            <Box
              component="img"
              src={section2Image1}
              alt="Baguio street ride"
              sx={{
                gridColumn: "1 / 3",
                width: "100%",
                height: { xs: "280px", sm: "320px", md: "380px", lg: "420px" },
                objectFit: "cover",
                borderRadius: "20px",
              }}
            />
            <Box
              component="img"
              src={section2Image3}
              alt="Baguio park walk"
              sx={{
                width: "100%",
                height: { xs: "240px", sm: "280px", md: "320px", lg: "360px" },
                objectFit: "cover",
                borderRadius: "20px",
              }}
            />
            <Box
              component="img"
              src={section2Image2}
              alt="Baguio stone ruins"
              sx={{
                width: "100%",
                height: { xs: "240px", sm: "280px", md: "320px", lg: "360px" },
                objectFit: "cover",
                borderRadius: "20px",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Recommendations */}
      <Box sx={{ py: 8, textAlign: "center", backgroundColor: "#fffdf3ff" }}>
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

      {/* Our Story Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 3, md: 8, lg: 10 },
          mx: { xs: 2, md: 3 },
          mb: 5,
          backgroundColor: "#30410D",
          borderRadius: "32px",
          color: "#fffdf3ff",
        }}
      >
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Side - Our Story Text */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: "1.75rem", md: "2rem" },
                color: "#fffdf3ff",
              }}
            >
              Our Story
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                lineHeight: 1.8,
                fontSize: { xs: "0.95rem", md: "1rem" },
                color: "#f5f5f5",
              }}
            >
              Founded with a passion for showcasing the beauty of Baguio City,
              PineLodge has been helping travelers find their perfect mountain retreat
              since 2020.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontSize: { xs: "0.95rem", md: "1rem" },
                color: "#f5f5f5",
              }}
            >
              We believe in creating experiences that go beyond just accommodation.
              From cozy lodges to breathtaking experiences, we curate every aspect of
              your stay to ensure lasting memories in the City of Pines.
            </Typography>
          </Grid>

          {/* Right Side - Stats Grid */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: "rgba(112, 135, 63, 0.3)",
                borderRadius: "24px",
                p: { xs: 3, md: 4 },
              }}
            >
              <Grid container spacing={3}>
                {/* Happy Guests */}
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        color: "#c9d1b8",
                      }}
                    >
                      Happy Guests
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        color: "#fffdf3ff",
                      }}
                    >
                      10,000+
                    </Typography>
                  </Box>
                </Grid>

                {/* Properties */}
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        color: "#c9d1b8",
                      }}
                    >
                      Properties
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        color: "#fffdf3ff",
                      }}
                    >
                      50+
                    </Typography>
                  </Box>
                </Grid>

                {/* Years Active */}
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        color: "#c9d1b8",
                      }}
                    >
                      Years Active
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        color: "#fffdf3ff",
                      }}
                    >
                      5+
                    </Typography>
                  </Box>
                </Grid>

                {/* Avg Rating */}
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        color: "#c9d1b8",
                      }}
                    >
                      Avg Rating
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        color: "#fffdf3ff",
                      }}
                    >
                      4.8/5
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 8, lg: 10 },
          backgroundColor: "#fffdf3ff",
        }}
      >
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              color: "#30410D",
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              color: "#666",
              maxWidth: 700,
              mx: "auto",
            }}
          >
            Find answers to common questions about booking and staying with us
          </Typography>
        </Box>

        {/* FAQ Accordions */}
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          {/* FAQ 1 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                How do I make a reservation?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                Making a reservation is easy! Simply use our search bar at the top of the page to select your accommodation type, location, dates, and number of guests. Browse through available options, select your preferred property, and click "Book Now" to complete your reservation.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* FAQ 2 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                What is your cancellation policy?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                Our cancellation policy varies by property. Generally, you can cancel up to 48 hours before check-in for a full refund. Some properties may have different policies, which will be clearly stated during the booking process. Please review the specific cancellation terms for your selected accommodation.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* FAQ 3 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                What amenities are included in the accommodations?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                Amenities vary by property but typically include Wi-Fi, heating, clean linens, towels, and basic toiletries. Many accommodations also offer parking, kitchen facilities, and scenic views. Each listing provides a detailed amenities list to help you choose the perfect place for your stay.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* FAQ 4 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                Is transportation to the property included?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                Transportation is not automatically included in the booking. However, many hosts can arrange airport or bus terminal pickup for an additional fee. We also provide guidance on public transportation options and local taxi services to help you reach your accommodation easily.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* FAQ 5 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                Can I modify my booking after confirmation?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                Yes, you can modify your booking subject to availability and the property's modification policy. Changes to dates, number of guests, or other details can be requested through your booking dashboard. Additional charges may apply for modifications made close to your check-in date.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* FAQ 6 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                Are pets allowed in the accommodations?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                Pet policies vary by property. Some accommodations welcome pets with prior notice and may charge a small additional fee, while others have a no-pet policy. Please check the specific listing details or contact the host directly to confirm their pet policy before booking.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* FAQ 7 */}
          <Accordion
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#70873F" }} />}
              sx={{
                py: 2,
                px: { xs: 2, md: 3 },
                "&:hover": {
                  backgroundColor: "#ffffffff",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  color: "#30410D",
                }}
              >
                What payment methods do you accept?
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                pt: 0,
                backgroundColor: "#ffffffff",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#666",
                  lineHeight: 1.7,
                }}
              >
                We accept various payment methods including major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. All transactions are processed securely through our encrypted payment system. Payment is typically required at the time of booking to confirm your reservation.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* Listing Modal */}
      <ListingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        listing={selectedListing}
      />
    </Box>
  );
}
