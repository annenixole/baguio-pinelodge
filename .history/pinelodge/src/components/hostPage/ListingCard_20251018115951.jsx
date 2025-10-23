// src/components/ListingCard.jsx
import React from "react";
import {Card,CardContent,CardMedia,Typography,Box,Chip,Button,IconButton,Tooltip,} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import BathtubIcon from "@mui/icons-material/Bathtub";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ListingCard({ listing, onEdit, onDelete, onView }) {
  const {
    title,
    description,
    address,
    price,
    type,
    capacity,
    photos = [],
  } = listing;

  const image =
    Array.isArray(photos) && photos.length > 0
      ? photos[0]
      : "https://via.placeholder.com/400x250?text=No+Image";

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
        transition: "transform 0.3s ease",
        "&:hover": { transform: "scale(1.02)" },
        width: 330,
        position: "relative",
      }}
    >
      {/* Image + Type + Action Icons */}
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
            color: "#fff",
            backgroundColor:
              type === "accommodation"
                ? "#de7001ff"
                : type === "service"
                  ? "#70873fff"
                  : "#30410dff",
            borderRadius: "16px",
            px: 1.5,
            py: 0.5,
            fontSize: "0.8rem",
            boxShadow: 2,
          }}
        />

        {/* Edit & Delete Buttons */}
        <Box
          sx={{
            position: "absolute",
            top: 5,
            right: 5,
            display: "flex",
            gap: 0.5,
            bgcolor: "#77767688",
            borderRadius: "16px",
            p: 0.3,
          }}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              sx={{ color: "#ffffffff" }}
              onClick={() => onEdit(listing)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              sx={{ color: "#ffffffff" }}
              onClick={() => onDelete(listing)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Card Content */}
      <CardContent>
        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {address?.area || "Baguio City"}, {address?.city || "Baguio"}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 0.5 }}
          noWrap
          title={title}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ height: 40, overflow: "hidden", mt:1,mb:2 }}
        >
          {description}
        </Typography>

        {/* Icons per Type */}
        {type === "accommodation" && (
          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon fontSize="small" /> {capacity || 1}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <HotelIcon fontSize="small" /> {listing.bedrooms ? `${listing.bedrooms}` : "No bedrooms specified"}
            </Box>
          </Box>
        )}

        {type === "service" && (
          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon fontSize="small" /> {listing.maxGuests || 1}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <StorefrontIcon fontSize="small" /> Service
            </Box>
          </Box>
        )}

        {type === "experience" && (
          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon fontSize="small" /> {listing.groupSize || 1}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocalActivityIcon fontSize="small" /> Activity
            </Box>
          </Box>
        )}

        {/* Price and View Button */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#333" }}>
            ₱{price?.toLocaleString() || "0"}{" "}
            <Typography
              component="span"
              sx={{
                fontWeight: 400,
                fontSize: "0.85rem",
                color: "text.secondary",
              }}
            >
              {type === "accommodation"
                ? "/ night"
                : type === "service"
                  ? "/ tour"
                  : "/ person"}
            </Typography>
          </Typography>

          <Button
            size="small"
            sx={{
              color: "#30410D",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={(e) => {
              e.stopPropagation(); // prevent any parent click effects
              onView(listing);     // open the modal
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
