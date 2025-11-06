import React, { useState, useEffect } from "react";
import {Card,CardContent,CardMedia,Typography,Box,Chip,Button,IconButton,Menu,MenuItem,Tooltip,Dialog,DialogTitle,DialogContent,DialogActions,} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FacebookIcon from "@mui/icons-material/Facebook";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function ListingCardGuest({ listing, onView, hideTypeLabel = false }) {
    const navigate = useNavigate();
    const [shareAnchorEl, setShareAnchorEl] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isUserSignedIn, setIsUserSignedIn] = useState(false);
    const [promoDetailsOpen, setPromoDetailsOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Check if user is signed in and load their favorites
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setIsUserSignedIn(!!user);
            setCurrentUser(user);
            
            if (user) {
                // Load user's favorites from Firestore
                await loadUserFavorites(user.uid);
            } else {
                setIsFavorite(false);
            }
        });
        return () => unsubscribe();
    }, [listing.id]);

    const loadUserFavorites = async (userId) => {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const favorites = userData.favorites || [];
                setIsFavorite(favorites.includes(listing.id));
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        }
    };

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

    // Share handlers
    const handleShareClick = (event) => {
        event.stopPropagation();
        setShareAnchorEl(event.currentTarget);
    };

    const handleShareClose = () => {
        setShareAnchorEl(null);
        setCopySuccess(false);
    };

    const getListingUrl = () => {
        // Encode listing data to pass to ListingLink page (no login required)
        const listingData = encodeURIComponent(JSON.stringify({
            id: listing.id,
            title: listing.title,
            type: listing.type,
            hostEmail: listing.hostEmail
        }));
        const url = `${window.location.origin}/ListingLink?data=${listingData}`;
        console.log("Generated share URL:", url);
        return url;
    };

    const handleCopyLink = (event) => {
        event.stopPropagation();
        const url = getListingUrl();
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => {
                setCopySuccess(false);
                handleShareClose();
            }, 1500);
        });
    };

    const handleShareFacebook = (event) => {
        event.stopPropagation();
        const url = getListingUrl();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        handleShareClose();
    };

    const handleFavoriteClick = async (event) => {
        event.stopPropagation();
        
        if (!currentUser) {
            alert("Please sign in to add favorites");
            return;
        }
        
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            
            if (isFavorite) {
                // Remove from favorites in Firestore
                await updateDoc(userDocRef, {
                    favorites: arrayRemove(listing.id)
                });
                setIsFavorite(false);
            } else {
                // Add to favorites in Firestore
                await updateDoc(userDocRef, {
                    favorites: arrayUnion(listing.id)
                });
                setIsFavorite(true);
            }
            
            // Trigger custom event to refresh favorites page
            window.dispatchEvent(new Event('favoritesUpdated'));
        } catch (error) {
            console.error("Error updating favorites:", error);
            alert("Failed to update favorites. Please try again.");
        }
    };

    return (
        <>
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: 2,
                overflow: "hidden",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.02)" },
                width: 330,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
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

                {/* Type Label - Hidden on Accommodation page */}
                {!hideTypeLabel && (
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
                )}

                {/* ✅ Promotion Banner - Clickable - Only show when user is signed in */}
                {isUserSignedIn && promotion?.percentageDiscount && (
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
                        <span>{promotion.percentageDiscount}% OFF DISCOUNT</span>
                        {promotion?.actualDiscountedPrice && (
                            <>
                                <span>|</span>
                                <span>₱{Number(promotion.actualDiscountedPrice).toLocaleString()}</span>
                                <span>🎟</span>
                                <span>After Voucher</span>
                            </>
                        )}
                    </Box>
                )}

                {/* Favorite (Heart) Button - Only show when user is signed in */}
                {isUserSignedIn && (
                    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                        <IconButton
                            onClick={handleFavoriteClick}
                            sx={{
                                position: "absolute",
                                top: 10,
                                right: 55,
                                bgcolor: "#ffffffcc",
                                "&:hover": { bgcolor: "#f0f0f0" },
                                boxShadow: 2,
                            }}
                            size="small"
                        >
                            {isFavorite ? (
                                <FavoriteIcon fontSize="small" sx={{ color: "#de4001ff" }} />
                            ) : (
                                <FavoriteBorderIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                )}

                {/* Share Button */}
                <Tooltip title="Share">
                    <IconButton
                        onClick={handleShareClick}
                        sx={{
                            position: "absolute",
                            top: 10,
                            right: isUserSignedIn ? 10 : 10,
                            bgcolor: "#ffffffcc",
                            "&:hover": { bgcolor: "#f0f0f0" },
                            boxShadow: 2,
                        }}
                        size="small"
                    >
                        <ShareIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {/* Share Menu */}
                <Menu
                    anchorEl={shareAnchorEl}
                    open={Boolean(shareAnchorEl)}
                    onClose={handleShareClose}
                    onClick={(e) => e.stopPropagation()}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: 3,
                            minWidth: 200,
                        },
                    }}
                >
                    <MenuItem onClick={handleCopyLink}>
                        <ContentCopyIcon fontSize="small" sx={{ mr: 1.5 }} />
                        {copySuccess ? "Link Copied!" : "Copy Link"}
                    </MenuItem>
                    <MenuItem onClick={handleShareFacebook}>
                        <FacebookIcon fontSize="small" sx={{ mr: 1.5, color: "#1877F2" }} />
                        Share on Facebook
                    </MenuItem>
                </Menu>
            </Box>

            {/* Card Content */}
            <CardContent sx={{ textAlign: "left", px: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {address?.area || " "}, {address?.city || "Baguio City"}
                    </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                    {title}
                </Typography>

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

                {/* ✅ Price & Discount Display */}
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
                                color: "#333",
                            }}
                        >
                            <Box component="span" sx={{ textDecoration: (isUserSignedIn && promotion) ? "line-through" : "none" }}>
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
                                    ? "/per night"
                                    : "/per person"}
                            </Typography>
                        </Typography>
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
                        if (isUserSignedIn) {
                            navigate("/BookingPage", { state: { listing } });
                        } else {
                            navigate("/SignIn");
                        }
                    }}
                >
                    Book Now
                </Button>
            </Box>
        </CardContent>
    </Card >

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
            {promotion && (
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
                            }}
                        >
                            <LocalOfferIcon sx={{ fontSize: "2.5rem" }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "#000", lineHeight: 1.3 }}>
                                {promotion.promoCode} - {promotion.percentageDiscount}% off discount
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#666", mt: 0.5, fontSize: "0.875rem" }}>
                                Valid from {new Date(promotion.startDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit',
                                    month: 'short', 
                                    year: 'numeric' 
                                })} - {new Date(promotion.endDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit',
                                    month: 'short', 
                                    year: 'numeric' 
                                })}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Savings Badge */}
                    {promotion.actualDiscountedPrice && (
                        <Box sx={{ mb: 2.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            <Chip
                                label={`Save ₱${(price - promotion.actualDiscountedPrice).toFixed(0)}`}
                                sx={{
                                    bgcolor: "#FFE4CC",
                                    color: "#E68600",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    height: "28px",
                                    borderRadius: "8px",
                                    px: 1,
                                }}
                            />
                            {promotion.minSpendRequired && (
                                <Chip
                                    label={`Min. spend ₱${Number(promotion.minSpendRequired).toLocaleString()}`}
                                    sx={{
                                        bgcolor: "#FFF4E6",
                                        color: "#E68600",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        height: "28px",
                                        borderRadius: "8px",
                                        px: 1,
                                    }}
                                />
                            )}
                            {promotion.maxUsers && (
                                <Chip
                                    label={`${promotion.maxUsers} left`}
                                    sx={{
                                        bgcolor: "#E8F5E9",
                                        color: "#2E7D32",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        height: "28px",
                                        borderRadius: "8px",
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
                        {promotion.termsAndConditions && promotion.termsAndConditions.length > 0 ? (
                            <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.8, color: "#666", fontSize: "0.875rem" } }}>
                                {promotion.termsAndConditions.map((term, index) => (
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
  </> );
}
