import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function ListingModal({ open, onClose, listing }) {
  if (!listing) return null;

  const image =
    listing.photos && listing.photos.length > 0
      ? listing.photos[0]
      : "https://via.placeholder.com/800x500?text=No+Image";

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
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        {listing.title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Image */}
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

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Chip
            label={listing.type.toUpperCase()}
            sx={{
              mb: 1,
              backgroundColor:
                listing.type === "accommodation"
                  ? "#4CAF50"
                  : listing.type === "service"
                  ? "#FFC107"
                  : "#2196F3",
              color: "#fff",
              fontWeight: 600,
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
            <Typography variant="body2" color="text.secondary">
              {listing.address?.area || "Baguio"}, {listing.address?.city || "Baguio"}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
            ₱{listing.price?.toLocaleString()}{" "}
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
            >
              {listing.type === "accommodation"
                ? "/ night"
                : listing.type === "service"
                ? "/ tour"
                : "/ person"}
            </Typography>
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {listing.description}
          </Typography>

          {/* Details by type */}
          <Divider sx={{ my: 2 }} />
          {listing.type === "accommodation" && (
            <Typography>
              <PeopleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Capacity: {listing.capacity || 1}
            </Typography>
          )}
          {listing.type === "service" && (
            <Typography>
              <StorefrontIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Max Guests: {listing.maxGuests || 1}
            </Typography>
          )}
          {listing.type === "experience" && (
            <Typography>
              <LocalActivityIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Group Size: {listing.groupSize || 1}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
