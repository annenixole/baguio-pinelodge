import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Avatar, Divider, Grid, Stack, Button, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ListingModal({ open, onClose, listing }) {
    const [current, setCurrent] = useState(0);

    if (!listing) return null;

    const photos =
        listing.photos && listing.photos.length > 0
            ? listing.photos
            : ["https://via.placeholder.com/800x500?text=No+Image"];

    const inclusions = listing.inclusions || [];
    const rules = listing.rules || [];

    const nextPhoto = () => setCurrent((prev) => (prev + 1) % photos.length);
    const prevPhoto = () =>
        setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

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
            }} >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                }} >
                Listing Details
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/*Image Carousel */}
                <Box sx={{ position: "relative", width: "100%", height: 400, overflow: "hidden" }}>
                    <Box
                        component="img"
                        src={photos[current]}
                        alt={`photo-${current}`}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 0,
                            transition: "0.4s ease",
                        }}
                    />

                    {/* Prev Button */}
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

                            {/* Next Button */}
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

                            {/* Page Dots */}
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
                                            bgcolor: i === current ? "#fff" : "rgba(255,255,255,0.5)",
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

                {/*Info Section */}
                <Box sx={{ p: 3 }}>
                    {/* Title and Price */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                        }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {listing.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                <LocationOnIcon fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {listing.address?.street} {listing.address?.barangay}, {listing.address?.area},{" "}
                                    {listing.address?.city || "Baguio"},{" Benguet 2600"}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                            ₱{listing.price?.toLocaleString() || "0"}
                            <Typography component="span" variant="body2" color="text.secondary">
                                {" "}
                                {listing.type === "accommodation"
                                    ? "per night"
                                    : listing.type === "service"
                                        ? "per service"
                                        : "per tour"}
                            </Typography>
                        </Typography>
                    </Box>

                    {/* Host Info */}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: "#30410D", mr: 1.5 }}>
                            {listing.hostName ? listing.hostName.charAt(0).toUpperCase() : "H"}
                        </Avatar>
                        <Typography variant="body1">
                            Hosted by{" "}
                            <Typography component="span" sx={{ fontWeight: 600 }}>
                                {listing.hostName || "you"}
                            </Typography>
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />

                    {/* About this Place */}
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

                        {/* Amenities */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1.5, color: "text.secondary" }}>
                            {(listing.capacity || listing.maxGuests || listing.groupSize) && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <PeopleIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {listing.capacity
                                            ? `${listing.capacity} Guests`
                                            : listing.maxGuests
                                                ? `${listing.maxGuests} Guests`
                                                : `${listing.groupSize} Guests`}
                                    </Typography>
                                </Box>
                            )}
                            {listing.type === "accommodation" && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <HotelIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {listing.bedrooms ? `${listing.bedrooms} Bedrooms` : "No bedrooms"}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{color: "text.secondary",whiteSpace: "pre-wrap",wordWrap: "break-word",overflowWrap: "break-word", }}
                        > {listing.description}
                        </Typography>
                    </Box>

                    {/* Inclusions */}
                    {inclusions.length > 0 && (
                        <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                                Inclusion
                            </Typography>
                            <Grid container spacing={1}>
                                {inclusions.map((item, i) => (
                                    <Grid item xs={6} sm={4} key={i}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <CheckCircleIcon fontSize="small" sx={{ color: "#70873F" }} />
                                            <Typography variant="body2">{item}</Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}

                    {/* Rules */}
                    {rules.length > 0 && (
                        <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
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
