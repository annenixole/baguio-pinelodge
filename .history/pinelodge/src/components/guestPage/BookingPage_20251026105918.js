import React from "react";
import { Box, Typography, Button, Card, CardContent, CardMedia, Divider, } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavbarGuest from "./NavbarGuest";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const listing = location.state?.listing;

    if (!listing) {
        return (
            <Typography variant="h6" sx={{ mt: 5, textAlign: "center" }}>
                No listing details found.
            </Typography>
        );
    }

    const {
        title,
        description,
        address,
        price,
        type,
        photos = [],
        promotion,
    } = listing;

    const image =
        Array.isArray(photos) && photos.length > 0
            ? photos[0]
            : "https://via.placeholder.com/600x400?text=No+Image";

    const discountedPrice = promotion?.actualDiscountedPrice
        ? Number(promotion.actualDiscountedPrice)
        : null;

    return (
        <>
            <NavbarGuest />
            {/* Back Button */}
            <Box sx={{ mt: 3, ml: 8 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: "#30410D",
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "2rem",
                        "&:hover": { color: "#70873F", backgroundColor: "transparent" },
                    }}>
                    Request Booking
                </Button>
            </Box>

            {/* Main Layout */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    mt: 5,
                    gap: 6,
                    px: 8,
                }}>

                {/* LEFT: Listing Info */}
                <Box sx={{ flex: 2, maxWidth: 800 }}>
                    <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
                        <CardMedia
                            component="img"
                            height="400"
                            image={image}
                            alt={title}
                            sx={{ objectFit: "cover" }}
                        />
                    </Card>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mt: 3,
                            color: "#30410D",
                        }}
                    >
                        {title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 2 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                        <Typography variant="body1" color="text.secondary">
                            {listing.address?.street} {listing.address?.barangay}, {listing.address?.area},{" "}
                            {listing.address?.city || "Baguio"},{" Benguet 2600"}
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
                                {listing.hostName || "you"}
                            </Typography>
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />

                    {/* About this Place */}
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
                                About this Place
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
                            sx={{ color: "text.secondary", whiteSpace: "pre-wrap", wordWrap: "break-word", overflowWrap: "break-word", }}
                        > {listing.description}
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

                {/* RIGHT SIDE – Booking Info */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 380,
                        position: "sticky",
                        top: 120,
                    }}
                >
                    <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3 }}>
                        <CardContent>
                            {/* ✅ Listing Summary */}
                            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                                <Box
                                    component="img"
                                    src={photos[0]}
                                    alt={title}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        objectFit: "cover",
                                        borderRadius: 2,
                                        mr: 2,
                                    }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#30410D" }}>
                                        {title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "text.secondary", mt: 0.5 }}
                                    >
                                        Hosted by <strong>Hostname</strong>
                                    </Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                        <Typography sx={{ color: "#DE7001", fontSize: "1rem", mr: 0.5 }}>
                                            ★
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            0 (reviews)
                                        </Typography>
                                    </Box>

                                    {/* ✅ Price Display */}
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "1.2rem",
                                            mt: 1,
                                            color: "#333",
                                            textDecoration: promotion ? "line-through" : "none",
                                        }}
                                    >
                                        ₱{price?.toLocaleString() || "0"}{" "}
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontWeight: 400,
                                                fontSize: "0.9rem",
                                                color: "text.secondary",
                                            }}
                                        >
                                            / per night
                                        </Typography>
                                    </Typography>

                                    {promotion?.actualDiscountedPrice && (
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "1.1rem",
                                                color: "#DE7001",
                                                mt: 0.5,
                                            }}
                                        >
                                            ₱{promotion.actualDiscountedPrice.toLocaleString()}{" "}
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: "0.85rem",
                                                    color: "#E68600",
                                                }}
                                            >
                                                🎟 After Voucher
                                            </Typography>
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* ✅ Cancellation Section */}
                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Free Cancellation</Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                            >
                                Cancel before <strong>Nov 17</strong> for a full refund
                            </Typography>
                            <Button
                                variant="text"
                                sx={{
                                    textTransform: "none",
                                    color: "#30410D",
                                    fontWeight: 600,
                                    p: 0,
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                Read Policy
                            </Button>

                            <Divider sx={{ my: 3 }} />

                            {/* ✅ Booking Information Header */}
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 700, color: "#30410D", mb: 2 }}
                            >
                                Booking Information
                            </Typography>

                            {/* (keep your booking form + pricing section below this unchanged) */}

                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </>
    );
}
