import React, { useEffect, useState } from "react";
import { Box, Typography, Button, AppBar, Toolbar, Avatar, Divider, Grid, Stack, IconButton } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import logo from "../../elements/BaguioPinelodgelogo.png";
import logoCursor from "../../elements/logoCursor.png";

export default function ListingLink() {
    const location = useLocation();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hostName, setHostName] = useState("");

    useEffect(() => {
        // Check if user is logged in
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchListingFromUrl = async () => {
            const params = new URLSearchParams(location.search);
            const listingParam = params.get('data');
            
            console.log("=== LISTING LINK DEBUG ===");
            console.log("URL search params:", location.search);
            console.log("Listing param:", listingParam);
            
            if (listingParam) {
                try {
                    setIsLoading(true);
                    const listingInfo = JSON.parse(decodeURIComponent(listingParam));
                    
                    console.log("Parsed listing info:", listingInfo);
                    
                    // Fetch full listing data from Firestore
                    const ref = doc(db, "users", listingInfo.hostEmail, `${listingInfo.type}s`, listingInfo.id);
                    console.log("Firestore path:", `users/${listingInfo.hostEmail}/${listingInfo.type}s/${listingInfo.id}`);
                    
                    const snap = await getDoc(ref);
                    
                    if (snap.exists()) {
                        const fullListing = {
                            id: snap.id,
                            ...snap.data(),
                            hostEmail: listingInfo.hostEmail
                        };
                        console.log("✓ Fetched listing successfully:", fullListing);
                        setListing(fullListing);
                    } else {
                        console.error("✗ Listing not found in Firestore");
                        setErrorMessage("Listing not found. The link may be invalid or the listing may have been removed.");
                    }
                } catch (error) {
                    console.error("✗ Error fetching listing from URL:", error);
                    setErrorMessage(`Error loading listing: ${error.message}`);
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.log("No listing parameter in URL");
                setErrorMessage("Invalid link. No listing data found.");
                setIsLoading(false);
            }
        };
        fetchListingFromUrl();
    }, [location.search]);

    const handleBookNow = () => {
        if (isLoggedIn) {
            // Navigate to BookingPage with listing data
            navigate("/BookingPage", { state: { listing } });
        } else {
            // Navigate to sign in with return path
            navigate("/SignIn", { state: { returnTo: "/BookingPage", listing } });
        }
    };

    const nextPhoto = () => {
        if (listing?.photos) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.photos.length);
        }
    };

    const prevPhoto = () => {
        if (listing?.photos) {
            setCurrentImageIndex((prev) => (prev - 1 + listing.photos.length) % listing.photos.length);
        }
    };

    if (isLoading) {
        return (
            <>
                {/* Navbar */}
                <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px", borderBottom: "1px solid #eee" }}>
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Link to="/" style={{ textDecoration: "none" }}>
                                <img
                                    src={logo}
                                    alt="Baguio PineLodge Logo"
                                    style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }}
                                />
                            </Link>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'lighter', fontSize: 28, mb: -1, color: '#30410D', fontFamily: "'Kingred Serif', serif" }}>
                                    BAGUIO
                                </Typography>
                                <Typography variant="caption" sx={{ letterSpacing: 3, fontSize: 13, color: '#30410D', fontFamily: "'Questrial', sans-serif" }}>
                                    PINELODGE
                                </Typography>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
                    <Typography variant="h6">Loading listing details...</Typography>
                </Box>
            </>
        );
    }

    if (errorMessage || !listing) {
        return (
            <>
                {/* Navbar */}
                <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px", borderBottom: "1px solid #eee" }}>
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Link to="/" style={{ textDecoration: "none" }}>
                                <img
                                    src={logo}
                                    alt="Baguio PineLodge Logo"
                                    style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }}
                                />
                            </Link>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'lighter', fontSize: 28, mb: -1, color: '#30410D', fontFamily: "'Kingred Serif', serif" }}>
                                    BAGUIO
                                </Typography>
                                <Typography variant="caption" sx={{ letterSpacing: 3, fontSize: 13, color: '#30410D', fontFamily: "'Questrial', sans-serif" }}>
                                    PINELODGE
                                </Typography>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{ mt: 5, textAlign: "center", px: 3 }}>
                    <Typography variant="h6" color="error">
                        {errorMessage || "Listing not found."}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate("/GuestPage")}
                        sx={{ mt: 3, backgroundColor: "#30410D", "&:hover": { backgroundColor: "#70873F" } }}
                    >
                        Browse All Listings
                    </Button>
                </Box>
            </>
        );
    }

    const photos = listing.photos && listing.photos.length > 0 ? listing.photos : ["https://via.placeholder.com/800x500?text=No+Image"];
    const inclusions = listing.inclusions || [];
    const rules = listing.rules || [];

    return (
        <>
            {/* Custom Navbar with Book Now Button */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ paddingTop: "12px", borderBottom: "1px solid #eee" }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <img
                                src={logo}
                                alt="Baguio PineLodge Logo"
                                style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }}
                            />
                        </Link>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'lighter', fontSize: 28, mb: -1, color: '#30410D', fontFamily: "'Kingred Serif', serif" }}>
                                BAGUIO
                            </Typography>
                            <Typography variant="caption" sx={{ letterSpacing: 3, fontSize: 13, color: '#30410D', fontFamily: "'Questrial', sans-serif" }}>
                                PINELODGE
                            </Typography>
                        </Box>
                    </Box>

                    {/* Book Now Button - Top Right */}
                    <Button
                        variant="contained"
                        onClick={handleBookNow}
                        sx={{
                            backgroundColor: "#DE7001",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            fontSize: "1rem",
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#c95f00" },
                        }}
                    >
                        Book Now
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Share Banner */}
            <Box
                sx={{
                    backgroundColor: "#E8F5E9",
                    borderBottom: "2px solid #4CAF50",
                    py: 2,
                    px: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                }}
            >
                <Typography
                    sx={{
                        color: "#2E7D32",
                        fontWeight: 500,
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    🔗 <span style={{ fontWeight: 600 }}>Shared with you!</span> 
                    Check out this amazing {listing.type === "accommodation" ? "place" : listing.type} at Baguio Pinelodge! 🌲
                </Typography>
            </Box>

            {/* Main Content - Similar to ListingModal */}
            <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 3 }}>
                {/* Image Carousel */}
                <Box sx={{ position: "relative", width: "100%", height: 400, overflow: "hidden", borderRadius: 2, mb: 3 }}>
                    <Box
                        component="img"
                        src={photos[currentImageIndex]}
                        alt={`photo-${currentImageIndex}`}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "0.4s ease",
                        }}
                    />

                    {/* Prev Button */}
                    {photos.length > 1 && (
                        <>
                            <IconButton
                                onClick={prevPhoto}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 10,
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                }}
                            >
                                <ArrowBackIosNewIcon fontSize="small" />
                            </IconButton>

                            {/* Next Button */}
                            <IconButton
                                onClick={nextPhoto}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 10,
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                }}
                            >
                                <ArrowForwardIosIcon fontSize="small" />
                            </IconButton>

                            {/* Page Dots */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 10,
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 1,
                                }}
                            >
                                {photos.map((_, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            bgcolor: i === currentImageIndex ? "#fff" : "rgba(255,255,255,0.5)",
                                            cursor: "pointer",
                                            transition: "0.3s",
                                        }}
                                        onClick={() => setCurrentImageIndex(i)}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>

                {/* Info Section */}
                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 3 }}>
                    {/* Title and Price */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                        }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {listing.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {listing.address?.street} {listing.address?.barangay}, {listing.address?.area},{" "}
                                    {listing.address?.city || "Baguio"}, Benguet 2600
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                            ₱{listing.price?.toLocaleString() || "0"}
                            <Typography component="span" variant="body2" color="text.secondary">
                                {" "}
                                {listing.type === "accommodation"
                                    ? "per night"
                                    : "per person"}
                            </Typography>
                        </Typography>
                    </Box>

                    {/* Host Info */}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: "#30410D", mr: 1.5 }}>
                            {listing.hostName ? listing.hostName.charAt(0).toUpperCase() : "H"}
                        </Avatar>
                        <Typography variant="body1">
                            Hosted by{" "}
                            <Typography component="span" sx={{ fontWeight: 600 }}>
                                {listing.hostName || "Host"}
                            </Typography>
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />

                    {/* About this Place/Service/Experience */}
                    <Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {listing.type === "accommodation"
                                    ? "About this Place"
                                    : listing.type === "service"
                                        ? "About this Service"
                                        : "About this Experience"}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <StarIcon sx={{ color: "#fbc02d", fontSize: 20, mr: 0.5 }} />
                                <Typography sx={{ fontWeight: 500 }}>
                                    {listing.reviewsCount || 0}{" "}
                                    <Typography
                                        component="span"
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        (reviews)
                                    </Typography>
                                </Typography>
                            </Box>
                        </Box>

                        {/* Amenities */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1.5, color: "text.secondary" }}>
                            {(listing.capacity || listing.maxGuests || listing.groupSize) && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <PeopleIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {listing.capacity
                                            ? `${listing.capacity} Guests`
                                            : listing.maxGuests
                                                ? `${listing.maxGuests} Guests`
                                                : `${listing.groupSize} Guests`}
                                    </Typography>
                                </Box>
                            )}
                            {listing.type === "accommodation" && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <HotelIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {listing.bedrooms ? `${listing.bedrooms} Bedrooms` : "No bedrooms"}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                            }}
                        >
                            {listing.description}
                        </Typography>
                    </Box>

                    {/* Inclusions */}
                    {inclusions.length > 0 && (
                        <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                                Inclusion
                            </Typography>
                            <Grid container spacing={1}>
                                {inclusions.map((item, i) => (
                                    <Grid item xs={6} sm={4} key={i}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <CheckCircleIcon fontSize="small" sx={{ color: "#70873F" }} />
                                            <Typography variant="body2">{item}</Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}

                    {/* Rules */}
                    {rules.length > 0 && (
                        <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                                Rules
                            </Typography>
                            <ul style={{ marginTop: 0, paddingLeft: 20 }}>
                                {rules.map((r, i) => (
                                    <li key={i}>
                                        <Typography variant="body2">{r}</Typography>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Box>
            </Box>
        </>
    );
}
