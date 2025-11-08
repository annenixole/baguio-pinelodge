import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    InputAdornment,
    IconButton,
    useMediaQuery,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ProfileMenu from "./ProfileMenu";
import ListingModal from "./ListingModal";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import Swal from "sweetalert2";
import { sendBookingRejectionEmail, sendBookingConfirmationEmail } from "../emailConfig";

export default function ManageBookings({ onProfileSettingsClick }) {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [categoryFilter, setCategoryFilter] = useState("accommodations");
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        let isMounted = true;
        
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && isMounted) {
                setUserEmail(user.email);
                console.log("User authenticated:", user.email);
                // Fetch bookings once user is authenticated
                if (!isFetching) {
                    fetchHostBookings();
                }
                // Load notifications
                loadNotifications(user.uid);
            } else if (isMounted) {
                setUserEmail("");
                setNotifications([]);
                setNotificationsCount(0);
                console.log("No user authenticated");
            }
        });
        
        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    // Load notifications from Firestore
    const loadNotifications = async (userId) => {
        try {
            console.log('🔍 Loading notifications for host:', userId);
            const notificationsRef = collection(db, "users", userId, "notifications");
            
            // Try with orderBy first
            let querySnapshot;
            try {
                const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(10));
                querySnapshot = await getDocs(q);
                console.log('✅ Query with orderBy succeeded');
            } catch (orderError) {
                console.warn('⚠️ orderBy failed, trying without:', orderError.message);
                // If orderBy fails (missing index), try without it
                const q = query(notificationsRef, limit(10));
                querySnapshot = await getDocs(q);
            }
            
            const notificationsList = [];
            querySnapshot.forEach((doc) => {
                console.log('📧 Notification found:', doc.id, doc.data());
                notificationsList.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort manually if we didn't use orderBy
            notificationsList.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });
            
            console.log('📋 Total notifications loaded:', notificationsList.length);
            setNotifications(notificationsList);
            // Count unread notifications
            const unreadCount = notificationsList.filter(n => !n.read).length;
            setNotificationsCount(unreadCount);
            console.log('🔔 Unread count:', unreadCount);
        } catch (error) {
            console.error("❌ Error loading notifications:", error);
            console.error("Error details:", error.code, error.message);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        try {
            const user = auth.currentUser;
            if (user && !notification.read) {
                // Mark notification as read
                const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);
                await updateDoc(notificationRef, { read: true });
                
                // Reload notifications to update count
                await loadNotifications(user.uid);
            }
        } catch (error) {
            console.error("Error handling notification click:", error);
        }
    };

    // Refresh notifications
    const handleRefreshNotifications = () => {
        const user = auth.currentUser;
        if (user) {
            loadNotifications(user.uid);
        }
    };

    useEffect(() => {
        filterBookings();
        console.log("Filter applied - Total bookings:", bookings.length, "Filtered:", filteredBookings.length);
    }, [searchQuery, statusFilter, categoryFilter, bookings]);

    const fetchHostBookings = async () => {
        // Prevent multiple simultaneous fetches
        if (isFetching) {
            console.log("Already fetching, skipping duplicate request");
            return;
        }

        try{
            setIsFetching(true);
            const user = auth.currentUser;
            if (!user) {
                console.error("❌ No user logged in");
                setLoading(false);
                setIsFetching(false);
                return;
            }

            console.log("🔍 Fetching bookings for host:", user.email);

            // Fetch bookings directly from host's bookings subcollection
            const bookingsRef = collection(db, "users", user.email, "bookings");
            const bookingsSnapshot = await getDocs(bookingsRef);
            
            console.log("Total bookings found:", bookingsSnapshot.docs.length);
            
            const allBookings = [];
            const seenIds = new Set(); // Track unique booking IDs

            for (const bookingDoc of bookingsSnapshot.docs) {
                // Skip if we've already processed this booking
                if (seenIds.has(bookingDoc.id)) {
                    console.log("Skipping duplicate booking:", bookingDoc.id);
                    continue;
                }
                
                seenIds.add(bookingDoc.id);
                
                const bookingData = {
                    id: bookingDoc.id,
                    ...bookingDoc.data(),
                };

                console.log("📋 Processing booking:", bookingData.id);

                // Fetch listing details if available
                try {
                    if (bookingData.listingId && bookingData.listingType) {
                        const listingType = bookingData.listingType === "accommodation" ? "accommodation" : bookingData.listingType;
                        const collectionName = `${listingType}s`;
                        
                        console.log(`🏠 Fetching listing from: users/${user.email}/${collectionName}/${bookingData.listingId}`);
                        
                        const listingRef = doc(db, "users", user.email, collectionName, bookingData.listingId);
                        const listingSnap = await getDoc(listingRef);
                        
                        if (listingSnap.exists()) {
                            bookingData.listingData = {
                                id: listingSnap.id,
                                ...listingSnap.data(),
                            };
                            console.log("✅ Listing data fetched for booking:", bookingData.id);
                        } else {
                            console.warn("⚠️ Listing not found for booking:", bookingData.id);
                        }
                    } else {
                        console.warn("⚠️ Missing listingId or listingType for booking:", bookingData.id);
                    }
                } catch (error) {
                    console.error("❌ Error fetching listing:", error);
                }

                allBookings.push(bookingData);
            }

            console.log("📊 Summary:");
            console.log(`   - Total bookings for this host: ${allBookings.length}`);
            console.log("📋 All bookings data:", allBookings);

            // Sort by creation date (newest first)
            allBookings.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.toDate() - a.createdAt.toDate();
            });

            setBookings(allBookings);
            setLoading(false);
            setIsFetching(false);
            console.log("✅ Bookings state updated");
        } catch (error) {
            console.error("❌ Fatal error fetching bookings:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            setLoading(false);
            setIsFetching(false);
        }
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by category (listing type)
        filtered = filtered.filter((booking) => {
            const listingType = booking.listingType?.toLowerCase();
            if (categoryFilter === "accommodations") {
                return listingType === "accommodation";
            } else if (categoryFilter === "experiences") {
                return listingType === "experience";
            } else if (categoryFilter === "services") {
                return listingType === "service";
            }
            return true;
        });

        // Filter by status
        if (statusFilter !== "All Status") {
            filtered = filtered.filter((booking) => {
                const status = getBookingStatus(booking);
                return status === statusFilter;
            });
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((booking) => {
                return (
                    booking.guestEmail?.toLowerCase().includes(query) ||
                    booking.listingTitle?.toLowerCase().includes(query) ||
                    booking.id?.toLowerCase().includes(query) ||
                    booking.listingData?.title?.toLowerCase().includes(query)
                );
            });
        }

        setFilteredBookings(filtered);
    };

    const getBookingStatus = (booking) => {
        // Debug logging
        console.log("🔍 Checking booking status for:", booking.id, {
            paymentStatus: booking.paymentStatus,
            paymentTransferred: booking.paymentTransferred,
            confirmedAt: booking.confirmedAt,
        });
        
        // Check for cancelled first
        if (booking.paymentStatus === "cancelled") {
            console.log("❌ Status: Cancelled");
            return "Cancelled";
        }
        
        // If payment was transferred to host, booking is CONFIRMED
        // paymentTransferred = true means PayPal payout was successful
        // payoutStatus (PENDING/SUCCESS) is just PayPal's internal processing status
        if (booking.paymentTransferred === true) {
            console.log("✅ Status: Confirmed (paymentTransferred = true)");
            return "Confirmed";
        }
        if (booking.confirmedAt) {
            console.log("✅ Status: Confirmed (confirmedAt exists)");
            return "Confirmed";
        }
        
        // Default to pending
        console.log("⏳ Status: Pending");
        return "Pending";
    };

    const getPaymentStatus = (booking) => {
        if (booking.paymentStatus === "cancelled") return "Cancelled";
        
        // If payment was transferred to host, show as Received
        if (booking.paymentTransferred === true) return "Received";
        if (booking.confirmedAt) return "Received";
        
        return "On Hold";
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "Received":
                return "success";
            case "On Hold":
                return "warning";
            case "Cancelled":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "success";
            case "Pending":
                return "warning";
            case "Completed":
                return "info";
            case "Cancelled":
                return "error";
            default:
                return "default";
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

    const handleConfirmBooking = async (booking) => {
        const result = await Swal.fire({
            title: "Confirm Booking?",
            html: `
                <div style="text-align: left;">
                    <p><strong>Guest:</strong> ${booking.guestEmail}</p>
                    <p><strong>Property:</strong> ${booking.listingTitle || booking.listingData?.title}</p>
                    <p><strong>Check-in:</strong> ${formatDate(booking.bookingDates?.start)}</p>
                    <p><strong>Check-out:</strong> ${formatDate(booking.bookingDates?.end)}</p>
                    <p><strong>Amount:</strong> ₱${booking.amount?.toLocaleString()}</p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Confirm",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            buttonsStyling: false,
            didOpen: () => {
                const popup = Swal.getPopup();
                const confirmBtn = Swal.getConfirmButton();
                const cancelBtn = Swal.getCancelButton();

                Object.assign(popup.style, {
                    borderRadius: "12px",
                    padding: "20px",
                });

                Object.assign(confirmBtn.style, {
                    backgroundColor: "#30410D",
                    color: "white",
                    borderRadius: "6px",
                    padding: "10px 24px",
                    border: "none",
                    fontWeight: "600",
                    margin: "12px 8px",
                    cursor: "pointer",
                });

                Object.assign(cancelBtn.style, {
                    backgroundColor: "#d33",
                    color: "white",
                    borderRadius: "6px",
                    padding: "10px 24px",
                    border: "none",
                    fontWeight: "600",
                    margin: "12px 8px",
                    cursor: "pointer",
                });
            },
        });

        if (!result.isConfirmed) return;

        // Show processing dialog
        Swal.fire({
            title: "Processing...",
            html: "Confirming booking...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            console.log("🔄 Starting booking confirmation...");
            console.log("📧 Guest email:", booking.guestEmail);
            console.log("📧 Host email:", userEmail);
            console.log("🆔 Booking ID:", booking.id);
            console.log("💰 Amount:", booking.amount);

            // Get host's PayPal email from their profile
            const hostDocRef = doc(db, "users", userEmail);
            const hostDoc = await getDoc(hostDocRef);
            
            if (!hostDoc.exists()) {
                throw new Error("Host profile not found");
            }

            const hostData = hostDoc.data();
            const hostPayPalEmail = hostData.paypalEmail;

            console.log("💳 Host PayPal Email:", hostPayPalEmail);

            if (!hostPayPalEmail) {
                Swal.fire({
                    icon: "warning",
                    title: "PayPal Email Required",
                    html: `
                        <p>Please add your PayPal email in Profile Settings before confirming bookings.</p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">
                            This is required to receive payments from guests.
                        </p>
                    `,
                    confirmButtonColor: "#30410D",
                });
                return;
            }

            // Process PayPal payout FIRST before updating booking status
            console.log("💸 Processing PayPal payout...");
            Swal.update({
                html: "Processing payment transfer to your PayPal account...",
            });

            const payoutResult = await processPayPalPayout({
                recipientEmail: hostPayPalEmail,
                amount: booking.amount,
                currency: "PHP",
                bookingId: booking.id,
                note: `Payment for booking ${booking.id} - ${booking.listingTitle}`,
            });

            console.log("💸 Payout result:", payoutResult);
            console.log("💸 Payout success:", payoutResult.success);
            console.log("💸 Payout ID:", payoutResult.payoutId);
            console.log("💸 Payout status:", payoutResult.status);

            // ONLY update booking status if payout is successful
            if (payoutResult.success) {
                // Update guest's booking record
                if (booking.bookingId) {
                    const guestBookingRef = doc(db, "users", booking.guestEmail, "bookings", booking.bookingId);
                    console.log("📝 Updating guest booking...");
                    console.log("📝 Guest booking data to update:", {
                        paymentStatus: "confirmed",
                        confirmedAt: new Date(),
                        paymentTransferred: true,
                        payoutBatchId: payoutResult.payoutId,
                        payoutStatus: payoutResult.status,
                        payoutDate: new Date(),
                    });
                    await updateDoc(guestBookingRef, {
                        paymentStatus: "confirmed",
                        confirmedAt: new Date(),
                        paymentTransferred: true,
                        payoutBatchId: payoutResult.payoutId,
                        payoutStatus: payoutResult.status,
                        payoutDate: new Date(),
                    });
                    console.log("✅ Guest booking updated with confirmed status");
                }

                // Update host's booking record
                const hostBookingRef = doc(db, "users", userEmail, "bookings", booking.id);
                console.log("📝 Updating host booking...");
                console.log("📝 Host booking data to update:", {
                    confirmedAt: new Date(),
                    paymentTransferred: true,
                    payoutBatchId: payoutResult.payoutId,
                    payoutStatus: payoutResult.status,
                    payoutDate: new Date(),
                });
                await updateDoc(hostBookingRef, {
                    confirmedAt: new Date(),
                    paymentTransferred: true,
                    payoutBatchId: payoutResult.payoutId,
                    payoutStatus: payoutResult.status,
                    payoutDate: new Date(),
                });
                console.log("✅ Host booking updated");
                console.log("✅ Payment transfer recorded");

                // Send confirmation email to guest
                console.log("📧 Sending confirmation email to guest...");
                Swal.update({
                    html: "Sending confirmation email to guest...",
                });

                const bookingTitle = booking.listingTitle || booking.listingData?.title || "your booking";
                const guestName = booking.guestEmail?.split("@")[0] || "Guest";
                const checkInDate = formatDate(booking.bookingDates?.start);
                const checkOutDate = formatDate(booking.bookingDates?.end);
                const totalAmount = `₱${booking.amount?.toLocaleString() || "0"}`;

                try {
                    const emailResult = await sendBookingConfirmationEmail(
                        booking.guestEmail,
                        guestName,
                        bookingTitle,
                        checkInDate,
                        checkOutDate,
                        totalAmount
                    );

                    if (emailResult.success) {
                        console.log("✅ Confirmation email sent successfully");
                    } else {
                        console.warn("⚠️ Email sending failed:", emailResult.error);
                        // Continue even if email fails
                    }
                } catch (emailError) {
                    console.error("❌ Error sending confirmation email:", emailError);
                    // Continue even if email fails
                }

                Swal.fire({
                    icon: "success",
                    title: "Booking Confirmed!",
                    html: `
                        <p>The booking has been confirmed successfully.</p>
                        <p style="color: #70873F; font-weight: 600; margin-top: 12px;">
                            💰 Payment of ₱${booking.amount?.toLocaleString()} has been transferred to your PayPal account (${hostPayPalEmail}).
                        </p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">
                            Payout Batch ID: ${payoutResult.payoutId}
                        </p>
                        <p style="color: #70873F; font-size: 0.9em; margin-top: 8px;">
                            📧 Guest has been notified via email.
                        </p>
                    `,
                    confirmButtonColor: "#30410D",
                });

                console.log("🔄 Refreshing bookings list...");
                // Refresh bookings list
                await fetchHostBookings();
                console.log("✅ Booking confirmation complete!");
            } else {
                // Payout failed - DO NOT update booking status
                console.error("❌ Payout failed:", payoutResult.error);
                
                Swal.fire({
                    icon: "error",
                    title: "Payment Transfer Failed",
                    html: `
                        <p style="color: #d33; font-weight: 600;">
                            ⚠️ ${payoutResult.error}
                        </p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 12px;">
                            The booking has NOT been confirmed. Please check:
                        </p>
                        <ul style="text-align: left; color: #666; font-size: 0.9em; margin-top: 8px;">
                            <li>Backend server is running (port 5000)</li>
                            <li>PayPal credentials are configured</li>
                            <li>Your PayPal email is correct</li>
                        </ul>
                    `,
                    confirmButtonColor: "#30410D",
                });
            }
        } catch (error) {
            console.error("❌ Error confirming booking:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                html: `
                    <p>Failed to confirm booking.</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 8px;">
                        ${error.message || "Please try again."}
                    </p>
                `,
                confirmButtonColor: "#d33",
            });
        }
    };

    // PayPal Payout Function
    const processPayPalPayout = async (payoutData) => {
        try {
            // Backend API endpoint
            const API_URL = process.env.REACT_APP_PAYPAL_API_URL || 'http://localhost:5000';
            
            console.log('🌐 Sending payout request to:', `${API_URL}/api/paypal/payout`);
            console.log('📦 Payout data:', payoutData);
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(`${API_URL}/api/paypal/payout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payoutData),
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            console.log('📡 Response status:', response.status);
            
            const result = await response.json();
            console.log('📥 Response data:', result);
            
            if (!response.ok) {
                throw new Error(result.error || 'Payout request failed');
            }
            
            return result;

        } catch (error) {
            console.error("❌ PayPal payout error:", error);
            
            let errorMessage = "Payout processing failed";
            
            if (error.name === 'AbortError') {
                errorMessage = "Request timed out. Please check if the backend server is running.";
            } else if (error.message.includes('fetch')) {
                errorMessage = "Cannot connect to payment server. Please ensure the backend server is running on port 5000.";
            } else {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const handleViewDetails = (booking) => {
        if (booking.listingData) {
            setSelectedListing(booking.listingData);
            setViewModalOpen(true);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Listing Not Available",
                text: "Listing details are not available for this booking.",
                confirmButtonColor: "#30410D",
            });
        }
    };

    const handleRejectBooking = async (booking) => {
        const result = await Swal.fire({
            title: "Reject Booking?",
            html: `
                <div style="text-align: left;">
                    <p><strong>Guest:</strong> ${booking.guestEmail}</p>
                    <p><strong>Property:</strong> ${booking.listingTitle || booking.listingData?.title}</p>
                    <p><strong>Check-in:</strong> ${formatDate(booking.bookingDates?.start)}</p>
                    <p><strong>Check-out:</strong> ${formatDate(booking.bookingDates?.end)}</p>
                    <p><strong>Amount:</strong> ₱${booking.amount?.toLocaleString()}</p>
                </div>
                <p style="color: #d33; margin-top: 16px;"><strong>This will cancel the booking and refund the guest.</strong></p>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Reject",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            buttonsStyling: false,
            didOpen: () => {
                const popup = Swal.getPopup();
                const confirmBtn = Swal.getConfirmButton();
                const cancelBtn = Swal.getCancelButton();

                Object.assign(popup.style, {
                    borderRadius: "12px",
                    padding: "20px",
                });

                Object.assign(confirmBtn.style, {
                    backgroundColor: "#d33",
                    color: "white",
                    borderRadius: "6px",
                    padding: "10px 24px",
                    border: "none",
                    fontWeight: "600",
                    margin: "12px 8px",
                    cursor: "pointer",
                });

                Object.assign(cancelBtn.style, {
                    backgroundColor: "#666",
                    color: "white",
                    borderRadius: "6px",
                    padding: "10px 24px",
                    border: "none",
                    fontWeight: "600",
                    margin: "12px 8px",
                    cursor: "pointer",
                });
            },
        });

        if (!result.isConfirmed) return;

        // Show processing dialog
        Swal.fire({
            title: "Processing...",
            html: "Rejecting booking and processing refund...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            console.log("🔄 Starting booking rejection process...");
            console.log("📧 Guest email:", booking.guestEmail);
            console.log("🆔 Booking ID:", booking.id);
            console.log("🆔 Guest Booking ID:", booking.bookingId);
            console.log("💰 Amount to refund:", booking.amount);

            const bookingTitle = booking.listingTitle || booking.listingData?.title || "your booking";
            const guestName = booking.guestEmail?.split("@")[0] || "Guest";
            const totalPayable = `₱${booking.amount?.toLocaleString() || "0"}`;

            // 💰 Process PayPal Refund
            let refundSuccess = false;
            let refundId = null;

            console.log('🔍 Checking refund eligibility:');
            console.log('  - paypalTransactionId:', booking.paypalTransactionId);
            console.log('  - paymentStatus:', booking.paymentStatus);
            console.log('  - amount:', booking.amount || booking.totalAmount);

            if (booking.paypalTransactionId) {
                try {
                    console.log('💸 Processing PayPal refund...');
                    Swal.update({
                        html: "Processing PayPal refund...",
                    });

                    // PayPal credentials
                    const PAYPAL_CLIENT_ID = "AS3N5e6j5mD8MZwH8V2rJOru1tmZbQHcid1nob6gTAUdKDzPb1YnWSGXam1ZC7JIQdM3TQT2gY1YAzdf";
                    const PAYPAL_SECRET = "EFWGpjDlX0vv2Q5494kQO1QTjqdzvW1FYvtf26JW_p_AnPmuZSnWJxXl2ryR6Mequ-rswCHsG8HFC1Gh";
                    const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

                    // 1. Get PayPal access token
                    console.log('🔐 Getting PayPal access token...');
                    const authString = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
                    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${authString}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'grant_type=client_credentials'
                    });

                    const tokenData = await tokenResponse.json();
                    const accessToken = tokenData.access_token;

                    if (!accessToken) {
                        console.error('❌ No access token received:', tokenData);
                        throw new Error('Failed to get PayPal access token');
                    }

                    console.log('✅ Access token received');

                    // 2. Process refund via PayPal API
                    const refundAmount = parseFloat(booking.amount || booking.totalAmount).toFixed(2);
                    const refundCurrency = booking.currency || 'PHP';

                    console.log(`💰 Requesting refund: ${refundCurrency} ${refundAmount}`);
                    console.log(`🎫 Capture ID: ${booking.paypalTransactionId}`);

                    const refundResponse = await fetch(
                        `${PAYPAL_API_BASE}/v2/payments/captures/${booking.paypalTransactionId}/refund`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`
                            },
                            body: JSON.stringify({
                                amount: {
                                    value: refundAmount,
                                    currency_code: refundCurrency
                                },
                                note_to_payer: `Refund for rejected booking by host`
                            })
                        }
                    );

                    const refundData = await refundResponse.json();

                    console.log('📨 PayPal Response:', refundData);
                    console.log('📊 Response Status:', refundResponse.status);

                    if (refundResponse.ok && refundData.id) {
                        refundSuccess = true;
                        refundId = refundData.id;
                        console.log('✅ REFUND SUCCESSFUL!');
                        console.log('✅ Refund ID:', refundId);
                        console.log('✅ Amount refunded:', refundData.amount?.value, refundData.amount?.currency_code);
                        console.log('✅ Status:', refundData.status);
                    } else {
                        console.error('❌ REFUND FAILED!');
                        console.error('❌ Status Code:', refundResponse.status);
                        console.error('❌ Error Details:', refundData);
                    }

                } catch (refundError) {
                    console.error('❌ REFUND ERROR:', refundError);
                    console.error('❌ Error details:', refundError.message);
                }
            } else {
                console.warn('⚠️ No PayPal transaction ID found - skipping refund');
            }

            // 1. Update guest's booking record (use bookingId if available, otherwise use id)
            const guestBookingId = booking.bookingId || booking.id;
            const guestBookingRef = doc(db, "users", booking.guestEmail, "bookings", guestBookingId);
            console.log("📝 Updating guest booking status...");
            console.log("📝 Guest booking path:", `users/${booking.guestEmail}/bookings/${guestBookingId}`);
            
            Swal.update({
                html: "Updating booking status...",
            });
            
            try {
                await updateDoc(guestBookingRef, {
                    paymentStatus: refundSuccess ? "refunded" : "cancelled",
                    refundId: refundId || null,
                    refundedAt: refundSuccess ? new Date() : null,
                    rejectedAt: new Date(),
                    rejectedBy: userEmail,
                });
                console.log("✅ Guest booking status updated");
            } catch (guestUpdateError) {
                console.error("⚠️ Failed to update guest booking:", guestUpdateError);
                // Continue even if guest booking update fails
            }

            // 2. Update host's booking record
            const hostBookingRef = doc(db, "users", userEmail, "bookings", booking.id);
            console.log("📝 Updating host booking status to cancelled...");
            console.log("📝 Host booking path:", `users/${userEmail}/bookings/${booking.id}`);
            
            try {
                await updateDoc(hostBookingRef, {
                    paymentStatus: "cancelled",
                    rejectedAt: new Date(),
                    rejectedBy: userEmail,
                });
                console.log("✅ Host booking status updated");
            } catch (hostUpdateError) {
                console.error("⚠️ Failed to update host booking:", hostUpdateError);
                // Continue even if host booking update fails
            }

            // 3. Restore availability dates in listing calendar
            console.log("📅 Restoring availability dates...");
            Swal.update({
                html: "Restoring calendar availability...",
            });

            try {
                if (booking.listingId && booking.listingType && booking.bookingDates) {
                    const listingType = booking.listingType === "accommodation" ? "accommodation" : booking.listingType;
                    const collectionName = `${listingType}s`;
                    const listingRef = doc(db, "users", userEmail, collectionName, booking.listingId);
                    
                    console.log(`📍 Listing path: users/${userEmail}/${collectionName}/${booking.listingId}`);
                    
                    const listingSnap = await getDoc(listingRef);
                    
                    if (listingSnap.exists()) {
                        const startDate = booking.bookingDates.start.toDate ? booking.bookingDates.start.toDate() : new Date(booking.bookingDates.start);
                        const endDate = booking.bookingDates.end ? (booking.bookingDates.end.toDate ? booking.bookingDates.end.toDate() : new Date(booking.bookingDates.end)) : startDate;
                        
                        console.log('🔓 Unblocking dates from', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

                        const datesToUnblock = [];

                        // Generate all dates in the range
                        const currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                            datesToUnblock.push(new Date(currentDate).toISOString().split('T')[0]); // Format as YYYY-MM-DD
                            currentDate.setDate(currentDate.getDate() + 1);
                        }

                        console.log('📅 Dates to unblock:', datesToUnblock);

                        // Get current blocked dates
                        const currentBlockedDates = listingSnap.data().blockedDates || [];
                        console.log('📋 Current blocked dates:', currentBlockedDates);
                        
                        // Filter out the dates to unblock
                        const newBlockedDates = currentBlockedDates.filter(date => !datesToUnblock.includes(date));
                        console.log('📋 New blocked dates:', newBlockedDates);
                        console.log(`📊 Removed ${currentBlockedDates.length - newBlockedDates.length} dates`);
                        
                        // Update with the filtered list
                        await updateDoc(listingRef, {
                            blockedDates: newBlockedDates
                        });
                        
                        console.log("✅ Availability dates restored in calendar");
                    } else {
                        console.warn("⚠️ Listing not found - cannot restore dates");
                    }
                } else {
                    console.warn("⚠️ Missing listing info or booking dates - cannot restore availability");
                }
            } catch (availabilityError) {
                console.error("⚠️ Failed to restore availability:", availabilityError);
                // Continue even if availability restoration fails
            }

            // 4. Create notification for guest
            console.log("🔔 Creating notification for guest...");
            try {
                // Try to get the guest's UID from the booking data first
                let guestUid = booking.guestUid;
                
                // If not available in booking, try to fetch from user document
                if (!guestUid) {
                    console.log("🔍 Guest UID not in booking, looking up from email:", booking.guestEmail);
                    try {
                        const guestDocRef = doc(db, "users", booking.guestEmail);
                        const guestDocSnap = await getDoc(guestDocRef);
                        
                        if (guestDocSnap.exists()) {
                            guestUid = guestDocSnap.data().uid || guestDocSnap.data().userId;
                            console.log("✅ Found guest UID from user doc:", guestUid);
                        }
                    } catch (lookupError) {
                        console.warn("⚠️ Could not lookup guest UID:", lookupError.message);
                    }
                }
                
                // Final fallback: use email as document ID
                if (!guestUid) {
                    console.warn("⚠️ Could not find guest UID, using email as fallback");
                    guestUid = booking.guestEmail;
                }
                
                console.log("📍 Creating notification at path: users/" + guestUid + "/notifications");
                
                const notificationsRef = collection(db, "users", guestUid, "notifications");
                
                // Enhanced notification message with more details
                const checkInDate = booking.bookingDates?.start ? 
                    (booking.bookingDates.start.toDate ? booking.bookingDates.start.toDate() : new Date(booking.bookingDates.start)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 
                    'N/A';
                
                const notificationMessage = `Your booking for "${bookingTitle}" (Check-in: ${checkInDate}) has been rejected by the host. Your payment of ${totalPayable} will be refunded within 24 hours. Please check your email for more details.`;
                
                await addDoc(notificationsRef, {
                    type: "booking_rejected",
                    title: "Booking Rejected",
                    message: notificationMessage,
                    bookingId: booking.id,
                    listingTitle: bookingTitle,
                    listingType: booking.listingType,
                    amount: booking.amount,
                    checkInDate: checkInDate,
                    createdAt: new Date(),
                    read: false,
                });
                console.log("✅ Notification created successfully for guest");
            } catch (notifError) {
                console.error("⚠️ Failed to create notification:", notifError);
                console.error("Error details:", notifError.message);
                // Continue even if notification fails
            }

            // 6. Send rejection email to guest
            console.log("📧 Sending rejection email to guest...");
            Swal.update({
                html: "Sending email notification...",
            });

            const emailResult = await sendBookingRejectionEmail(
                booking.guestEmail,
                guestName,
                bookingTitle,
                totalPayable
            );

            if (emailResult.success) {
                console.log("✅ Rejection email sent successfully");
            } else {
                console.warn("⚠️ Email sending failed:", emailResult.error);
                // Continue even if email fails
            }

            // 5. Show success message with refund info
            if (refundSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Booking Rejected & Refunded",
                    html: `
                        <p>The booking has been rejected and cancelled.</p>
                        <p style="color: #70873F; font-weight: 600; margin-top: 12px;">
                            ✅ Refund of ₱${parseFloat(booking.amount || booking.totalAmount).toLocaleString()} has been processed.
                        </p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">
                            The refund will be sent to the guest's PayPal account within 3-5 business days.
                        </p>
                        <p style="color: #70873F; font-size: 0.9em; margin-top: 8px;">📅 Calendar availability has been restored.</p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 4px;">The guest has been notified via email.</p>
                    `,
                    confirmButtonColor: "#30410D",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Booking Rejected",
                    html: `
                        <p>The booking has been rejected and cancelled.</p>
                        <p style="color: #70873F; font-size: 0.9em; margin-top: 8px;">📅 Calendar availability has been restored.</p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">The guest has been notified via email.</p>
                    `,
                    confirmButtonColor: "#30410D",
                });
            }

            console.log("✅ Booking rejection complete!");

            // Refresh bookings list
            await fetchHostBookings();
        } catch (error) {
            console.error("❌ Error rejecting booking:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                html: `
                    <p>Failed to reject booking.</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 8px;">
                        ${error.message || "Please try again."}
                    </p>
                `,
                confirmButtonColor: "#d33",
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6">Loading bookings...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Bookings
                </Typography>

                {/* Profile Menu */}
                {userEmail && (
                    <ProfileMenu
                        userEmail={isMobile ? null : userEmail}
                        onProfileSettingsClick={onProfileSettingsClick}
                        notifications={notifications}
                        notificationsCount={notificationsCount}
                        onNotificationClick={handleNotificationClick}
                        onRefreshNotifications={handleRefreshNotifications}
                    />
                )}
            </Box>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Manage all guest bookings and reservations
            </Typography>

            {/* Category Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, bgcolor: "white", borderRadius: 2 }}>
                <Tabs
                    value={categoryFilter}
                    onChange={(e, newValue) => setCategoryFilter(newValue)}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontSize: "1rem",
                            fontWeight: 500,
                            minWidth: 120,
                            color: "#666",
                        },
                        "& .Mui-selected": {
                            color: "#30410D !important",
                            fontWeight: 600,
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "#30410D",
                            height: 3,
                        },
                    }}
                >
                    <Tab label="Accommodations" value="accommodations" />
                    <Tab label="Experiences" value="experiences" />
                    <Tab label="Services" value="services" />
                </Tabs>
            </Box>

            {/* Search and Filter Bar */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                    fullWidth
                    placeholder="Search by guest name, email, booking ID, or property..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#888" }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        bgcolor: "white",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "#e0e0e0",
                            },
                        },
                    }}
                />
                <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                            bgcolor: "white",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e0e0e0",
                            },
                        }}
                    >
                        <MenuItem value="All Status">All Status</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <Box
                    sx={{
                        bgcolor: "white",
                        borderRadius: 2,
                        p: 6,
                        textAlign: "center",
                        boxShadow: 1,
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        {searchQuery || statusFilter !== "All Status"
                            ? "No bookings found matching your filters"
                            : "No bookings yet"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchQuery || statusFilter !== "All Status"
                            ? "Try adjusting your search or filter"
                            : "Guest bookings will appear here once they book your listings"}
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: 600 }}>Guest</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                                {categoryFilter === "accommodations" ? (
                                    <>
                                        <TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Check-out</TableCell>
                                    </>
                                ) : (
                                    <TableCell sx={{ fontWeight: 600 }}>Reservation Date</TableCell>
                                )}
                                <TableCell sx={{ fontWeight: 600 }}>Guests</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Payment Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Booking Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBookings.map((booking) => (
                                <TableRow
                                    key={booking.id}
                                    sx={{
                                        "&:hover": {
                                            bgcolor: "#f9f9f9",
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {booking.guestEmail?.split("@")[0]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {booking.guestEmail}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {booking.listingTitle || booking.listingData?.title || "Listing"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {booking.listingType?.charAt(0).toUpperCase() + booking.listingType?.slice(1)}
                                        </Typography>
                                    </TableCell>
                                    {categoryFilter === "accommodations" ? (
                                        <>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(booking.bookingDates?.start)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(booking.bookingDates?.end)}
                                                </Typography>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(booking.bookingDates?.start)}
                                            </Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {booking.numberOfGuests || 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#30410D" }}>
                                            ₱{booking.amount?.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getPaymentStatus(booking)}
                                            color={getPaymentStatusColor(getPaymentStatus(booking))}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getBookingStatus(booking)}
                                            color={getStatusColor(getBookingStatus(booking))}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            {/* View Details Button - Always Visible */}
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(booking)}
                                                sx={{
                                                    borderColor: "#30410D",
                                                    color: "#30410D",
                                                    textTransform: "none",
                                                    fontSize: "0.75rem",
                                                    "&:hover": {
                                                        borderColor: "#70873F",
                                                        bgcolor: "rgba(112,135,63,0.1)",
                                                    },
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            
                                            {getBookingStatus(booking) === "Pending" && (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleConfirmBooking(booking)}
                                                        sx={{
                                                            bgcolor: "#30410D",
                                                            color: "white",
                                                            textTransform: "none",
                                                            fontSize: "0.75rem",
                                                            "&:hover": {
                                                                bgcolor: "#70873F",
                                                            },
                                                        }}
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleRejectBooking(booking)}
                                                        sx={{
                                                            bgcolor: "#d32f2f",
                                                            color: "white",
                                                            textTransform: "none",
                                                            fontSize: "0.75rem",
                                                            "&:hover": {
                                                                bgcolor: "#9a0007",
                                                            },
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {getBookingStatus(booking) === "Confirmed" && (
                                                <Chip
                                                    label="Confirmed"
                                                    color="success"
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                            {getBookingStatus(booking) === "Cancelled" && (
                                                <Chip
                                                    label="Cancelled"
                                                    color="error"
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                            {getBookingStatus(booking) === "Completed" && (
                                                <Chip
                                                    label="Completed"
                                                    color="info"
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Listing Details Modal */}
            <ListingModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                listing={selectedListing}
            />
        </Box>
    );
}
