import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";
import EditListing from "./EditListing";

export default function ListingGrid({ filter, setFilter, setSelectedIndex }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewingListing, setViewingListing] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                const types = ["accommodations", "services", "experiences"];
                const unsubscribers = [];

                types.forEach((type) => {
                    const colRef = collection(db, "users", user.email, type);
                    const unsubscribeCollection = onSnapshot(colRef, (snapshot) => {
                        const updated = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            type: type.slice(0, -1),
                            ...doc.data(),
                        }));
                        setListings((prev) => {
                            // Merge all types
                            const others = prev.filter((item) => item.type !== type.slice(0, -1));
                            return [...others, ...updated];
                        });
                    });
                    unsubscribers.push(unsubscribeCollection);
                });

                return () => unsubscribers.forEach((u) => u());
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 🔹 Handle delete listing
    const handleDeleteListing = async (listing) => {
        const confirm = window.confirm(`Are you sure you want to delete "${listing.title}"?`);
        if (!confirm) return;

        try {
            await deleteDoc(doc(db, "users", auth.currentUser.email, `${listing.type}s`, listing.id));
            setListings((prev) => prev.filter((item) => item.id !== listing.id));
            alert("Listing deleted successfully!");
        } catch (error) {
            console.error("Error deleting listing:", error);
            alert("Failed to delete listing.");
        }
    };

    // 🔹 Handle edit listing
    const handleEditListing = (listing) => {
        setEditingListing(listing);
        setEditOpen(true);
    };

    // 🔹 Handle view listing
    const handleViewListing = (listing) => {
        setViewingListing(listing);
        setViewOpen(true);
    };

    // 🔹 Loading state
    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "50vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // 🔹 Empty state
    if (!listings || listings.length === 0) {
        return (
            <Box sx={{ textAlign: "center", mt: 6 }}>
                <Typography variant="h6" color="text.secondary">
                    You haven’t added any listings yet.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Click “Add Listing” to create your first one.
                </Typography>
            </Box>
        );
    }

    // 🔹 Filter listings based on type
    const filteredListings =
        filter === "all"
            ? listings
            : listings.filter((listing) => listing.type === filter);

    // 🔹 Render listings
    return (
        <Box sx={{ p: 3, backgroundColor: "#f9f9f9ff" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                {filter === "all"
                    ? "All Listings"
                    : filter.charAt(0).toUpperCase() + filter.slice(1) + " Listings"}
            </Typography>

            <Grid container spacing={3}>
                {filteredListings.map((listing) => (
                    <Grid item key={listing.id} xs={12} sm={6} md={4}>
                        <ListingCard
                            listing={listing}
                            onEdit={handleEditListing}
                            onDelete={handleDeleteListing}
                            onView={handleViewListing}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* 🔹 Edit Modal */}
            <EditListing
                open={editOpen}
                onClose={() => setEditOpen(false)}
                listing={editingListing}
                onUpdated={async () => {
                    await fetchListings(); // refresh instantly
                }}
            />

            {/* 🔹 View Modal */}
            <ListingModal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                listing={viewingListing}
            />
        </Box>
    );
}
