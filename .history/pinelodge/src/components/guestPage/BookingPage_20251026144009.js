import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
  Grid,
  Stack,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavbarGuest from "./NavbarGuest";
import { useLocation, useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import React, { useEffect, useState, useRef } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function BookingPage() {
  const paypal = useRef();
  const [hostName, setHostName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const listing = location.state?.listing;

  // Carousel
  const [current, setCurrent] = useState(0);
  const photos =
    listing?.photos && listing.photos.length > 0
      ? listing.photos
      : ["https://via.placeholder.com/800x500?text=No+Image"];

  const nextPhoto = () => setCurrent((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

  // Booking Form Logic
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "",
  });

  useEffect(() => {
    const fetchHostName = async () => {
      try {
        if (listing?.hostEmail) {
          const hostRef = doc(db, "users", listing.hostEmail);
          const hostSnap = await getDoc(hostRef);
          if (hostSnap.exists()) {
            setHostName(hostSnap.data().name || listing.hostEmail.split("@")[0]);
          } else {
            setHostName(listing.hostEmail.split("@")[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching host:", error);
      }
    };
    fetchHostName();
  }, [listing?.hostEmail]);

  if (!listing) {
    return (
      <Typography variant="h6" sx={{ mt: 5, textAlign: "center" }}>
        No listing details found.
      </Typography>
    );
  }

  const { title, price, type, promotion, inclusions = [], rules = [] } = listing;

  const discountedPrice = promotion?.actualDiscountedPrice
    ? Number(promotion.actualDiscountedPrice)
    : null;

  // Reset form fields
  const handleClearForm = () => {
    setFormData({ name: "", email: "", phone: "", guests: "" });
    setShowBookingForm(false);
  };

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
            fontSize: "2rem",
            "&:hover": { color: "#70873F", backgroundColor: "transparent" },
          }}
        >
          Request Booking
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
        {/* LEFT SIDE */}
        <Box sx={{ flex: 2, maxWidth: 700 }}>
          {!showBookingForm ? (
            <>
              {/* --- Original Listing Content --- */}
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
                  {listing.address?.street} {listing.address?.barangay},{" "}
                  {listing.address?.area},{" "}
                  {listing.address?.city || "Baguio"},{" Benguet 2600"}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: "#30410D", mr: 1.5 }}>
                  {listing.hostName
                    ? listing.hostName.charAt(0).toUpperCase()
                    : "H"}
                </Avatar>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  Hosted by <strong>{listing.hostName}</strong>
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

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
                      <Typography component="span" color="text.secondary" variant="body2">
                        (reviews)
                      </Typography>
                    </Typography>
                  </Box>
                </Box>

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
                  sx={{
                    color: "text.secondary",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {listing.description}
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
            </>
          ) : (
            <>
              {/* --- Booking Form --- */}
              <Box sx={{ p: 4, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Booking Information
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleClearForm}
                    sx={{ color: "gray", textTransform: "none", "&:hover": { color: "#30410D" } }}
                  >
                    Clear
                  </Button>
                </Box>

                {/* Form Fields */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {["name", "email", "phone", "guests"].map((field, i) => (
                    <Box key={i}>
                      <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                        {field === "guests"
                          ? "No. of Guest/s"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </Typography>
                      <input
                        type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        style={{
                          width: "80%",
                          height: 40,
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          padding: "0 10px",
                          backgroundColor: "#f5f5f5",
                        }}
                      />
                    </Box>
                  ))}

                  <Button
                    variant="contained"
                    sx={{
                      mt: 3,
                      backgroundColor: "#DE7001",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 1,
                      py: 1.5,
                      "&:hover": { backgroundColor: "#c95f00" },
                    }}
                    onClick={() => console.log("Booking Saved:", formData)}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* RIGHT SIDE – Booking Info */}
        <Box
          sx={{
            flex: 1,
            minWidth: 380,
            position: "relative", // fixed position replaces sticky
          }}
        >
          <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3 }}>
            <CardContent>
              {/* ✅ Listing Summary */}
              <Box
                sx={{ display: "flex", alignItems: "flex-start", mb: 2, cursor: "pointer" }}
                onClick={() => setShowBookingForm(false)} // ✅ Click image returns to listing details
              >
                <Box
                  component="img"
                  src={photos[0]}
                  alt={title}
                  sx={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 2,
                    mr: 2,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#30410D" }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                    Hosted by <strong>{listing.hostName}</strong>
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Typography sx={{ color: "#DE7001", fontSize: "1rem", mr: 0.5 }}>★</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      0 (reviews)
                    </Typography>
                  </Box>

                  {/* ✅ Price */}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      mt: 1,
                      color: "#333",
                      textDecoration: promotion ? "line-through" : "none",
                    }}
                  >
                    ₱{price?.toLocaleString() || "0"}{" "}
                    <Typography
                      component="span"
                      sx={{ fontWeight: 400, fontSize: "0.9rem", color: "text.secondary" }}
                    >
                      {type === "accommodation"
                        ? "/night"
                        : type === "experience"
                        ? "/tour"
                        : "/service"}
                    </Typography>
                  </Typography>

                  {promotion?.actualDiscountedPrice && (
                    <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#DE7001", mt: 0.5 }}>
                      ₱{promotion.actualDiscountedPrice.toLocaleString()}{" "}
                      <Typography
                        component="span"
                        sx={{ fontWeight: 500, fontSize: "0.85rem", color: "#E68600" }}
                      >
                        🎟 After Voucher
                      </Typography>
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Cancellation Policy</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Please read and understand our Cancellation Policy before booking to ensure clarity
                on cancellations, and refunds.
              </Typography>
              <Button
                variant="text"
                sx={{
                  textTransform: "none",
                  color: "#30410D",
                  fontWeight: 600,
                  p: 0,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Read Policy
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* ✅ Booking Info Section */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#000" }}>
                    Booking Information
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setShowBookingForm(true)}
                    sx={{
                      backgroundColor: "#30410D",
                      color: "#fff",
                      borderRadius: 2,
                      boxShadow: "none",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#70873F" },
                    }}
                  >
                    Set
                  </Button>
                </Box>

                <Box sx={{ pl: 1.5, mt: 2 }}>
                  <Typography sx={{ fontWeight: 500, mb: 1 }}>Name</Typography>
                  <Typography sx={{ fontWeight: 500, mb: 1 }}>Email</Typography>
                  <Typography sx={{ fontWeight: 500, mb: 1 }}>Phone number</Typography>
                  <Typography sx={{ fontWeight: 500 }}>No. of Guest/s</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 3 }}>
                  <div ref={paypal}></div>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
