import EditListing from "./EditListing";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";

export default function ListingGrid({ filter, setFilter, fetchListings, setActiveSection }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewingListing, setViewingListing] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    const handleViewListing = (listing) => {
        setViewingListing(listing);
        setViewOpen(true);
    };

    // 🧠 Fetch all listings for the logged-in host
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const types = ["accommodations", "services", "experiences"];
                const allListings = [];

                for (const type of types) {
                    const querySnapshot = await getDocs(
                        collection(db, "users", user.email, type)
                    );
                    querySnapshot.forEach((docItem) => {
                        allListings.push({
                            id: docItem.id,
                            type: type.slice(0, -1), // "accommodations" -> "accommodation"
                            ...docItem.data(),
                        });
                    });
                }

                setListings(allListings);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching listings:", error);
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    // 🗑️ Delete listing handler
    const handleDeleteListing = async (listing) => {
        const confirm = window.confirm(
            `Are you sure you want to delete "${listing.title}"?`
        );
        if (!confirm) return;

        try {
            await deleteDoc(
                doc(db, "users", auth.currentUser.email, `${listing.type}s`, listing.id)
            );
            setListings((prev) => prev.filter((item) => item.id !== listing.id));
            alert("Listing deleted successfully");
        } catch (error) {
            console.error("Error deleting listing:", error);
            alert("Failed to delete listing.");
        }
    };

    const handleEditListing = (listing) => {
        setEditingListing(listing);
        setEditOpen(true);
    };

    // 🌀 Loading state
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

    // 🧩 Empty state
    if (listings.length === 0) {
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

    // 🧩 Filter listings by selected category
    const filteredListings =
        filter === "all"
            ? listings
            : listings.filter((listing) => listing.type === filter);

    // ✅ Render listings
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

            <EditListing
                open={editOpen}
                onClose={() => setEditOpen(false)}
                listing={editingListing}
                onUpdated={() => {
                    fetchListings(); // refresh listings
                    setActiveSection("listings"); // stay on listings view
                }}
            />
            <ListingModal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                listing={viewingListing}
            />
        </Box>
    );
}
