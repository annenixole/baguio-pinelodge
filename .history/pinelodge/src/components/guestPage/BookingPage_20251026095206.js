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

        {/* RIGHT: Booking Summary */}
        <Box
          sx={{
            flex: 1,
            minWidth: 350,
            position: "sticky",
            top: 120,
          }}
        >
          <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, mb: 2, color: "#30410D" }}
              >
                Booking Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Pricing Details */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>Base Price</Typography>
                <Typography>
                  ₱{price?.toLocaleString() || "0"}
                </Typography>
              </Box>

              {promotion?.percentageDiscount && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ color: "#DE7001" }}>
                    Discount ({promotion.percentageDiscount}%)
                  </Typography>
                  <Typography sx={{ color: "#DE7001" }}>
                    -₱
                    {(
                      (price * promotion.percentageDiscount) /
                      100
                    ).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                  Total
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#DE7001",
                  }}
                >
                  ₱
                  {(
                    discountedPrice || price
                  ).toLocaleString()}
                </Typography>
              </Box>

              {/* PayPal Button Placeholder */}
              <Box
                sx={{
                  mt: 2,
                  backgroundColor: "#FFC439",
                  borderRadius: "10px",
                  textAlign: "center",
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#FFB000",
                  },
                  transition: "0.2s",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#111",
                    letterSpacing: 0.5,
                    fontSize: "1rem",
                  }}
                >
                  Pay with PayPal
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
