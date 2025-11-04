import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, IconButton, Menu, MenuItem, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import StarIcon from "@mui/icons-material/Star";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CloseIcon from "@mui/icons-material/Close";
import ManageOfferModal from "./ManageOfferModal";

export default function ListingCard({ listing, onEdit, onDelete, onView, onPublish }) {
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [promoDetailsOpen, setPromoDetailsOpen] = useState(false);

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
        display: "flex",
        flexDirection: "column",
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

         {/* ✅ Promo Banner - Clickable */}
        {listing.promotion && listing.promotion.percentageDiscount && (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              setPromoDetailsOpen(true);
            }}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "#DE7001",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 2,
              py: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#C86001",
              }
            }}
          >
            <span>{listing.promotion.percentageDiscount}% OFF DISCOUNT</span>
            {listing.promotion?.actualDiscountedPrice && (
              <>
                <span>|</span>
                <span>₱{Number(listing.promotion.actualDiscountedPrice).toLocaleString()}</span>
                <span>🎟</span>
                <span>After Voucher</span>
              </>
            )}
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
      <CardContent sx={{ textAlign: "left", px: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
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
          sx={{ 
            height: 40, 
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mt: 1,
            mb: 2
          }}
        >
          {description}
        </Typography>

        {/* Type icons and Reviews - Same Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          {/* Left: Type icons */}
          <Box sx={{ display: "flex", gap: 2, color: "text.secondary" }}>
            {type === "accommodation" && (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PeopleIcon fontSize="small" /> {capacity || 1}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <HotelIcon fontSize="small" /> {listing.bedrooms || "No bedrooms"}
                </Box>
              </>
            )}
          </Box>

          {/* Right: Reviews Display */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StarIcon sx={{ color: "#FFB800", fontSize: "1.2rem" }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#333" }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              (reviews)
            </Typography>
          </Box>
        </Box>

        {/* Price and View Button */}
        <Box
          sx={{
            mt: "auto",
            pt: 2,
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
                color: isDraft ? "#666" : "#333",
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
                  : "/ per person"}
              </Typography>
            </Typography>
          </Box>


          <Button
            size="small"
            variant="contained"
            sx={{
              backgroundColor: "#30410D",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "25px",
              "&:hover": { 
                backgroundColor: "#70873F" 
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

      {/* Promo Details Modal */}
      <Dialog 
        open={promoDetailsOpen} 
        onClose={() => setPromoDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            bgcolor: "#E68600", 
            color: "#fff", 
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          Promo Details
          <IconButton
            onClick={() => setPromoDetailsOpen(false)}
            sx={{ 
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 5 }}>
          {listing.promotion && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {/* Voucher Code and Discount */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2, mt: 5 }}>
                <Box
                  sx={{
                    color: "#E68600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                  }}
                >
                  <LocalOfferIcon sx={{ fontSize: "2.5rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "#000", lineHeight: 1.3 }}>
                    {listing.promotion.promoCode} - {listing.promotion.percentageDiscount}% off discount
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", mt: 0.5, fontSize: "0.875rem" }}>
                    Valid from {new Date(listing.promotion.startDate).toLocaleDateString('en-GB', { 
                      day: '2-digit',
                      month: 'short', 
                      year: 'numeric' 
                    })} - {new Date(listing.promotion.endDate).toLocaleDateString('en-GB', { 
                      day: '2-digit',
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Savings Badge */}
              {listing.promotion.actualDiscountedPrice && (
                <Box sx={{ mb: 2.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={`Save ₱${(price - listing.promotion.actualDiscountedPrice).toFixed(0)}`}
                    sx={{
                      bgcolor: "#FFE4CC",
                      color: "#E68600",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      height: "28px",
                      borderRadius: "14px",
                      px: 1,
                    }}
                  />
                  {listing.promotion.minSpendRequired && (
                    <Chip
                      label={`Min. spend ₱${Number(listing.promotion.minSpendRequired).toLocaleString()}`}
                      sx={{
                        bgcolor: "#FFF4E6",
                        color: "#E68600",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        height: "28px",
                        borderRadius: "14px",
                        px: 1,
                      }}
                    />
                  )}
                  {listing.promotion.maxUsers && (
                    <Chip
                      label={`${listing.promotion.maxUsers} left`}
                      sx={{
                        bgcolor: "#E8F5E9",
                        color: "#2E7D32",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        height: "28px",
                        borderRadius: "14px",
                        px: 1,
                      }}
                    />
                  )}
                </Box>
              )}

              <Box sx={{ borderTop: "1px solid #E0E0E0", pt: 2.5 }}>
                {/* Terms and Conditions */}
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#000", mb: 1.5 }}>
                  Terms and Conditions
                </Typography>
                {listing.promotion.termsAndConditions && listing.promotion.termsAndConditions.length > 0 ? (
                  <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.8, color: "#666", fontSize: "0.875rem" } }}>
                    {listing.promotion.termsAndConditions.map((term, index) => (
                      <li key={index}>
                        <Typography variant="body2" component="span" sx={{ fontSize: "0.875rem" }}>
                          {term}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#999", fontStyle: "italic", fontSize: "0.875rem" }}>
                    No terms and conditions specified
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
