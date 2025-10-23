import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import BathtubIcon from "@mui/icons-material/Bathtub";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ListingModal({ open, onClose, listing }) {
  if (!listing) return null;

  const image =
    listing.photos && listing.photos.length > 0
      ? listing.photos[0]
      : "https://via.placeholder.com/800x500?text=No+Image";

  const inclusions = listing.inclusions || [];
  const rules = listing.rules || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#fff",
        },
      }}
    >
      {/* Header with Close Button */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        Listing Details
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* 🖼️ Image */}
        <Box
          component="img"
          src={image}
          alt={listing.title}
          sx={{
            width: "100%",
            height: 400,
            objectFit: "cover",
          }}
        />

        {/* 🏡 Main Info Section */}
        <Box sx={{ p: 3 }}>
          {/* Title & Price Row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {listing.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <LocationOnIcon
                  fontSize="small"
                  sx={{ color: "gray", mr: 0.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {listing.address?.street || "123"}, {listing.address?.area},{" "}
                  {listing.address?.city || "Baguio Philippines"}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: "#333" }}>
              ₱{listing.price?.toLocaleString() || "0"}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {" "}
                {listing.type === "accommodation"
                  ? "per night"
                  : listing.type === "service"
                  ? "per tour"
                  : "per person"}
              </Typography>
            </Typography>
          </Box>

          {/* 👤 Host Info */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: "#70873F", mr: 1.5 }}>
              {listing.hostName
                ? listing.hostName.charAt(0).toUpperCase()
                : "H"}
            </Avatar>
            <Typography variant="body1">
              Hosted by{" "}
              <Typography component="span" sx={{ fontWeight: 600 }}>
                {listing.hostName || "you"}
              </Typography>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ⭐ About this Place */}
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

            {/* Amenities icons example */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mb: 1.5,
                color: "text.secondary",
              }}
            >
              {listing.capacity && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PeopleIcon fontSize="small" />
                  <Typography variant="body2">
                    {listing.capacity} Guests
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HotelIcon fontSize="small" />
                <Typography variant="body2">{listing.bedrooms ? `${listing.bedrooms} Bedrooms` : "No bedrooms specified"}</Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {listing.description ||
                "This is a wonderful place to stay with great amenities and cozy ambiance."}
            </Typography>
          </Box>

          {/* 🧩 Inclusions */}
          {inclusions.length > 0 && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mt: 3, mb: 1 }}
              >
                Inclusion
              </Typography>
              <Grid container spacing={1}>
                {inclusions.map((item, i) => (
                  <Grid item xs={6} sm={4} key={i}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon
                        fontSize="small"
                        sx={{ color: "#5ca166" }}
                      />
                      <Typography variant="body2">{item}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* 📜 Rules */}
          {rules.length > 0 && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mt: 3, mb: 1 }}
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
      </DialogContent>
    </Dialog>
  );
}
