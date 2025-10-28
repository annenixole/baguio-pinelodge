import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, IconButton, Menu, MenuItem, Tooltip, } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ManageOfferModal from "./ManageOfferModal";

export default function ListingCard({ listing, onEdit, onDelete, onView, onPublish }) {
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const {
    title,
    description,
    address,
    price,
    type,
    capacity,
    photos = [],
    status,
  } = listing;

  const image =
    Array.isArray(photos) && photos.length > 0
      ? photos[0]
      : "https://via.placeholder.com/400x250?text=No+Image";

  const isDraft = status === "draft";
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action) => {
    handleMenuClose();
    if (action === "edit") onEdit(listing);
    if (action === "delete") onDelete(listing);
    if (action === "publish" && onPublish) onPublish(listing);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 2,
        overflow: "hidden",
        transition: "transform 0.3s ease",
        "&:hover": { transform: "scale(1.02)" },
        width: 330,
        position: "relative",
        border: isDraft ? "2px solid #d0d0d0" : "none",
        backgroundColor: isDraft ? "#f5f5f5" : "#fff",
      }}
    >
      {/* Image + 3-dot menu */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{
            objectFit: "cover",
            filter: isDraft ? "grayscale(80%) brightness(0.9)" : "none",
          }}
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
            backgroundColor:
              type === "accommodation"
                ? "#ffffffcc"
                : type === "service"
                  ? "#ffffffcc"
                  : "#ffffffcc",
            borderRadius: "16px",
            px: 1.5,
            py: 0.5,
            fontSize: "0.8rem",
            boxShadow: 2,
          }}
        />

        {/* ✅ Promo Banner */}
        {listing.promotion && listing.promotion.percentageDiscount && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 0,
              bgcolor: "#DE7001",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 2,
              py: 0.5,
              borderTopRightRadius: "6px",
              borderBottomRightRadius: "6px",
              boxShadow: 2,
            }}
          >
            {listing.promotion.percentageDiscount}% OFF DISCOUNT
          </Box>
        )}

        {/* 3-dot Menu Button */}
        <Tooltip title="Options">
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "#ffffffcc",
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 3,
              minWidth: 160,
            },
          }}
        >
          <MenuItem onClick={() => handleMenuAction("edit")}>Edit</MenuItem>
          <MenuItem onClick={() => setOfferModalOpen(true)}>Manage Offers</MenuItem>
          <ManageOfferModal
            open={offerModalOpen}
            onClose={() => setOfferModalOpen(false)}
            activePromotion={listing.promotion || null}
            listingId={listing.id}
            listingType={listing.type}
            listingPrice={listing.price}
            listingAvailability={listing.availability} />

          {isDraft && (
            <MenuItem onClick={() => handleMenuAction("publish")}>Publish</MenuItem>
          )}
          <MenuItem
            onClick={() => handleMenuAction("delete")}
            sx={{ color: "red", fontWeight: 500 }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ textAlign: "left", px: 2, }}>
        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {address?.area || " "}, {address?.city || "Baguio City"}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            color: isDraft ? "#555" : "inherit",
          }}
          noWrap
          title={title}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ height: 40, overflow: "hidden", mt: 1, mb: 2 }}
        >
          {description}
        </Typography>

        {/* Icons per Type */}
        {type === "accommodation" && (
          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon fontSize="small" /> {capacity}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <HotelIcon fontSize="small" />{" "}
              {listing.bedrooms ? `${listing.bedrooms}` : "No bedrooms"}
            </Box>
          </Box>
        )}

        {type === "service" && (
          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon fontSize="small" /> {listing.maxGuests ? `${listing.maxGuests}` : " "}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <StorefrontIcon fontSize="small" /> Service
            </Box>
          </Box>
        )}

        {type === "experience" && (
          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon fontSize="small" /> {listing.groupSize ? `${listing.groupSize}` : " "}
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
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: isDraft ? "#666" : "#333",
                textDecoration: listing.promotion ? "line-through" : "none",
              }}
            >
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
                  ? "/ per night"
                  : type === "experience"
                    ? "/ per tour"
                    : "/ per service"}
              </Typography>
            </Typography>

            {listing.promotion && listing.promotion.actualDiscountedPrice && (
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#DE7001",
                }}
              >
                ₱{Number(listing.promotion.actualDiscountedPrice).toLocaleString()}{" "}
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
            size="small"
            sx={{
              color: "#30410D",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                textDecoration: "underline",
                backgroundColor: "#ffff",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onView(listing);
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
