import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Grid,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavbarGuest from "./NavbarGuest";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const listing = location.state?.listing;

  // 🔸Carousel logic (copied from ListingModal)
  const [current, setCurrent] = useState(0);
  const photos =
    listing?.photos && listing.photos.length > 0
      ? listing.photos
      : ["https://via.placeholder.com/800x500?text=No+Image"];

  const nextPhoto = () => setCurrent((prev) => (prev + 1) % photos.length);
  const prevPhoto = () =>
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

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
    inclusions = [],
    rules = [],
    promotion,
    price,
    hostName,
  } = listing;

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
          mt: 4,
          px: 8,
          gap: 5,
        }}
      >
        {/* LEFT SIDE */}
        <Box sx={{ flex: 2, maxWidth: 800 }}>
          {/* Carousel */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 400,
              overflow: "hidden",
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <Box
              component="img"
              src={photos[current]}
              alt={`photo-${current}`}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "0.4s ease",
              }}
            />

            {/* Prev / Next */}
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

                {/* Dots */}
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
                        bgcolor:
                          i === current
                            ? "#fff"
                            : "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        transition: "0.3s",
                      }}
                      onClick={() => setCurrent(i)}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>

          {/* Listing Info */}
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mt: 3, color: "#30410D" }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              {address?.area || ""}, {address?.city || "Baguio City"}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              mt: 2,
              mb: 3,
              lineHeight: 1.7,
              color: "text.secondary",
            }}
          >
            {description}
          </Typography>

          {/* Host Info */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            Hosted by{" "}
            <Typography component="span" sx={{ fontWeight: 600 }}>
              {hostName || "Host"}
            </Typography>{" "}
            – 0 reviews
          </Typography>

          {/* Inclusions */}
          {inclusions.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mt: 3, mb: 1, color: "#30410D" }}
              >
                Inclusion
              </Typography>
              <Grid container spacing={1}>
                {inclusions.map((item, i) => (
                  <Grid item xs={6} sm={4} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ color: "#70873F", fontSize: 18 }} />
                      <Typography variant="body2">{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Rules */}
          {rules.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mt: 4, mb: 1, color: "#30410D" }}
              >
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
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#30410D", mb: 2 }}
              >
                Booking Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Guest Info */}
              <TextField
                label="Full Name"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email Address"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Contact Number"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Number of Guests"
                fullWidth
                size="small"
                sx={{ mb: 3 }}
              />

              {/* Date Section */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>Check-in</Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    color: "#30410D",
                    borderColor: "#30410D",
                  }}
                >
                  Set
                </Button>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>Check-out</Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    color: "#30410D",
                    borderColor: "#30410D",
                  }}
                >
                  Set
                </Button>
              </Box>

              {/* Discount */}
              <TextField
                label="Discount Code"
                fullWidth
                size="small"
                sx={{ mt: 2, mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />

              {/* Price Summary */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>Base Price</Typography>
                <Typography>₱{price?.toLocaleString() || "0"}</Typography>
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
                  ₱{(discountedPrice || price).toLocaleString()}
                </Typography>
              </Box>

              {/* Payment Buttons */}
              <Box
                sx={{
                  mt: 2,
                  backgroundColor: "#FFC439",
                  borderRadius: "10px",
                  textAlign: "center",
                  py: 1.5,
                  mb: 1.5,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#FFB000" },
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

              <Box
                sx={{
                  backgroundColor: "#30410D",
                  borderRadius: "10px",
                  textAlign: "center",
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#70873F" },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                >
                  Pay with Debit or Credit Card
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
