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
                <NavbarGuest />
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
                    <Typography variant="h6">Loading listing details...</Typography>
                </Box>
            </>
        );
    }

    if (errorMessage || !listing) {
        return (
            <>
                <NavbarGuest />
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

    const { title, description, price, type, address, photos = [], promotion, inclusions = [], rules = [], capacity, bedrooms } = listing;

    return (
        <>
            <NavbarGuest />
            
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
                    Check out this amazing {type === "accommodation" ? "place" : type} at Baguio Pinelodge! 🌲
                </Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, py: 4 }}>
                {/* Image Gallery */}
                <Card sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
                    {photos && photos.length > 0 ? (
                        <Box sx={{ position: "relative" }}>
                            <img
                                src={photos[currentImageIndex]}
                                alt={title}
                                style={{ width: "100%", height: "500px", objectFit: "cover" }}
                            />
                            {photos.length > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)" }}>
                                    {photos.map((_, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                backgroundColor: currentImageIndex === index ? "#DE7001" : "#fff",
                                                cursor: "pointer",
                                                border: "2px solid #fff",
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ height: 500, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography color="text.secondary">No images available</Typography>
                        </Box>
                    )}
                </Card>

                <Grid container spacing={3}>
                    {/* Left Column - Details */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ p: 3, borderRadius: 3 }}>
                            {/* Type Badge */}
                            <Chip
                                label={type.charAt(0).toUpperCase() + type.slice(1)}
                                sx={{
                                    mb: 2,
                                    backgroundColor: "#30410D",
                                    color: "#fff",
                                    fontWeight: 600,
                                }}
                            />

                            {/* Title */}
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                                {title}
                            </Typography>

                            {/* Location */}
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2, color: "text.secondary" }}>
                                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body1">
                                    {address?.area || ""}, {address?.city || "Baguio City"}
                                </Typography>
                            </Box>

                            {/* Capacity Info */}
                            {type === "accommodation" && (
                                <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <PeopleIcon />
                                        <Typography>{capacity || "N/A"} Guests</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <HotelIcon />
                                        <Typography>{bedrooms || "N/A"} Bedrooms</Typography>
                                    </Box>
                                </Box>
                            )}

                            <Divider sx={{ my: 3 }} />

                            {/* Description */}
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                About this {type === "accommodation" ? "Place" : type === "service" ? "Service" : "Experience"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                                {description}
                            </Typography>

                            {/* Inclusions */}
                            {inclusions && inclusions.length > 0 && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        What's Included
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {inclusions.map((item, index) => (
                                            <Grid item xs={12} sm={6} key={index}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                                                    <Typography>{item}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </>
                            )}

                            {/* Rules */}
                            {rules && rules.length > 0 && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Rules
                                    </Typography>
                                    {rules.map((rule, index) => (
                                        <Typography key={index} sx={{ mb: 1 }}>
                                            • {rule}
                                        </Typography>
                                    ))}
                                </>
                            )}
                        </Card>
                    </Grid>

                    {/* Right Column - Booking Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, borderRadius: 3, position: "sticky", top: 20 }}>
                            {/* Price */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                                    <Box
                                        component="span"
                                        sx={{ textDecoration: promotion ? "line-through" : "none" }}
                                    >
                                        ₱{price?.toLocaleString() || "0"}
                                    </Box>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {type === "accommodation" ? "per night" : "per person"}
                                </Typography>

                                {promotion?.actualDiscountedPrice && (
                                    <>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#DE7001", mt: 1 }}>
                                            ₱{promotion.actualDiscountedPrice.toLocaleString()}
                                        </Typography>
                                        <Chip
                                            label={`${promotion.percentageDiscount}% OFF`}
                                            size="small"
                                            sx={{ mt: 1, backgroundColor: "#DE7001", color: "#fff", fontWeight: 600 }}
                                        />
                                    </>
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Book Now Button */}
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleBookNow}
                                sx={{
                                    backgroundColor: "#DE7001",
                                    color: "#fff",
                                    py: 1.5,
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    "&:hover": { backgroundColor: "#c95f00" },
                                }}
                            >
                                Book Now
                            </Button>

                            <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2, color: "text.secondary" }}>
                                Sign in to complete your booking
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            {/* Additional Info */}
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                                <StarIcon sx={{ fontSize: 16, color: "#fbc02d", verticalAlign: "middle" }} />
                                {" "}Trusted by guests from all over
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
