import { Box, Typography, Button, Card, CardContent, Divider, Avatar, Grid, Stack, IconButton, Dialog, DialogTitle, DialogContent, TextField, Chip, } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NavbarGuest from "./NavbarGuest";
import { useLocation, useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { doc, getDoc, addDoc, collection, Timestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import React, { useEffect, useState, useRef } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import emailjs from '@emailjs/browser';
import { emailConfig } from '../emailConfig';


export default function BookingPage() {
    const [hostName, setHostName] = useState("");
    const [currentUser, setCurrentUser] = useState({ name: "", email: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const [listing, setListing] = useState(location.state?.listing || null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessingBooking, setIsProcessingBooking] = useState(false);
    const processedOrders = useRef(new Set()); // Track processed PayPal orders
    
    // Booking date selection
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [bookingRange, setBookingRange] = useState(null);
    const [savedBookingRange, setSavedBookingRange] = useState(null);
    const [availabilityStart, setAvailabilityStart] = useState(null);
    const [availabilityEnd, setAvailabilityEnd] = useState(null);
    
    // Arrival time selection
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");

    // Fetch listing from URL parameter if not in state
    useEffect(() => {
        const fetchListingFromUrl = async () => {
            // Only fetch if we don't have listing data from navigation state
            if (!location.state?.listing) {
                const params = new URLSearchParams(location.search);
                const listingParam = params.get('listing');
                
                console.log("=== SHARE LINK DEBUG ===");
                console.log("URL search params:", location.search);
                console.log("Listing param:", listingParam);
                console.log("Location state:", location.state);
                
                if (listingParam) {
                    try {
                        setIsLoading(true);
                        const listingInfo = JSON.parse(decodeURIComponent(listingParam));
                        
                        console.log("Parsed listing info:", listingInfo);
                        
                        // Fetch full listing data from Firestore
                        const ref = doc(db, "users", listingInfo.hostEmail, `${listingInfo.type}s`, listingInfo.id);
                        console.log("Firestore path:", `users/${listingInfo.hostEmail}/${listingInfo.type}s/${listingInfo.id}`);
                        
                        const snap = await getDoc(ref);
                        
                        if (snap.exists()) {
                            const fullListing = {
                                id: snap.id,
                                ...snap.data(),
                                hostEmail: listingInfo.hostEmail
                            };
                            console.log("✓ Fetched listing successfully:", fullListing);
                            setListing(fullListing);
                            
                            // Set booking range based on listing type
                            if (fullListing.type === "accommodation") {
                                setBookingRange([new Date(), new Date()]);
                            } else {
                                setBookingRange([new Date()]);
                            }
                        } else {
                            console.error("✗ Listing not found in Firestore");
                            setErrorMessage("Listing not found. The link may be invalid or the listing may have been removed.");
                        }
                    } catch (error) {
                        console.error("✗ Error fetching listing from URL:", error);
                        setErrorMessage(`Error loading listing: ${error.message}`);
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    console.log("No listing parameter in URL and no state data");
                    setErrorMessage("No listing data found. Please select a listing to book.");
                }
            } else {
                console.log("Using listing from navigation state");
            }
        };
        fetchListingFromUrl();
    }, [location.search, location.state]);

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

                            // Start from the next day of the listing's availability start date
                            const nextDayAfterStart = new Date(startLocal);
                            nextDayAfterStart.setDate(nextDayAfterStart.getDate() + 1);
                            nextDayAfterStart.setHours(0, 0, 0, 0);

                            // Use the later date between next day after start and today
                            const effectiveStartDate = nextDayAfterStart <= today ? today : nextDayAfterStart;
                            
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

    // Promo code state
    const [promoCode, setPromoCode] = useState("");
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [voucherModalOpen, setVoucherModalOpen] = useState(false);
    const [appliedPromotion, setAppliedPromotion] = useState(null);

    // Payment modal state
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const paypalRef = useRef();

    useEffect(() => {
        const fetchHostName = async () => {
            try {
                if (listing?.hostEmail) {
                    const hostRef = doc(db, "users", listing.hostEmail);
                    const hostSnap = await getDoc(hostRef);
                    if (hostSnap.exists()) {
                        const hostData = hostSnap.data();
                        setHostName(hostData.name || listing.hostEmail.split("@")[0]);
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

    // Function to block booked dates in the listing
    const blockBookedDates = async (hostEmail, listingType, listingId, bookingRange) => {
        if (!bookingRange || bookingRange.length === 0) return;

        let startDate, endDate;
        
        // Handle both single date and range selection
        if (bookingRange.length === 1) {
            // Single date (services/experiences)
            startDate = bookingRange[0];
            endDate = bookingRange[0];
        } else if (bookingRange.length === 2) {
            // Date range (accommodations)
            startDate = bookingRange[0];
            endDate = bookingRange[1];
        } else {
            return;
        }

        const blockedDates = [];

        // Generate all dates in the range (or just the single date)
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            blockedDates.push(new Date(currentDate).toISOString().split('T')[0]); // Format as YYYY-MM-DD
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Update the listing document with blocked dates
        const normalizedType = listingType === "accommodation" ? "accommodation" : listingType;
        const collectionName = `${normalizedType}s`;
        const listingRef = doc(db, "users", hostEmail, collectionName, listingId);

        await updateDoc(listingRef, {
            blockedDates: arrayUnion(...blockedDates)
        });

        console.log('Blocked dates added to listing:', blockedDates);
    };

    // PayPal Integration for Payment Modal
    useEffect(() => {
        console.log('PayPal useEffect triggered:', { 
            paymentModalOpen, 
            hasListing: !!listing, 
            hasRef: !!paypalRef.current,
            hasPayPal: !!window.paypal 
        });

        if (paymentModalOpen && listing) {
            // Add a small delay to ensure modal is fully rendered
            const timer = setTimeout(() => {
                if (paypalRef.current) {
                    // Clear any existing PayPal buttons
                    if (paypalRef.current.hasChildNodes()) {
                        paypalRef.current.innerHTML = '';
                    }

                    console.log('Rendering PayPal button...');

                    const totalAmount = () => {
                        const guests = parseInt(savedBookingInfo.guests) || 0;
                        let basePrice = listing.price || 0;

                        // Apply discount only if promo code is applied
                        if (isPromoApplied && listing.promotion?.actualDiscountedPrice) {
                            basePrice = Number(listing.promotion.actualDiscountedPrice);
                        }

                        if (listing.type === "accommodation") {
                            if (savedBookingRange && savedBookingRange.length === 2) {
                                const [start, end] = savedBookingRange;
                                const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                                return basePrice * (nights > 0 ? nights : 1);
                            }
                            return basePrice;
                        } else {
                            return basePrice * (guests > 0 ? guests : 1);
                        }
                    };

                    if (!window.paypal) {
                        console.error('PayPal SDK not loaded!');
                        return;
                    }

                    window.paypal
                        .Buttons({
                            style: {
                                layout: 'vertical',
                                color: 'gold',
                                shape: 'rect',
                                label: 'paypal',
                                height: 45,
                            },
                            createOrder: (data, actions) => {
                                const purchaseUnit = {
                                    description: `${listing.type === "accommodation" ? "Accommodation" : "Activity"} Booking - ${listing.title}`,
                                    amount: { 
                                        currency_code: 'PHP', 
                                        value: totalAmount().toFixed(2) 
                                    },
                                    custom_id: JSON.stringify({
                                        hostEmail: listing?.hostEmail,
                                        listingId: listing?.id,
                                        listingTitle: listing?.title
                                    })
                                };

                                return actions.order.create({
                                    intent: 'CAPTURE',
                                    purchase_units: [purchaseUnit],
                                });
                            },
                            onApprove: async (data, actions) => {
                                // Prevent duplicate processing
                                if (isProcessingBooking) {
                                    console.log('⏭️ Already processing booking, skipping duplicate call');
                                    return;
                                }

                                // Check if this order was already processed
                                if (processedOrders.current.has(data.orderID)) {
                                    console.log('⏭️ Order already processed:', data.orderID);
                                    return;
                                }

                                try {
                                    setIsProcessingBooking(true);
                                    processedOrders.current.add(data.orderID);
                                    
                                    console.log('💳 Processing PayPal order:', data.orderID);
                                    const order = await actions.order.capture();
                                    console.log('✅ Order captured successfully');
                                    
                                    console.log('👤 Current User:', {
                                        email: currentUser.email,
                                        name: currentUser.name
                                    });
                                    console.log('🏠 Listing:', {
                                        hostEmail: listing.hostEmail,
                                        id: listing.id,
                                        title: listing.title,
                                        type: listing.type
                                    });
                                    
                                    const bookingData = {
                                        guestEmail: currentUser.email,
                                        guestName: currentUser.name,
                                        guestPhone: savedBookingInfo?.phone || '',
                                        hostEmail: listing.hostEmail,
                                        listingId: listing.id,
                                        listingTitle: listing.title,
                                        listingType: listing.type,
                                        numberOfGuests: savedBookingInfo?.guests || 1,
                                        bookingDates: savedBookingRange ? {
                                            start: Timestamp.fromDate(savedBookingRange[0]),
                                            end: savedBookingRange[1] ? Timestamp.fromDate(savedBookingRange[1]) : Timestamp.fromDate(savedBookingRange[0])
                                        } : null,
                                        arrivalTime: selectedTime || '',
                                        paypalOrderId: order.id,
                                        paypalTransactionId: order.purchase_units[0].payments.captures[0].id,
                                        amount: totalAmount(),
                                        currency: 'PHP',
                                        paymentStatus: 'captured',
                                        payoutStatus: 'pending',
                                        createdAt: Timestamp.now(),
                                        updatedAt: Timestamp.now()
                                    };
                                    
                                    console.log('📝 Booking data prepared:', bookingData);
                                    
                                    // Save booking under users/{guestEmail}/bookings subcollection
                                    console.log('💾 Saving to guest bookings:', `users/${currentUser.email}/bookings`);
                                    const bookingRef = await addDoc(
                                        collection(db, 'users', currentUser.email, 'bookings'), 
                                        bookingData
                                    );
                                    
                                    console.log('✅ Booking saved in guest bookings with ID:', bookingRef.id);
                                    
                                    // ALSO save booking under users/{hostEmail}/bookings subcollection for host access
                                    try {
                                        const hostBookingData = {
                                            ...bookingData,
                                            guestEmail: currentUser.email,
                                            guestName: currentUser.displayName || currentUser.email.split('@')[0],
                                            bookingId: bookingRef.id, // Reference to the guest's booking
                                        };
                                        
                                        console.log('💾 Saving to host bookings:', `users/${listing.hostEmail}/bookings`);
                                        console.log('📝 Host booking data:', hostBookingData);
                                        
                                        const hostBookingRef = await addDoc(
                                            collection(db, 'users', listing.hostEmail, 'bookings'),
                                            hostBookingData
                                        );
                                        
                                        console.log('✅ Booking also saved in host bookings with ID:', hostBookingRef.id);
                                    } catch (hostBookingError) {
                                        console.error('❌ Error saving booking to host:', hostBookingError);
                                        // Continue even if host booking fails - guest booking is saved
                                    }
                                    
                                    // Block the booked dates in the listing
                                    try {
                                        await blockBookedDates(
                                            listing.hostEmail,
                                            listing.type,
                                            listing.id,
                                            savedBookingRange
                                        );
                                        console.log('✅ Dates blocked successfully');
                                    } catch (dateBlockError) {
                                        console.error('Error blocking dates:', dateBlockError);
                                        // Continue even if date blocking fails
                                    }
                                    
                                    // Format dates for email
                                    const formatDate = (date) => {
                                        return date.toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        });
                                    };
                                    
                                    const checkInDate = savedBookingRange?.[0] ? formatDate(savedBookingRange[0]) : '';
                                    const checkOutDate = savedBookingRange?.[1] ? formatDate(savedBookingRange[1]) : checkInDate;
                                    const checkInOutDate = listing.type === 'accommodations' 
                                        ? `${checkInDate} - ${checkOutDate}`
                                        : checkInDate;
                                    
                                    // Send confirmation email
                                    try {
                                        console.log('Attempting to send email with config:', {
                                            serviceId: emailConfig.serviceId,
                                            templateId: emailConfig.paymentConfirmationTemplateId,
                                            publicKey: emailConfig.publicKey,
                                            recipientEmail: currentUser.email
                                        });
                                        
                                        const emailParams = {
                                            user_email: currentUser.email,
                                            guestName: currentUser.name,
                                            guestEmail: currentUser.email,
                                            paymentAmount: `₱${totalAmount().toLocaleString()}`,
                                            paymentDate: new Date().toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            }),
                                            eWallet: 'PayPal',
                                            referenceNum: order.id,
                                            confirmationNumber: bookingRef.id,
                                            bookingName: listing.title,
                                            checkInOutDate: checkInOutDate,
                                            arrivalTime: selectedTime || 'Not specified',
                                            numofGuests: savedBookingInfo?.guests || 1,
                                            hostEmail: listing.hostEmail,
                                            bookingLink: `${window.location.origin}/GuestPage`
                                        };
                                        
                                        console.log('Email parameters:', emailParams);
                                        
                                        const response = await emailjs.send(
                                            emailConfig.serviceId,
                                            emailConfig.paymentConfirmationTemplateId,
                                            emailParams,
                                            emailConfig.publicKey
                                        );
                                        
                                        console.log('Payment confirmation email sent successfully:', response);
                                        alert('✅ Payment confirmation email has been sent to ' + currentUser.email);
                                    } catch (emailError) {
                                        console.error('Error sending confirmation email:', emailError);
                                        console.error('Email error details:', {
                                            message: emailError.message,
                                            text: emailError.text,
                                            status: emailError.status
                                        });
                                        alert('⚠️ Payment successful but email could not be sent. Error: ' + emailError.text);
                                    }
                                    
                                    alert(`Your booking has been confirmed.\n\nA payment confirmation email has been sent to ${currentUser.email}.\nPlease check your inbox to review your booking details.`);
                                    setPaymentModalOpen(false);
                                    
                                    // Navigate back to the previous page
                                    setTimeout(() => {
                                        navigate(-1);
                                    }, 500);
                                } catch (error) {
                                    console.error('Error saving booking:', error);
                                    alert('Payment successful but there was an error saving your booking. Please contact support.');
                                } finally {
                                    // Reset processing flag after completion or error
                                    setIsProcessingBooking(false);
                                }
                            },
                            onError: (err) => {
                                console.error('PayPal Error:', err);
                                alert('Payment Failed! Please try again.');
                                setIsProcessingBooking(false);
                                processedOrders.current.delete(err.orderID);
                            },
                        })
                        .render(paypalRef.current)
                        .catch((err) => {
                            console.error('Failed to render PayPal button:', err);
                        });
                }
            }, 100); // 100ms delay

            return () => clearTimeout(timer);
        }
    }, [paymentModalOpen, listing, savedBookingInfo, savedBookingRange, isPromoApplied]);

    if (isLoading) {
        return (
            <>
                <NavbarGuest />
                <Typography variant="h6" sx={{ mt: 5, textAlign: "center" }}>
                    Loading listing details...
                </Typography>
            </>
        );
    }

    if (!listing) {
        return (
            <>
                <NavbarGuest />
                <Box sx={{ mt: 5, textAlign: "center", px: 3 }}>
                    <Typography variant="h6" color="error">
                        {errorMessage || "No listing details found."}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate("/GuestPage")}
                        sx={{ mt: 3, backgroundColor: "#30410D", "&:hover": { backgroundColor: "#70873F" } }}
                    >
                        Back to Listings
                    </Button>
                </Box>
            </>
        );
    }

    const { title, price, type, promotion, inclusions = [], rules = [] } = listing;

    const discountedPrice = promotion?.actualDiscountedPrice
        ? Number(promotion.actualDiscountedPrice)
        : null;

    // Check if page was accessed via shared link
    const isSharedLink = new URLSearchParams(location.search).has('listing');

    // Reset form fields
    const handleClearForm = () => {
        setFormData({ name: "", email: "", phone: "", guests: "" });
    };

    // Handle promo code application from modal
    const handleApplyPromoFromModal = () => {
        setPromoError("");
        
        // Check if listing has a promotion
        if (!promotion || !promotion.promoCode) {
            setPromoError("No promotion available for this listing");
            return;
        }

        // Validate promo code
        if (promoCode.trim().toUpperCase() === promotion.promoCode.toUpperCase()) {
            // Check if booking meets promotion requirements
            if (checkPromotionEligibility(promotion)) {
                setIsPromoApplied(true);
                setAppliedPromotion(promotion);
                setPromoError("");
                setVoucherModalOpen(false);
            } else {
                setPromoError("This voucher is not valid for this booking");
                setIsPromoApplied(false);
                setAppliedPromotion(null);
            }
        } else {
            setIsPromoApplied(false);
            setAppliedPromotion(null);
            setPromoError("Invalid promo code");
        }
    };

    // Check if booking meets promotion requirements
    const checkPromotionEligibility = (promo) => {
        if (!promo) return false;

        const currentTotal = calculateTotalPayment();

        // Check minimum spend requirement
        if (promo.minSpendRequired && currentTotal < Number(promo.minSpendRequired)) {
            return false;
        }

        // Check promo validity dates
        const today = new Date();
        const startDate = promo.startDate ? new Date(promo.startDate) : null;
        const endDate = promo.endDate ? new Date(promo.endDate) : null;

        if (startDate && today < startDate) return false;
        if (endDate && today > endDate) return false;

        // Check max users (if applicable)
        // This would require tracking usage in the database
        // For now, we'll just check if maxUsers is set
        if (promo.maxUsers && Number(promo.maxUsers) <= 0) {
            return false;
        }

        return true;
    };

    // Open voucher modal
    const handleOpenVoucherModal = () => {
        setVoucherModalOpen(true);
        setPromoError("");
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

    // Calculate total payment
    const calculateTotalPayment = () => {
        const guests = parseInt(savedBookingInfo.guests) || 0;
        let basePrice = price || 0;

        // Apply discount only if promo code is applied
        if (isPromoApplied && promotion?.actualDiscountedPrice) {
            basePrice = Number(promotion.actualDiscountedPrice);
        }

        if (type === "accommodation") {
            // For accommodations: price is per night, not multiplied by guests
            if (savedBookingRange && savedBookingRange.length === 2) {
                const [start, end] = savedBookingRange;
                const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                return basePrice * (nights > 0 ? nights : 1);
            }
            return basePrice;
        } else {
            // For services and experiences: multiply by number of guests (per person pricing)
            return basePrice * (guests > 0 ? guests : 1);
        }
    };

    // Format booking range for display
    const formatBookingRange = () => {
        if (!savedBookingRange) return "Not set";
        
        if (type === "accommodation" && savedBookingRange.length === 2) {
            const [start, end] = savedBookingRange;
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const startDate = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const endDate = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return `${nights} night${nights > 1 ? 's' : ''} - ${startDate} - ${endDate}`;
        } else {
            // For services and experiences, show single date
            const date = savedBookingRange[0];
            const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const guests = parseInt(savedBookingInfo.guests) || 0;
            return `${guests} guest${guests > 1 ? 's' : ''} - ${formattedDate}`;
        }
    };

    return (
        <>
            <NavbarGuest />
            
            {/* Share Link Banner */}
            {isSharedLink && (
                <Box
                    sx={{
                        backgroundColor: "#E8F5E9",
                        borderBottom: "2px solid #4CAF50",
                        py: 2,
                        px: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#2E7D32",
                            fontWeight: 500,
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        🔗 <span style={{ fontWeight: 600 }}>Shared with you!</span> 
                        Someone thought you'd love this {type === "accommodation" ? "place" : type}. 
                        Check it out and book your experience at Baguio Pinelodge! 🌲
                    </Typography>
                </Box>
            )}

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
                                        setSelectedTime("");
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
                                <Typography sx={{ color: selectedTime ? "#70873F" : "#999", fontWeight: 600, fontSize: "1.2rem" }}>
                                    {selectedTime || "Please select a time"}
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
                                        setBookingRange(null);
                                        setSavedBookingRange(null);
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
                                    tileDisabled={({ date, view }) => {
                                        // Disable dates in month view that are already booked
                                        if (view === 'month' && listing?.blockedDates) {
                                            const dateString = date.toISOString().split('T')[0];
                                            return listing.blockedDates.includes(dateString);
                                        }
                                        return false;
                                    }}
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

                            {bookingRange && bookingRange.length > 0 ? (
                                <Box sx={{ mt: 3, textAlign: "center" }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Selected Availability:
                                    </Typography>

                                    {/*Handle single or range dates dynamically */}
                                    {type === "accommodation" && bookingRange.length === 2 ? (
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
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ mt: 3, textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No date selected yet.
                                    </Typography>
                                </Box>
                            )}

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
                            
                            {listing.location && (
                                <Box sx={{ display: "flex", alignItems: "center", ml: 3, mb: 2 }}>
                                    <Typography
                                        component="a"
                                        href={listing.location}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="body2"
                                        sx={{
                                            color: "#70873F",
                                            textDecoration: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            "&:hover": {
                                                textDecoration: "underline",
                                            },
                                        }}
                                    >
                                        View on Map
                                        <OpenInNewIcon sx={{ fontSize: 14 }} />
                                    </Typography>
                                </Box>
                            )}

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
                                <Box sx={{ display: "flex", gap: 2, width: "95%" }}>
                                    {/* Phone Field - Editable */}
                                    <Box sx={{ flex: 1.3 }}>
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
                                                    flexShrink: 0,
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
                                        {listing.type === "accommodation" && (
                                            <Typography variant="caption" sx={{ color: "text.secondary", ml: 1, mt: 0.5, display: "block" }}>
                                                Maximum: {listing.capacity || listing.maxGuests || listing.groupSize || "N/A"} guests
                                            </Typography>
                                        )}
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
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{ textDecoration: (isPromoApplied && promotion) ? "line-through" : "none" }}
                                        >
                                            ₱{price?.toLocaleString() || "0"}
                                        </Box>{" "}
                                        <Typography
                                            component="span"
                                            sx={{ fontWeight: 400, fontSize: "0.9rem", color: "text.secondary" }}
                                        >
                                            {type === "accommodation"
                                                ? "/per night"
                                                : "/ per person"}
                                        </Typography>
                                    </Typography>

                                    {isPromoApplied && promotion?.actualDiscountedPrice && (
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
                                <Typography sx={{ color: "text.secondary", ml: 1 }}>
                                    {selectedTime || "Not set"}
                                </Typography>
                                {/* ✅ Discount Section */}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Discount
                                    </Typography>
                                    {isPromoApplied && appliedPromotion && (
                                        <Button
                                            variant="text"
                                            onClick={() => {
                                                setIsPromoApplied(false);
                                                setAppliedPromotion(null);
                                                setPromoCode("");
                                            }}
                                            sx={{
                                                textTransform: "none",
                                                color: "#666",
                                                fontSize: "0.85rem",
                                                "&:hover": {
                                                    bgcolor: "transparent",
                                                    color: "#D32F2F",
                                                },
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>
                                
                                {!isPromoApplied ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<LocalOfferIcon />}
                                        onClick={handleOpenVoucherModal}
                                        fullWidth
                                        sx={{
                                            textTransform: "none",
                                            borderColor: "#c2c2c2ff",
                                            color: "#E68600",
                                            py: 1,
                                            justifyContent: "flex-start",
                                            "&:hover": {
                                                borderColor: "#CC7700",
                                                bgcolor: "#FFF4E6",
                                            },
                                        }}
                                    >
                                        Apply a discount
                                    </Button>
                                ) : (
                                    <Card
                                        sx={{
                                            border: "1px solid #E0E0E0",
                                            borderRadius: 2,
                                            p: 2,
                                            bgcolor: "#FAFAFA",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: "#E68600",
                                                    color: "#fff",
                                                    p: 1,
                                                    borderRadius: 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    minWidth: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                <LocalOfferIcon sx={{ fontSize: "1.5rem" }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.5 }}>
                                                    {appliedPromotion.promoCode} - {appliedPromotion.percentageDiscount}% off discount
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem", mb: 1 }}>
                                                    Valid from {new Date(appliedPromotion.startDate).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })} - {new Date(appliedPromotion.endDate).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>
                                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                    <Chip
                                                        label={`Save ₱${(price - appliedPromotion.actualDiscountedPrice).toFixed(0)}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#FFE4CC",
                                                            color: "#E68600",
                                                            fontWeight: 700,
                                                            fontSize: "0.75rem",
                                                            height: "24px",
                                                        }}
                                                    />
                                                    {appliedPromotion.minSpendRequired && (
                                                        <Chip
                                                            label={`Min. spend ₱${Number(appliedPromotion.minSpendRequired).toLocaleString()}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "#FFF4E6",
                                                                color: "#E68600",
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                                height: "24px",
                                                            }}
                                                        />
                                                    )}
                                                    {appliedPromotion.maxUsers && (
                                                        <Chip
                                                            label={`${appliedPromotion.maxUsers} left`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "#E8F5E9",
                                                                color: "#2E7D32",
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                                height: "24px",
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Card>
                                )}
                                {/* ✅ Total Payment Section */}
                                <Divider sx={{ my: 3 }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#000", mb: 1 }}>
                                        Total Amount{" "}
                                        <Typography component="span" sx={{ fontSize: "0.85rem", fontWeight: 400, color: "#666" }}>
                                            (incl. fees and tax)
                                        </Typography>
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#000", mb: 0.5 }}>
                                                ₱{calculateTotalPayment().toLocaleString()}
                                            </Typography>
                                            {isPromoApplied && promotion?.actualDiscountedPrice && (() => {
                                                const guests = parseInt(savedBookingInfo.guests) || 0;
                                                let originalPrice = price || 0;
                                                let originalTotal = 0;
                                                
                                                if (type === "accommodation") {
                                                    if (savedBookingRange && savedBookingRange.length === 2) {
                                                        const [start, end] = savedBookingRange;
                                                        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                                                        originalTotal = originalPrice * (nights > 0 ? nights : 1);
                                                    } else {
                                                        originalTotal = originalPrice;
                                                    }
                                                } else {
                                                    originalTotal = originalPrice * (guests > 0 ? guests : 1);
                                                }
                                                
                                                return (
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            color: "#999", 
                                                            textDecoration: "line-through",
                                                            fontSize: "1.2rem"
                                                        }}
                                                    >
                                                        ₱{originalTotal.toLocaleString()}
                                                    </Typography>
                                                );
                                            })()}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: "#999", fontSize: "0.9rem", mt: 0.5 }}>
                                            {formatBookingRange()}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Proceed to Payment Button */}
                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            backgroundColor: "#E68600",
                                            color: "#fff",
                                            fontWeight: 600,
                                            fontSize: "1rem",
                                            py: 1.5,
                                            borderRadius: 1,
                                            textTransform: "none",
                                            "&:hover": {
                                                backgroundColor: "#D47700",
                                            },
                                        }}
                                        onClick={() => {
                                            // Validation before opening payment modal
                                            let missingFields = [];
                                            if (!savedBookingInfo.phone) missingFields.push('Phone number');
                                            if (!savedBookingInfo.guests) missingFields.push('Number of guests');
                                            if (!savedBookingRange || savedBookingRange.length === 0) missingFields.push('Booking dates');
                                            if (!selectedTime) missingFields.push('Arrival time');
                                            
                                            if (missingFields.length > 0) {
                                                alert(`Please fill in the following details:\n- ${missingFields.join('\n- ')}`);
                                                return;
                                            }
                                            
                                            // Open payment modal if all fields are filled
                                            setPaymentModalOpen(true);
                                        }}
                                    >
                                        Proceed to Payment
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Card>

            {/* Voucher Modal */}
            <Dialog
                open={voucherModalOpen}
                onClose={() => setVoucherModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    Apply a voucher
                    <IconButton
                        onClick={() => setVoucherModalOpen(false)}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {/* Voucher Code Input */}
                    <TextField
                        fullWidth
                        placeholder="Enter a voucher code"
                        value={promoCode}
                        onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoError(""); // Clear error when typing
                        }}
                        variant="outlined"
                        sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                            },
                        }}
                    />
                    
                    {/* Error Message under input field */}
                    {promoError && (
                        <Typography sx={{ color: "#D32F2F", fontSize: "0.85rem", mb: 2 }}>
                            {promoError}
                        </Typography>
                    )}
                    
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleApplyPromoFromModal}
                        sx={{
                            bgcolor: "#E68600",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            py: 1.2,
                            borderRadius: "8px",
                            mb: 3,
                            "&:hover": {
                                bgcolor: "#CC7700",
                            },
                        }}
                    >
                        Apply
                    </Button>

                    {/* Select a voucher section */}
                    {promotion && (
                        <>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Select a voucher
                            </Typography>

                            {/* Check if booking meets promotion requirements */}
                            {checkPromotionEligibility(promotion) ? (
                                <Card
                                    sx={{
                                        border: "1px solid #E0E0E0",
                                        borderRadius: 2,
                                        p: 2,
                                        mb: 2,
                                        cursor: "pointer",
                                        "&:hover": {
                                            bgcolor: "#F5F5F5",
                                        },
                                    }}
                                    onClick={() => {
                                        setPromoCode(promotion.promoCode);
                                        setPromoError("");
                                        // Apply promo immediately
                                        setIsPromoApplied(true);
                                        setAppliedPromotion(promotion);
                                        setVoucherModalOpen(false);
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                        <Box
                                            sx={{
                                                bgcolor: "#E68600",
                                                color: "#fff",
                                                p: 1,
                                                borderRadius: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <LocalOfferIcon />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                {promotion.promoCode} - {promotion.percentageDiscount}% off discount
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#666", fontSize: "0.85rem" }}>
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
                                            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                                                <Chip
                                                    label={`Save ₱${(price - promotion.actualDiscountedPrice).toFixed(0)}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#FFE4CC",
                                                        color: "#E68600",
                                                        fontWeight: 600,
                                                        fontSize: "0.75rem",
                                                    }}
                                                />
                                                {promotion.minSpendRequired && (
                                                    <Chip
                                                        label={`Min. spend ₱${Number(promotion.minSpendRequired).toLocaleString()}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#FFF4E6",
                                                            color: "#E68600",
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem",
                                                        }}
                                                    />
                                                )}
                                                {promotion.maxUsers && (
                                                    <Chip
                                                        label={`${promotion.maxUsers} left`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#E8F5E9",
                                                            color: "#2E7D32",
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem",
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            ) : (
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                        Not valid for this booking
                                    </Typography>
                                    <Card
                                        sx={{
                                            border: "1px solid #E0E0E0",
                                            borderRadius: 2,
                                            p: 2,
                                            mb: 1,
                                            opacity: 0.6,
                                            bgcolor: "#F5F5F5",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: "#999",
                                                    color: "#fff",
                                                    p: 1,
                                                    borderRadius: 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <LocalOfferIcon />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: "#666" }}>
                                                    {promotion.promoCode} - {promotion.percentageDiscount}% off discount
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#999", fontSize: "0.85rem" }}>
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
                                                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                                                    <Chip
                                                        label={`Save ₱${(price - promotion.actualDiscountedPrice).toFixed(0)}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#E0E0E0",
                                                            color: "#999",
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem",
                                                        }}
                                                    />
                                                    {promotion.minSpendRequired && (
                                                        <Chip
                                                            label={`Min. spend ₱${Number(promotion.minSpendRequired).toLocaleString()}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "#E0E0E0",
                                                                color: "#999",
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                            }}
                                                        />
                                                    )}
                                                    {promotion.maxUsers && (
                                                        <Chip
                                                            label={`${promotion.maxUsers} left`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "#E0E0E0",
                                                                color: "#999",
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Card>
                                    <Typography variant="body2" sx={{ color: "#D32F2F", fontSize: "0.85rem", mt: 1 }}>
                                        {promotion.minSpendRequired && calculateTotalPayment() < Number(promotion.minSpendRequired)
                                            ? `Reach ₱${Number(promotion.minSpendRequired).toLocaleString()} to use this voucher`
                                            : "This voucher is not valid for this booking"}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <Dialog
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 2 },
                }}
            >
                <Box sx={{ position: "relative", mb: 2 }}>
                    <IconButton
                        onClick={() => setPaymentModalOpen(false)}
                        sx={{
                            position: "absolute",
                            right: -8,
                            top: -8,
                            color: "#666",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#30410D", mb: 3, mt: 3 }}>
                        Booking Summary
                    </Typography>

                    {/* Booking Details */}
                    <Box sx={{ bgcolor: "#F5F7FA", borderRadius: 2, p: 5, mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                            <Typography sx={{ color: "#666", fontSize: "0.95rem" }}>Property</Typography>
                            <Typography sx={{ fontWeight: 600, color: "#333", fontSize: "0.95rem", textAlign: "right" }}>
                                {listing?.title}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                            <Typography sx={{ color: "#666", fontSize: "0.95rem" }}>Dates</Typography>
                            <Typography sx={{ fontWeight: 600, color: "#333", fontSize: "0.95rem" }}>
                                {savedBookingRange && savedBookingRange.length === 2
                                    ? `${savedBookingRange[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${savedBookingRange[1].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                    : savedBookingRange && savedBookingRange.length === 1
                                    ? savedBookingRange[0].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "Not set"}
                            </Typography>
                        </Box>
                        {type === "accommodation" && savedBookingRange && savedBookingRange.length === 2 && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                <Typography sx={{ color: "#666", fontSize: "0.95rem" }}>Duration</Typography>
                                <Typography sx={{ fontWeight: 600, color: "#333", fontSize: "0.95rem" }}>
                                    {Math.ceil((savedBookingRange[1] - savedBookingRange[0]) / (1000 * 60 * 60 * 24))} nights
                                </Typography>
                            </Box>
                        )}
                        {selectedTime && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                <Typography sx={{ color: "#666", fontSize: "0.95rem" }}>Arrival Time</Typography>
                                <Typography sx={{ fontWeight: 600, color: "#333", fontSize: "0.95rem" }}>
                                    {selectedTime}
                                </Typography>
                            </Box>
                        )}
                        
                        {/* Horizontal Line before Total Amount */}
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ color: "#666", fontSize: "0.95rem", fontWeight: 700 }}>Total Amount</Typography>
                            <Typography sx={{ fontWeight: 700, color: "#E68600", fontSize: "1.25rem" }}>
                                ₱{calculateTotalPayment().toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Refund Policy Notice */}
                    <Box sx={{ bgcolor: "#f9f9f9", borderRadius: 1, p: 2, mb: 2, mt: 2 }}>
                        <Typography sx={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.6, textAlign: "justify" }}>
                            The host has 24 hours to accept your booking request. You'll pay now, but get a full refund if the booking isn't confirmed.
                        </Typography>
                    </Box>

                    {/* Terms Agreement */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: "#666", fontSize: "0.85rem", textAlign: "center" }}>
                            By clicking the payment button, I agree to the{" "}
                            <span style={{ color: "#30410D", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
                                booking terms
                            </span>
                        </Typography>
                    </Box>

                    {/* PayPal Buttons */}
                    <Box sx={{ mt: 3 }}>
                        <div ref={paypalRef}></div>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}
