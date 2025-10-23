import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";
import EditListing from "./EditListing";

export default function ListingGrid({ filter, setFilter, setSelectedIndex, reloadTrigger }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);
    const [editingListing, setEditingListing] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewingListing, setViewingListing] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    // 🔹 Fetch listings from Firestore for the current logged-in user
    const fetchListings = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                console.warn("No user found. Skipping fetch.");
                setLoading(false);
                return;
            }

            const types = ["accommodations", "services", "experiences"];
            const allListings = [];

            for (const type of types) {
                const querySnapshot = await getDocs(collection(db, "users", user.email, type));
                querySnapshot.forEach((docItem) => {
                    allListings.push({
                        id: docItem.id,
                        type: type.slice(0, -1), // “accommodations” -> “accommodation”
                        ...docItem.data(),
                    });
                });
            }

            setListings(allListings);
            console.log("Fetched listings:", allListings.length);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Load listings when component mounts
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchListings();
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchListings();
    }, [reloadTrigger]);

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
    const filteredListings = listings.filter((listing) => {
        if (filter === "all") return true;
        if (["accommodation", "service", "experience"].includes(filter))
            return listing.type === filter;
        if (["draft", "published"].includes(filter))
            return listing.status === filter;
        return true;
    });


    // 🔹 Render listings
    return (

        <Box sx={{ p: 3, backgroundColor: "#f9f9f9ff" }}>

            {/* 🔘 Draft / Published Filter */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    All Listings
                </Typography>

                {/* 🔘 Radio buttons aligned with title */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="status"
                            value="published"
                            checked={filter === "published"}
                            onChange={() => setFilter("published")}
                            style={{
                                accentColor: "#70873F",
                                transform: "scale(1.2)",
                                marginRight: "6px",
                                cursor: "pointer",
                            }}
                        />
                        <span>Published</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="status"
                            value="draft"
                            checked={filter === "draft"}
                            onChange={() => setFilter("draft")}
                            style={{
                                accentColor: "#70873F",
                                transform: "scale(1.2)",
                                marginRight: "6px",
                                cursor: "pointer",
                            }}
                        />
                        <span>Drafts</span>
                    </label>
                </Box>
            </Box>

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
