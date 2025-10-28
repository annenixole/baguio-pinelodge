// src/components/guestPage/Booking.js
import React from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Divider,
} from "@mui/material";
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
                        fontSize: "1rem",
                        "&:hover": { color: "#70873F", backgroundColor: "transparent" },
                    }}
                >
                    Back to Listings
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
                }}
            >
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
                            {address?.area || ""}, {address?.city || "Baguio City"}
                        </Typography>
                    </Box>

                    <Typography
                        variant="body1"
                        sx={{ color: "text.secondary", lineHeight: 1.8, mb: 3 }}
                    >
                        {description ||
                            "No detailed description provided for this listing yet."}
                    </Typography>

                    {/* Price Display */}
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: "1.5rem",
                                color: "#333",
                                textDecoration: promotion ? "line-through" : "none",
                            }}
                        >
                            ₱{price?.toLocaleString() || "0"}
                        </Typography>
                        <Typography
                            component="span"
                            sx={{
                                fontWeight: 400,
                                fontSize: "1rem",
                                color: "text.secondary",
                            }}
                        >
                            {type === "accommodation"
                                ? "/night"
                                : type === "experience"
                                    ? "/tour"
                                    : "/service"}
                        </Typography>
                    </Box>

                    {discountedPrice && (
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: "1.4rem",
                                color: "#DE7001",
                                mt: 1,
                            }}
                        >
                            ₱{discountedPrice.toLocaleString()}{" "}
                            <Typography
                                component="span"
                                sx={{
                                    fontWeight: 500,
                                    fontSize: "0.95rem",
                                    color: "#E68600",
                                    ml: 0.5,
                                }}
                            >
                                🎟 After Voucher
                            </Typography>
                        </Typography>
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
                                        width: 120,
                                        height: 120,
                                        objectFit: "cover",
                                        borderRadius: 2,
                                        mr: 2,
                                    }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#30410D" }}>
                                        {title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "text.secondary", mt: 0.5 }}
                                    >
                                        Hosted by <strong>{hostName || "Host"}</strong>
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
