import { Box, Typography, Button, Card, CardContent, Divider, Avatar, Grid, Stack, IconButton, } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavbarGuest from "./NavbarGuest";
import { useLocation, useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import React, { useEffect, useState, useRef } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


export default function BookingPage() {
    const paypal = useRef();
    const [hostName, setHostName] = useState("");
    const [currentUser, setCurrentUser] = useState({ name: "", email: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const listing = location.state?.listing;
    // Booking date selection
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [bookingRange, setBookingRange] = useState(
        listing?.type === "accommodation" ? [new Date(), new Date()] : [new Date()]
    );
    const [savedBookingRange, setSavedBookingRange] = useState(null);
    const [availabilityStart, setAvailabilityStart] = useState(null);
    const [availabilityEnd, setAvailabilityEnd] = useState(null);
    
    // Arrival time selection
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState("2:00 PM");

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                if (listing?.type && listing?.id && listing?.hostEmail) {
                    const ref = doc(db, "users", listing.hostEmail, `${listing.type}s`, listing.id);
                    const snap = await getDoc(ref);

                    if (snap.exists()) {
                        const data = snap.data();

                        if (data.availability?.start && data.availability?.end) {
                            const start = data.availability.start.toDate();
                            const end = data.availability.end.toDate();

                            const startLocal = new Date(
                                start.getFullYear(),
                                start.getMonth(),
                                start.getDate()
                            );
                            const endLocal = new Date(
                                end.getFullYear(),
                                end.getMonth(),
                                end.getDate(),
                                23,
                                59,
                                59,
                                999
                            );

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const effectiveStartDate = startLocal <= today ? today : startLocal;
                            
                            setAvailabilityStart(effectiveStartDate);
                            setAvailabilityEnd(endLocal);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
            }
        };

        if (listing) {
            fetchAvailability();
        }
    }, [listing]);



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
    const [savedBookingInfo, setSavedBookingInfo] = useState({
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

    // Fetch current user information
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(db, "users", user.email);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setCurrentUser({
                            name: userData.name || user.displayName || "",
                            email: user.email || ""
                        });
                    } else {
                        setCurrentUser({
                            name: user.displayName || "",
                            email: user.email || ""
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };
        fetchCurrentUser();
    }, []);

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
    };

    // Generate time slots from 8:00 AM to 9:00 PM
    const generateTimeSlots = () => {
        const times = [];
        for (let hour = 8; hour <= 21; hour++) {
            const period = hour >= 12 ? "PM" : "AM";
            const displayHour = hour > 12 ? hour - 12 : hour;
            times.push(`${displayHour}:00 ${period}`);
            if (hour < 21) {
                times.push(`${displayHour}:30 ${period}`);
            }
        }
        return times;
    };

    return (
        <>
            <NavbarGuest />
            {/* Back Button */}
            <Box sx={{ mt: 3, ml: 14 }}>
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

            {/* Unified Card Layout */}
            <Card
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mt: 5,
                    mx: "auto",
                    width: "80%",
                    borderRadius: 4,
                    p: 4,
                    gap: 4,
                }}
            >
                {/* LEFT SIDE */}
                <Box sx={{ flex: 2, maxWidth: 700 }}>
                    {showTimePicker ? (
                        // --- TIME PICKER VIEW ---
                        <Box sx={{ p: 4, backgroundColor: "#fff" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 3,
                                }}
                            >
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    Select Arrival Time
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setShowTimePicker(false);
                                        setSelectedTime("2:00 PM");
                                    }}
                                    sx={{
                                        color: "gray",
                                        textTransform: "none",
                                        "&:hover": { color: "#30410D" },
                                    }}
                                >
                                    Clear
                                </Button>
                            </Box>

                            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                                Choose your preferred arrival time (8:00 AM - 9:00 PM)
                            </Typography>

                            {/* Time Slots Grid */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: 2,
                                    maxHeight: 400,
                                    overflowY: "auto",
                                    pr: 1,
                                }}
                            >
                                {generateTimeSlots().map((time) => (
                                    <Button
                                        key={time}
                                        variant={selectedTime === time ? "contained" : "outlined"}
                                        onClick={() => setSelectedTime(time)}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            fontSize: "0.95rem",
                                            backgroundColor: selectedTime === time ? "#70873F" : "transparent",
                                            color: selectedTime === time ? "#fff" : "#30410D",
                                            borderColor: selectedTime === time ? "#70873F" : "#ccc",
                                            "&:hover": {
                                                backgroundColor: selectedTime === time ? "#5a6d32" : "rgba(112,135,63,0.1)",
                                                borderColor: "#70873F",
                                            },
                                        }}
                                    >
                                        {time}
                                    </Button>
                                ))}
                            </Box>

                            <Box sx={{ mt: 3, textAlign: "center" }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Selected Time:
                                </Typography>
                                <Typography sx={{ color: "#70873F", fontWeight: 600, fontSize: "1.2rem" }}>
                                    {selectedTime}
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        backgroundColor: "#DE7001",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        width: "50%",
                                        py: 1,
                                        "&:hover": { backgroundColor: "#c95f00" },
                                    }}
                                    onClick={() => setShowTimePicker(false)}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    ) : showDatePicker ? (
                        // --- CALENDAR VIEW ---
                        <Box sx={{ p: 4, backgroundColor: "#fff", }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    Booking Range
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setShowDatePicker(false);
                                        if (listing?.type === "accommodation") {
                                            setBookingRange([new Date(), new Date()]);
                                        } else {
                                            setBookingRange([new Date()]);
                                        }
                                    }}
                                    sx={{
                                        color: "gray",
                                        textTransform: "none",
                                        "&:hover": { color: "#30410D" },
                                    }}
                                >
                                    Clear
                                </Button>
                            </Box>

                            {/* Calendar with availability limits */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    "& .react-calendar": {
                                        borderRadius: "12px",
                                        border: "1px solid #ccc",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                        fontFamily: "inherit",
                                        width: "100%",
                                        maxWidth: 450,
                                    },
                                }}
                            >
                                <Calendar
                                    selectRange={type === "accommodation"}
                                    minDate={availabilityStart || new Date()}
                                    maxDate={availabilityEnd || undefined}
                                    onChange={(range) => {
                                        if (type === "accommodation") {
                                            setBookingRange(range);
                                        } else {
                                            setBookingRange([range]);
                                        }
                                    }}
                                    value={bookingRange}
                                />
                            </Box>

                            <Box sx={{ mt: 3, textAlign: "center" }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Selected Availability:
                                </Typography>

                                {/*Handle single or range dates dynamically */}
                                {bookingRange && bookingRange.length > 0 ? (
                                    type === "accommodation" && bookingRange.length === 2 ? (
                                        <Typography sx={{ color: "#70873F", fontWeight: 600 }}>
                                            {`${bookingRange[0].toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })} → ${bookingRange[1].toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}`}
                                        </Typography>
                                    ) : (
                                        <Typography sx={{ color: "#70873F", fontWeight: 600 }}>
                                            {bookingRange[0].toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </Typography>
                                    )
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No date selected yet.
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        backgroundColor: "#DE7001",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        width: "50%",
                                        py: 1,
                                        "&:hover": { backgroundColor: "#c95f00" },
                                    }}
                                    onClick={() => {
                                        setSavedBookingRange(bookingRange);
                                        setShowDatePicker(false);
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    ) : !showBookingForm ? (
                        // --- LISTING DETAILS VIEW ---
                        <>
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
                                    {listing.hostName ? listing.hostName.charAt(0).toUpperCase() : "H"}
                                </Avatar>
                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                                    Hosted by <strong>{listing.hostName}</strong>
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
                                            <Typography component="span" color="text.secondary" variant="body2">
                                                (reviews)
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Capacity + Rooms */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                        mb: 1.5,
                                        color: "text.secondary",
                                    }}
                                >
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
                                                {listing.bedrooms
                                                    ? `${listing.bedrooms} Bedrooms`
                                                    : "No bedrooms"}
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
                        // --- BOOKING FORM VIEW ---
                        <Box sx={{ p: 8, backgroundColor: "#fff" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 3,
                                }}
                            >
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
                                {/* Name Field - Non-editable */}
                                <Box>
                                    <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                                        Name
                                    </Typography>
                                    <input
                                        type="text"
                                        value={currentUser.name}
                                        readOnly
                                        disabled
                                        style={{
                                            width: "95%",
                                            height: 40,
                                            borderRadius: 6,
                                            border: "1px solid #e0e0e0",
                                            padding: "0 10px",
                                            backgroundColor: "#f9f9f9",
                                            color: "#666",
                                            cursor: "not-allowed",
                                        }}
                                    />
                                </Box>

                                {/* Email Field - Non-editable */}
                                <Box>
                                    <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                                        Email
                                    </Typography>
                                    <input
                                        type="email"
                                        value={currentUser.email}
                                        readOnly
                                        disabled
                                        style={{
                                            width: "95%",
                                            height: 40,
                                            borderRadius: 6,
                                            border: "1px solid #e0e0e0",
                                            padding: "0 10px",
                                            backgroundColor: "#f9f9f9",
                                            color: "#666",
                                            cursor: "not-allowed",
                                        }}
                                    />
                                </Box>

                                {/* Phone Number and Guests - Horizontal Layout */}
                                <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                                    {/* Phone Field - Editable */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                                            Phone number
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: "80px",
                                                    height: 40,
                                                    borderRadius: "6px",
                                                    border: "1px solid #e0e0e0",
                                                    backgroundColor: "#f9f9f9",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#666",
                                                    fontSize: "0.9rem",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                🇵🇭 +63
                                            </Box>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Enter phone number"
                                                style={{
                                                    flex: 1,
                                                    height: 40,
                                                    borderRadius: 6,
                                                    border: "1px solid #ccc",
                                                    padding: "0 10px",
                                                    width: "100%",
                                                    backgroundColor: "#fff",
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Guests Field - Editable */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                                            No. of Guests
                                        </Typography>
                                        <input
                                            type="number"
                                            min="1"
                                            max={listing.capacity || listing.maxGuests || listing.groupSize || 999}
                                            value={formData.guests}
                                            onChange={(e) => {
                                                const maxGuests = listing.capacity || listing.maxGuests || listing.groupSize || 999;
                                                const value = parseInt(e.target.value);
                                                if (value <= maxGuests) {
                                                    setFormData({ ...formData, guests: e.target.value });
                                                }
                                            }}
                                            placeholder="Enter number of guests"
                                            style={{
                                                width: "100%",
                                                height: 40,
                                                borderRadius: 6,
                                                border: "1px solid #ccc",
                                                padding: "0 10px",
                                                backgroundColor: "#fff",
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: "text.secondary", ml: 1, mt: 0.5, display: "block" }}>
                                            Maximum: {listing.capacity || listing.maxGuests || listing.groupSize || "N/A"} guests
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        backgroundColor: "#DE7001",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        width: "100%",
                                        py: 1,
                                        "&:hover": { backgroundColor: "#c95f00" },
                                    }}
                                    onClick={() => {
                                        setSavedBookingInfo({
                                            name: currentUser.name,
                                            email: currentUser.email,
                                            phone: formData.phone,
                                            guests: formData.guests,
                                        });
                                        setShowBookingForm(false);
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* RIGHT SIDE – Booking Info */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 380,
                        position: "relative",
                        border: "none",
                        boxShadow: "none",

                    }}
                >
                    <Card sx={{ p: 3 }}>
                        <CardContent>
                            {/* ✅ Listing Summary */}
                            <Box
                                sx={{ display: "flex", alignItems: "flex-start", mb: 2, cursor: "pointer" }}
                                onClick={() => {
                                    setShowBookingForm(false);
                                    setShowDatePicker(false);
                                    setShowTimePicker(false);
                                }}
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
                                        onClick={() => {
                                            setShowBookingForm(true);
                                            setShowDatePicker(false);
                                            setShowTimePicker(false);
                                        }}
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            color: "gray",
                                            borderRadius: 2,
                                            boxShadow: "none",
                                            textTransform: "none",
                                            "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}>
                                        Set
                                    </Button>
                                </Box>

                                <Box sx={{ pl: 1.5, mt: 2 }}>
                                    <Typography sx={{ fontWeight: 500, mb: 1 }}>
                                        Name: <Typography component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>
                                            {currentUser.name || "Not set"}
                                        </Typography>
                                    </Typography>
                                    <Typography sx={{ fontWeight: 500, mb: 1 }}>
                                        Email: <Typography component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>
                                            {currentUser.email || "Not set"}
                                        </Typography>
                                    </Typography>
                                    <Typography sx={{ fontWeight: 500, mb: 1 }}>
                                        Phone number: <Typography component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>
                                            {savedBookingInfo.phone ? `+63 ${savedBookingInfo.phone}` : "Not set"}
                                        </Typography>
                                    </Typography>
                                    <Typography sx={{ fontWeight: 500 }}>
                                        No. of Guest/s: <Typography component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>
                                            {savedBookingInfo.guests || "Not set"}
                                        </Typography>
                                    </Typography>
                                </Box>
                                {/* ✅ Dates Section */}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Dates
                                    </Typography>
                                    <Button
                                        onClick={() => {
                                            setShowBookingForm(false);
                                            setShowDatePicker(true);
                                            setShowTimePicker(false);
                                        }}
                                        variant="contained"
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            color: "gray",
                                            borderRadius: 2,
                                            boxShadow: "none",
                                            textTransform: "none",
                                            "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}> Set
                                    </Button>
                                </Box>
                                <Typography sx={{ color: "text.secondary", ml: 1 }}>
                                    {savedBookingRange && savedBookingRange.length > 0 ? (
                                        type === "accommodation" && savedBookingRange.length === 2 ? (
                                            `${savedBookingRange[0].toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })} - ${savedBookingRange[1].toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}`
                                        ) : (
                                            savedBookingRange[0].toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                        )
                                    ) : (
                                        "Not set"
                                    )}
                                </Typography>
                                {/* ✅ Arrival Time Section */}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                }} >
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Arrival Time
                                    </Typography>
                                    <Button
                                        onClick={() => {
                                            setShowBookingForm(false);
                                            setShowDatePicker(false);
                                            setShowTimePicker(true);
                                        }}
                                        variant="contained"
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            color: "gray",
                                            borderRadius: 2,
                                            boxShadow: "none",
                                            textTransform: "none",
                                            "&:hover": { backgroundColor: "#e0e0e0" },
                                        }}
                                    >
                                        Set
                                    </Button>
                                </Box>
                                <Typography sx={{ color: "text.secondary", ml: 1 }}>{selectedTime}</Typography>
                                {/* ✅ Discount Section */}
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    Discount
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            backgroundColor: "#f5f5f5",
                                            borderRadius: 1,
                                            height: 36,
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        sx={{
                                            backgroundColor: "#DE7001",
                                            color: "white",
                                            borderRadius: 1,
                                            px: 3,
                                            "&:hover": { backgroundColor: "#c95f00" },
                                        }}> Set
                                    </Button>
                                </Box>
                                {/* ✅ Total Payment Section */}
                                <Divider sx={{ my: 3 }} />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Total Payment
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700, color: "#DE7001" }}
                                    >
                                        10,122.00
                                    </Typography>
                                </Box>
                                <Typography
                                    sx={{ color: "text.secondary", fontSize: "0.9rem", ml: 1, mt: 0.5 }}
                                >
                                    2 nights - Nov 22 - 24
                                </Typography>

                                <Box sx={{ mt: 3 }}>
                                    <div ref={paypal}></div>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Card> 
        </>
    );
}
