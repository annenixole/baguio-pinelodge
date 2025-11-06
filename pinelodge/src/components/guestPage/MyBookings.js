import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import NavbarGuest from "./NavbarGuest";
import ListingModal from "../hostPage/ListingModal.js";
import { sendBookingCancellationEmail } from "../emailConfig";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";
import Swal from "sweetalert2";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [listingDetails, setListingDetails] = useState(null);
    const [listingModalOpen, setListingModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [currentTab, bookings]);

    const fetchBookings = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("No user logged in");
                return;
            }

            console.log("🔍 Fetching bookings for guest:", user.email);

            // Get bookings from users/{email}/bookings subcollection
            const bookingsRef = collection(db, "users", user.email, "bookings");
            const bookingsSnapshot = await getDocs(bookingsRef);
            
            console.log("📦 Total booking documents found:", bookingsSnapshot.docs.length);
            
            const seenIds = new Set(); // Track unique booking IDs
            const bookingsData = await Promise.all(
                bookingsSnapshot.docs.map(async (bookingDoc) => {
                    // Skip duplicates
                    if (seenIds.has(bookingDoc.id)) {
                        console.log("⏭️ Skipping duplicate booking:", bookingDoc.id);
                        return null;
                    }
                    seenIds.add(bookingDoc.id);
                    
                    const bookingData = {
                        id: bookingDoc.id,
                        ...bookingDoc.data(),
                    };

                    console.log("📋 Processing booking:", bookingData.id);
                    console.log("Listing ID:", bookingData.listingId);

                    // Fetch listing details for each booking
                    try {
                        if (bookingData.listingId && bookingData.hostEmail && bookingData.listingType) {
                            // Listings are stored in users/{hostEmail}/{listingType}s/{listingId}
                            const listingType = bookingData.listingType === "accommodation" ? "accommodation" : bookingData.listingType;
                            const collectionName = `${listingType}s`;
                            
                            const listingRef = doc(db, "users", bookingData.hostEmail, collectionName, bookingData.listingId);
                            const listingSnap = await getDoc(listingRef);
                            
                            console.log("Fetching from path:", `users/${bookingData.hostEmail}/${collectionName}/${bookingData.listingId}`);
                            console.log("Listing exists:", listingSnap.exists());
                            
                            if (listingSnap.exists()) {
                                bookingData.listingData = {
                                    id: listingSnap.id,
                                    ...listingSnap.data(),
                                };
                                console.log("Listing data fetched:", bookingData.listingData);
                            } else {
                                console.warn("Listing not found at path:", `users/${bookingData.hostEmail}/${collectionName}/${bookingData.listingId}`);
                            }
                        } else {
                            console.warn("Missing required data in booking:", bookingData.id, {
                                listingId: bookingData.listingId,
                                hostEmail: bookingData.hostEmail,
                                listingType: bookingData.listingType
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching listing for booking:", bookingData.id, error);
                    }

                    return bookingData;
                })
            );

            // Filter out null values (duplicates that were skipped)
            const validBookings = bookingsData.filter(booking => booking !== null);

            console.log("✅ Total valid bookings:", validBookings.length);

            // Sort by creation date (newest first)
            validBookings.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });

            setBookings(validBookings);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setLoading(false);
        }
    };

    const filterBookings = () => {
        const now = new Date();
        let filtered = [];

        switch (currentTab) {
            case 0: // Upcomings
                filtered = bookings.filter((booking) => {
                    const startDate = booking.bookingDates?.start?.toDate();
                    return startDate && startDate >= now && booking.paymentStatus !== "cancelled";
                });
                break;
            case 1: // Completed
                filtered = bookings.filter((booking) => {
                    const endDate = booking.bookingDates?.end?.toDate();
                    return endDate && endDate < now && booking.paymentStatus !== "cancelled";
                });
                break;
            case 2: // Cancelled
                filtered = bookings.filter((booking) => booking.paymentStatus === "cancelled");
                break;
            default:
                filtered = bookings;
        }

        setFilteredBookings(filtered);
    };

    const handleCancelBooking = async (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        
        const result = await Swal.fire({
            title: "Cancel Booking?",
            text: "Are you sure you want to cancel this booking?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, cancel it",
            cancelButtonText: "No, keep it",
        });

        if (result.isConfirmed) {
            try {
                const user = auth.currentUser;
                
                console.log('🚫 Cancelling booking:', bookingId);
                console.log('📋 Booking details:', booking);
                
                // Update guest's booking
                const guestBookingRef = doc(db, "users", user.email, "bookings", bookingId);
                await updateDoc(guestBookingRef, {
                    paymentStatus: "cancelled",
                    updatedAt: new Date(),
                });
                console.log('✅ Guest booking updated');

                // Update host's booking if bookingId reference exists
                if (booking.hostEmail) {
                    try {
                        // Find host's booking document
                        const hostBookingsRef = collection(db, "users", booking.hostEmail, "bookings");
                        const hostBookingsSnapshot = await getDocs(hostBookingsRef);
                        
                        // Find the booking that references this guest booking
                        const hostBookingDoc = hostBookingsSnapshot.docs.find(doc => {
                            const data = doc.data();
                            return data.bookingId === bookingId || data.paypalOrderId === booking.paypalOrderId;
                        });
                        
                        if (hostBookingDoc) {
                            const hostBookingRef = doc(db, "users", booking.hostEmail, "bookings", hostBookingDoc.id);
                            await updateDoc(hostBookingRef, {
                                paymentStatus: "cancelled",
                                updatedAt: new Date(),
                            });
                            console.log('✅ Host booking updated');
                        } else {
                            console.warn('⚠️ Host booking not found');
                        }
                    } catch (hostError) {
                        console.error('Error updating host booking:', hostError);
                    }
                }

                // Unblock the dates in the listing
                try {
                    await unblockBookedDates(booking);
                    console.log('✅ Dates unblocked successfully');
                } catch (dateUnblockError) {
                    console.error('Error unblocking dates:', dateUnblockError);
                }

                // Send cancellation email to guest
                try {
                    console.log('📧 Attempting to send cancellation email...');
                    const emailResult = await sendBookingCancellationEmail(
                        user.email,
                        booking.guestName || user.displayName || user.email.split('@')[0],
                        booking.listingTitle || booking.bookingName || 'Your Booking'
                    );
                    
                    if (emailResult.success) {
                        console.log('✅ Cancellation email sent successfully');
                    } else {
                        console.error('❌ Failed to send cancellation email:', emailResult.error);
                    }
                } catch (emailError) {
                    console.error('❌ Error sending cancellation email:', emailError);
                    // Continue even if email fails
                }

                await Swal.fire({
                    title: "Cancelled!",
                    text: "Your booking has been cancelled and the dates are now available again.",
                    icon: "success",
                    confirmButtonColor: "#30410D",
                });

                fetchBookings();
            } catch (error) {
                console.error("Error cancelling booking:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to cancel booking. Please try again.",
                    icon: "error",
                    confirmButtonColor: "#30410D",
                });
            }
        }
    };

    // Function to unblock dates when booking is cancelled
    const unblockBookedDates = async (booking) => {
        if (!booking.bookingDates || !booking.bookingDates.start) {
            console.log('⚠️ No booking dates to unblock');
            return;
        }

        try {
            const startDate = booking.bookingDates.start.toDate();
            const endDate = booking.bookingDates.end ? booking.bookingDates.end.toDate() : startDate;
            
            console.log('🔓 Unblocking dates from', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

            const datesToUnblock = [];

            // Generate all dates in the range
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                datesToUnblock.push(new Date(currentDate).toISOString().split('T')[0]); // Format as YYYY-MM-DD
                currentDate.setDate(currentDate.getDate() + 1);
            }

            console.log('📅 Dates to unblock:', datesToUnblock);

            // Update the listing document to remove blocked dates
            const listingType = booking.listingType === "accommodation" ? "accommodation" : booking.listingType;
            const collectionName = `${listingType}s`;
            const listingRef = doc(db, "users", booking.hostEmail, collectionName, booking.listingId);

            // Get current blocked dates
            const listingSnap = await getDoc(listingRef);
            if (listingSnap.exists()) {
                const currentBlockedDates = listingSnap.data().blockedDates || [];
                console.log('📋 Current blocked dates:', currentBlockedDates);
                
                // Filter out the dates to unblock
                const newBlockedDates = currentBlockedDates.filter(date => !datesToUnblock.includes(date));
                console.log('📋 New blocked dates:', newBlockedDates);
                
                // Update with the filtered list
                await updateDoc(listingRef, {
                    blockedDates: newBlockedDates
                });

                console.log('✅ Blocked dates removed from listing');
            } else {
                console.warn('⚠️ Listing not found:', `users/${booking.hostEmail}/${collectionName}/${booking.listingId}`);
            }
        } catch (error) {
            console.error('❌ Error in unblockBookedDates:', error);
            throw error;
        }
    };

    const handleViewDetails = async (booking) => {
        try {
            // Use already fetched listing data or fetch if not available
            let listingData = booking.listingData;
            
            if (!listingData && booking.listingId && booking.hostEmail && booking.listingType) {
                // Fetch from correct path: users/{hostEmail}/{listingType}s/{listingId}
                const listingType = booking.listingType === "accommodation" ? "accommodation" : booking.listingType;
                const collectionName = `${listingType}s`;
                
                const listingRef = doc(db, "users", booking.hostEmail, collectionName, booking.listingId);
                const listingSnap = await getDoc(listingRef);
                
                if (listingSnap.exists()) {
                    listingData = { id: listingSnap.id, ...listingSnap.data() };
                }
            }
            
            if (listingData) {
                setSelectedListing(listingData);
                setListingModalOpen(true);
            } else {
                console.error("No listing data available");
            }
        } catch (error) {
            console.error("Error fetching listing details:", error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return timestamp.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getStatusColor = (booking) => {
        if (booking.paymentStatus === "cancelled") return "error";
        // Check if payment was transferred or booking was confirmed
        if (booking.paymentTransferred === true) return "success";
        if (booking.confirmedAt) return "success";
        return "warning";
    };

    const getStatusLabel = (booking) => {
        if (booking.paymentStatus === "cancelled") return "Cancelled";
        // Check if payment was transferred or booking was confirmed
        if (booking.paymentTransferred === true) return "Confirmed";
        if (booking.confirmedAt) return "Confirmed";
        return "Pending";
    };

    if (loading) {
        return (
            <>
                <NavbarGuest />
                <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
                    <Typography>Loading bookings...</Typography>
                </Box>
            </>
        );
    }

    return (
        <>
            <NavbarGuest />
            <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
                {/* Header */}
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#30410D" }}>
                    My Bookings
                </Typography>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <Tabs
                        value={currentTab}
                        onChange={(e, newValue) => setCurrentTab(newValue)}
                        sx={{
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontSize: "1rem",
                                fontWeight: 600,
                            },
                            "& .Mui-selected": {
                                color: "#30410D !important",
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#30410D",
                            },
                        }}
                    >
                        <Tab label="Upcomings" />
                        <Tab label="Completed" />
                        <Tab label="Cancelled" />
                    </Tabs>
                </Box>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No bookings found
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredBookings.map((booking) => (
                            <Grid item xs={12} key={booking.id}>
                                <Card
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", md: "row" },
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        borderRadius: 3,
                                        overflow: "hidden",
                                        transition: "box-shadow 0.3s",
                                        border: "1px solid #e0e0e0",
                                        minHeight: { xs: "auto", md: 200 },
                                        minWidth: 1200,
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    {/* Image Section */}
                                    <Box
                                        sx={{
                                            width: { xs: "100%", md: 280 },
                                            height: { xs: 220, md: "auto" },
                                            position: "relative",
                                            bgcolor: "#f5f5f5",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={booking.listingData?.photos?.[0] || "https://via.placeholder.com/280x220"}
                                            alt={booking.listingTitle}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <Chip
                                            label={booking.listingType === "accommodation" ? "Accommodation" : booking.listingType.charAt(0).toUpperCase() + booking.listingType.slice(1)}
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
                                    </Box>

                                    {/* Content Section */}
                                    <CardContent sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}>
                                        {/* Title and Status */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.5rem", color: "#333" }}>
                                                {booking.listingTitle}
                                            </Typography>
                                            <Chip
                                                label={getStatusLabel(booking)}
                                                color={getStatusColor(booking)}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: "0.80rem", px: 2.5, py: 0.6, height: "auto" }}
                                            />
                                        </Box>

                                        {/* Host */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                                            <PeopleIcon sx={{ fontSize: 18, color: "#888" }} />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                                                Hosted by {booking.hostEmail?.split("@")[0] || "Host"}
                                            </Typography>
                                        </Box>

                                        {/* Location */}
                                        {booking.listingData?.address && (
                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2 }}>
                                                <LocationOnIcon sx={{ fontSize: 18, color: "#888", mt: 0.2 }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                                                    {typeof booking.listingData.address === 'string' 
                                                        ? booking.listingData.address 
                                                        : `${booking.listingData.address.street || ''}, ${booking.listingData.address.barangay || ''}, ${booking.listingData.address.city || ''}, ${booking.listingData.address.province || ''}`
                                                    }
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Check-in and Check-out */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 18, color: "#888" }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                                                    Check-in: {formatDate(booking.bookingDates?.start)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 18, color: "#888" }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                                                    Check-out: {formatDate(booking.bookingDates?.end)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Arrival Time */}
                                        {booking.arrivalTime && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
                                                <AccessTimeIcon sx={{ fontSize: 18, color: "#888" }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                                                    {booking.arrivalTime} Arrival Time
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Number of Guests */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                                            <PeopleIcon sx={{ fontSize: 18, color: "#888" }} />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                                                {booking.numberOfGuests} Guests
                                            </Typography>
                                        </Box>

                                        {/* Booked Date */}
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: "0.85rem" }}>
                                            Booked on {formatDate(booking.createdAt)}
                                        </Typography>

                                        {/* Action Buttons */}
                                        <Box sx={{ display: "flex", gap: 2, mt: "auto" }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleViewDetails(booking)}
                                                fullWidth
                                                sx={{
                                                    bgcolor: "#4C6B2E",
                                                    color: "white",
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    py: 1,
                                                    borderRadius: 2,
                                                    "&:hover": {
                                                        bgcolor: "#3A5222",
                                                    },
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            {/* Show cancel button only if not cancelled and not confirmed */}
                                            {booking.paymentStatus !== "cancelled" && 
                                             booking.paymentTransferred !== true && 
                                             !booking.confirmedAt && (
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    fullWidth
                                                    sx={{
                                                        bgcolor: "#2c2c2c",
                                                        color: "white",
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        "&:hover": {
                                                            bgcolor: "#1a1a1a",
                                                        },
                                                    }}
                                                >
                                                    Cancel Booking
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Details Modal */}
            <Dialog
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    Booking Details
                    <IconButton
                        onClick={() => setDetailsModalOpen(false)}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: "#666",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedBooking && (
                        <Box>
                            {/* Booking Information */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#30410D" }}>
                                    {selectedBooking.listingTitle}
                                </Typography>
                                
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Status
                                        </Typography>
                                        <Chip
                                            label={getStatusLabel(selectedBooking)}
                                            color={getStatusColor(selectedBooking)}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Host
                                        </Typography>
                                        <Typography variant="body1">{selectedBooking.hostEmail}</Typography>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Dates
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedBooking.bookingDates?.start)} - {formatDate(selectedBooking.bookingDates?.end)}
                                        </Typography>
                                    </Box>
                                    
                                    {selectedBooking.arrivalTime && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Arrival Time
                                            </Typography>
                                            <Typography variant="body1">{selectedBooking.arrivalTime}</Typography>
                                        </Box>
                                    )}
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Number of Guests
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedBooking.numberOfGuests} Guest{selectedBooking.numberOfGuests > 1 ? "s" : ""}
                                        </Typography>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Total Amount
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: "#E68600", fontWeight: 700 }}>
                                            ₱{selectedBooking.amount?.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Payment Method
                                        </Typography>
                                        <Typography variant="body1">PayPal</Typography>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Transaction ID
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                                            {selectedBooking.paypalTransactionId}
                                        </Typography>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Confirmation Number
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                                            {selectedBooking.id}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Listing Modal */}
            <ListingModal
                open={listingModalOpen}
                onClose={() => setListingModalOpen(false)}
                listing={selectedListing}
            />
        </>
    );
}
