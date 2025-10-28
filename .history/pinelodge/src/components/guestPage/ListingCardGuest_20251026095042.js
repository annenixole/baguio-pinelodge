import React from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import { useNavigate } from "react-router-dom";

export default function ListingCardGuest({ listing, onView }) {
    const {
        title,
        description,
        address,
        price,
        type,
        capacity,
        photos = [],
        promotion, // ✅ add this line
    } = listing;

    const image =
        Array.isArray(photos) && photos.length > 0
            ? photos[0]
            : "https://via.placeholder.com/400x250?text=No+Image";

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: 2,
                overflow: "hidden",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.02)" },
                width: 330,
                cursor: "pointer",
            }}
            onClick={() => onView(listing)}
        >
            {/* Image */}
            <Box sx={{ position: "relative" }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={image}
                    alt={title}
                    sx={{ objectFit: "cover" }}
                />

                {/* Type Label */}
                <Chip
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        fontWeight: 600,
                        color: "#30410D",
                        backgroundColor: "#ffffffcc",
                        borderRadius: "16px",
                        px: 1.5,
                        py: 0.5,
                        fontSize: "0.8rem",
                        boxShadow: 2,
                    }}
                />

                {/* ✅ Promotion Banner */}
                {promotion?.percentageDiscount && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            bgcolor: "#DE7001",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                            borderTopRightRadius: "6px",
                            borderBottomRightRadius: "6px",
                        }}
                    >
                        {promotion.percentageDiscount}% OFF DISCOUNT
                    </Box>
                )}
            </Box>

            {/* Card Content */}
            <CardContent sx={{ textAlign: "left", px: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                        {address?.area || " "}, {address?.city || "Baguio City"}
                    </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ height: 40, overflow: "hidden", mt: 1, mb: 2 }}
                >
                    {description}
                </Typography>

                {/* Type icons */}
                {type === "accommodation" && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <PeopleIcon fontSize="small" /> {capacity || 1}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <HotelIcon fontSize="small" /> {listing.bedrooms || "No bedrooms"}
                        </Box>
                    </Box>
                )}

                {type === "service" && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
                        <StorefrontIcon fontSize="small" /> Service
                    </Box>
                )}

                {type === "experience" && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
                        <LocalActivityIcon fontSize="small" /> Experience
                    </Box>
                )}

                {/* ✅ Price & Discount Display */}
                <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        {/* Regular price */}
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                color: "#333",
                            }}
                        >
                            <Box component="span" sx={{ textDecoration: promotion ? "line-through" : "none" }}>
                                ₱{price?.toLocaleString() || "0"}
                            </Box>{" "}
                            <Typography
                                component="span"
                                sx={{
                                    fontWeight: 400,
                                    fontSize: "0.85rem",
                                    color: "text.secondary",
                                    textDecoration: "none",
                                }}
                            >
                                {type === "accommodation"
                                    ? "/night"
                                    : type === "experience"
                                        ? "/tour"
                                        : "/service"}
                            </Typography>
                        </Typography>

                    {/* ✅ Show discounted price if promo exists */}
                    {promotion?.actualDiscountedPrice && (
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "#DE7001",
                            }}
                        >
                            ₱{Number(promotion.actualDiscountedPrice).toLocaleString()}{" "}
                            <Typography
                                component="span"
                                sx={{
                                    fontWeight: 500,
                                    fontSize: "0.85rem",
                                    color: "#E68600",
                                    ml: 0.5,
                                }}
                            >
                                🎟 After Voucher
                            </Typography>
                        </Typography>
                    )}
                </Box>

                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#30410D",
                        color: "#fff",
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: "25px",
                        "&:hover": { backgroundColor: "#70873F" },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                         navigate("/BookingPage", { state: { listing } });
                    }}
                >
                    Book Now
                </Button>
            </Box>
        </CardContent>
    </Card >
  );
}
